import type { ReactNode } from 'react';
import { isOutOfService, type ServiceStatusResponse, type OutOfServiceStatus } from './contract';
import { OutOfServicePage } from './OutOfServicePage';
import { useServiceStatus } from './useServiceStatus';

/** Datos que recibe una pantalla de fuera de servicio personalizada. */
export type OutOfServiceInfo = ServiceStatusResponse & { status: OutOfServiceStatus };

export interface StatusGuardProps {
  /** URL completa del endpoint de estado (p. ej. `import.meta.env.VITE_KODARY_STATUS_URL`). Sin URL no bloquea. */
  url: string | undefined;
  children: ReactNode;
  /** Reemplaza la pantalla por defecto: un nodo o una función que recibe el estado. */
  fallback?: ReactNode | ((info: OutOfServiceInfo) => ReactNode);
  /** Nombre a mostrar en la pantalla; por defecto, el que reporta KODARY. */
  siteName?: string;
  /** Intervalo de consulta en ms (por defecto 60 s). */
  intervalMs?: number;
}

/**
 * Muestra el sitio mientras el servicio esté activo, cargando o en estado desconocido (sin parpadeo de la pantalla
 * de mantenimiento al cargar) y la pantalla de fuera de servicio cuando KODARY lo reporta suspendido o inactivo.
 */
export function StatusGuard({ url, children, fallback, siteName, intervalMs }: StatusGuardProps) {
  const { data } = useServiceStatus(url, { intervalMs });
  if (!isOutOfService(data)) return <>{children}</>;
  if (typeof fallback === 'function') return <>{fallback(data)}</>;
  if (fallback !== undefined) return <>{fallback}</>;
  return <OutOfServicePage status={data.status} name={siteName ?? data.name} message={data.message} />;
}
