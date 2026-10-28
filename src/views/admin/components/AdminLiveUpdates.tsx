import { useQueryClient, type QueryClient, type QueryKey } from '@tanstack/react-query'

import type { LiveChange, LiveEvent } from '@/@types/live-events'
import { queryKeys } from '@/constants/query-keys.constant'
import { LiveEventsService } from '@/services/LiveEventsService'
import { useEventStream } from '@/utils/hooks/useEventStream'
import { invalidateKeys, invalidateStoreData, LIVE_CHANGES } from '@/utils/liveUpdates'

const ADMIN_EVENTS_URL = LiveEventsService.adminUrl()

/**
 * The back-office copies each change makes stale. Forms take their initial values once (and are
 * keyed), so a background refetch never overwrites what is being typed.
 */
const ADMIN_KEYS: Record<LiveChange, readonly QueryKey[]> = {
    catalog: [
        queryKeys.admin.products.all(),
        queryKeys.admin.categories(),
        queryKeys.admin.brands(),
    ],
    catalogs: [],
    content: [queryKeys.admin.content()],
    'exchange-rate': [queryKeys.admin.exchangeRate(), queryKeys.admin.orders.summary()],
}

function invalidateChange(queryClient: QueryClient, change: LiveChange): void {
    invalidateStoreData(queryClient, change)
    // The admin's own edits in flight sync their data when they finish; refetching now could
    // undo an optimistic update (e.g. a photo reorder) for a moment.
    if (queryClient.isMutating() === 0) invalidateKeys(queryClient, ADMIN_KEYS[change])
}

function invalidateOrder(queryClient: QueryClient, code: string | null): void {
    invalidateKeys(queryClient, [
        queryKeys.admin.orders.lists(),
        queryKeys.admin.orders.summary(),
        ...(code ? [queryKeys.admin.orders.detail(code)] : [queryKeys.admin.orders.all()]),
    ])
}

/**
 * The admin live stream: new orders, payments and status changes (from customers, the expiry
 * job, Telegram or another admin) and every catalog/content change show up without polling.
 * Mounted inside `RequireAdmin`, so it only connects with a session; it stays connected in a
 * hidden tab so the list and the nav badge are current on return.
 */
export function AdminLiveUpdates() {
    const queryClient = useQueryClient()

    useEventStream<LiveEvent>(
        ADMIN_EVENTS_URL,
        (event) => {
            if (event.type === 'order') invalidateOrder(queryClient, event.code)
            else invalidateChange(queryClient, event.type)
        },
        {
            withCredentials: true,
            keepWhenHidden: true,
            onReconnect: () => {
                invalidateOrder(queryClient, null)
                for (const change of LIVE_CHANGES) invalidateChange(queryClient, change)
            },
        },
    )

    return null
}
