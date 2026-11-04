import {
  parseServiceStatus,
  UNKNOWN_STATUS,
  type ServiceStatusResult,
} from './contract';

export * from './contract';

let warnedNotFound = false;

/** Un 404 casi siempre es una clave mal copiada: se avisa una sola vez para no llenar la consola. */
function warnNotFoundOnce(url: string) {
  if (warnedNotFound) return;
  warnedNotFound = true;
  console.warn(
    `[status-guard] ${url} respondió 404: revisa la clave de estado del proyecto. El sitio sigue funcionando (fail-open).`,
  );
}

/**
 * Consulta el estado del servicio en KODARY.
 *
 * Nunca lanza por fallas del endpoint: red caída, respuesta no 2xx o JSON inválido devuelven `{ status: 'unknown' }`,
 * que se trata como activo (fail-open). Solo relanza la cancelación (`signal`), que TanStack Query espera.
 */
export async function fetchServiceStatus(
  url: string,
  signal?: AbortSignal,
): Promise<ServiceStatusResult> {
  try {
    const res = await fetch(url, {
      signal,
      headers: { accept: 'application/json' },
    });
    if (res.status === 404) warnNotFoundOnce(url);
    if (!res.ok) return UNKNOWN_STATUS;
    return parseServiceStatus(await res.json()) ?? UNKNOWN_STATUS;
  } catch (err) {
    if (signal?.aborted) throw err;
    return UNKNOWN_STATUS;
  }
}
