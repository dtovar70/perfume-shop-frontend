import { buildUrl } from '@/services/ApiClient'

/** URLs of the API's Server-Sent Events streams (see `useEventStream`). */
export const LiveEventsService = {
    /** Catalog, catalogs, content and exchange-rate changes. Public. */
    storeUrl: () => buildUrl('/events'),
    /** Everything, orders included. Needs the session cookie (`withCredentials`). */
    adminUrl: () => buildUrl('/admin/events'),
    /** One order's changes; the private link's token goes in the query like `GET /orders/:code`. */
    orderUrl: (code: string, token: string) =>
        buildUrl(`/orders/${encodeURIComponent(code)}/events`, { t: token }),
} as const
