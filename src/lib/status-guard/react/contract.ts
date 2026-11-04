/**
 * Contrato del endpoint público de estado de KODARY: `GET <url>` → `{ status, name, message }`.
 *
 * Este archivo es IDÉNTICO en `react/` y en `nest/` (cada carpeta se copia por separado). Si cambia el contrato,
 * actualiza ambos.
 */

/** Estado del servicio tal como lo reporta KODARY. */
export type ServiceStatus = 'active' | 'suspended' | 'inactive';

/** Estados en los que el sitio debe quedar fuera de servicio. */
export type OutOfServiceStatus = Exclude<ServiceStatus, 'active'>;

/** Respuesta del endpoint. */
export interface ServiceStatusResponse {
  status: ServiceStatus;
  /** Nombre del proyecto en KODARY. */
  name: string;
  /** Texto para la pantalla de fuera de servicio; `null` mientras está activo. */
  message: string | null;
}

/** No se pudo saber el estado (red caída, error, respuesta inválida): se trata como activo (fail-open). */
export interface UnknownServiceStatus {
  status: 'unknown';
}

export type ServiceStatusResult = ServiceStatusResponse | UnknownServiceStatus;

export const UNKNOWN_STATUS: UnknownServiceStatus = { status: 'unknown' };

/** Textos por defecto si la respuesta no trae mensaje. */
export const DEFAULT_MESSAGES: Record<OutOfServiceStatus, string> = {
  suspended:
    'Este servicio está temporalmente suspendido. Se reactivará en cuanto se regularice la cuenta.',
  inactive: 'Este servicio ya no está disponible.',
};

const STATUSES: readonly string[] = ['active', 'suspended', 'inactive'];

/** Valida la forma de la respuesta sin confiar en ella. Devuelve `null` si no cumple el contrato. */
export function parseServiceStatus(data: unknown): ServiceStatusResponse | null {
  if (typeof data !== 'object' || data === null) return null;
  const { status, name, message } = data as Record<string, unknown>;
  if (typeof status !== 'string' || !STATUSES.includes(status)) return null;
  return {
    status: status as ServiceStatus,
    name: typeof name === 'string' ? name : '',
    message: typeof message === 'string' && message.trim() ? message : null,
  };
}

/** ¿Hay que mostrar la pantalla de fuera de servicio? `unknown` nunca bloquea. */
export function isOutOfService(
  result: ServiceStatusResult | undefined,
): result is ServiceStatusResponse & { status: OutOfServiceStatus } {
  return result?.status === 'suspended' || result?.status === 'inactive';
}

/** Mensaje a mostrar: el de KODARY o, si no viene, el texto por defecto del estado. */
export function outOfServiceMessage(
  status: OutOfServiceStatus,
  message: string | null | undefined,
): string {
  return message?.trim() || DEFAULT_MESSAGES[status];
}
