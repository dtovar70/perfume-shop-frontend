import { useQuery } from '@tanstack/react-query';
import { fetchServiceStatus } from './service-status';

/** Cada cuánto se vuelve a consultar el estado (el endpoint cachea 60 s, consultar más seguido no aporta). */
export const DEFAULT_STATUS_INTERVAL_MS = 60_000;

export interface UseServiceStatusOptions {
  /** Intervalo de consulta en ms. Por defecto 60 s. */
  intervalMs?: number;
}

export const serviceStatusQueryKey = (url: string | undefined) =>
  ['kodary', 'service-status', url] as const;

/**
 * Estado del servicio con TanStack Query: se consulta al cargar, cada `intervalMs` y al volver a la pestaña.
 * Sin `url` no consulta nada (y el sitio se comporta como activo).
 */
export function useServiceStatus(
  url: string | undefined,
  { intervalMs = DEFAULT_STATUS_INTERVAL_MS }: UseServiceStatusOptions = {},
) {
  return useQuery({
    queryKey: serviceStatusQueryKey(url),
    queryFn: ({ signal }) => fetchServiceStatus(url as string, signal),
    enabled: Boolean(url),
    refetchInterval: intervalMs,
    refetchOnWindowFocus: true,
    // fetchServiceStatus no lanza (devuelve 'unknown'): el siguiente intervalo hace de reintento
    retry: false,
    staleTime: Math.min(30_000, intervalMs),
  });
}
