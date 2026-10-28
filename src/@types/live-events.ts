/**
 * Mirrors backend `RealtimeEvent` (src/realtime/realtime.service.ts): a Server-Sent Events
 * message only says WHAT changed; the data is refetched through the regular endpoints.
 */
export type LiveChange = 'catalog' | 'catalogs' | 'content' | 'exchange-rate'

export type LiveEvent = { type: LiveChange } | { type: 'order'; code: string }
