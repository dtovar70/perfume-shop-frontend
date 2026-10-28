import { useQueryClient } from '@tanstack/react-query'

import type { LiveEvent } from '@/@types/live-events'
import { LiveEventsService } from '@/services/LiveEventsService'
import { useEventStream } from '@/utils/hooks/useEventStream'
import { invalidateStoreData, LIVE_CHANGES } from '@/utils/liveUpdates'

const STORE_EVENTS_URL = LiveEventsService.storeUrl()

/**
 * Keeps the storefront in step with the admin's edits (products, photos, prices, stock, texts,
 * rate) without a reload: the API's public stream says what changed and its queries refetch.
 * Mounted once, in the store layout.
 */
export function useStoreLiveUpdates(): void {
    const queryClient = useQueryClient()

    useEventStream<LiveEvent>(
        STORE_EVENTS_URL,
        (event) => {
            if (event.type !== 'order') invalidateStoreData(queryClient, event.type)
        },
        {
            onReconnect: () => {
                for (const change of LIVE_CHANGES) invalidateStoreData(queryClient, change)
            },
        },
    )
}
