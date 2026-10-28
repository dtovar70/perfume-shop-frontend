import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { LiveEvent } from '@/@types/live-events'
import type { SubmitPaymentInput } from '@/@types/order'
import { ORDER_POLL_MS } from '@/constants/order.constant'
import { queryKeys } from '@/constants/query-keys.constant'
import { LiveEventsService } from '@/services/LiveEventsService'
import { OrderService } from '@/services/OrderService'
import { useEventStream } from '@/utils/hooks/useEventStream'

/**
 * The customer's order. It follows the admin's decisions (and the expiry) without a reload:
 * the order's live stream triggers a refetch, with a slow poll while a proof is being verified
 * and a refetch on every return to the tab as fallbacks.
 */
export function useOrder(code: string, token: string) {
    const query = useQuery({
        queryKey: queryKeys.orders.detail(code),
        queryFn: ({ signal }) => OrderService.get(code, token, signal),
        enabled: code.length > 0 && token.length > 0,
        staleTime: 0,
        refetchOnWindowFocus: true,
        refetchInterval: (query) =>
            query.state.data?.status === 'PENDIENTE_VERIFICACION' ? ORDER_POLL_MS : false,
    })
    useOrderEvents(code, token, query.data !== undefined)
    return query
}

/** Refetches the order whenever the API says it changed (and after a dropped stream). */
function useOrderEvents(code: string, token: string, enabled: boolean) {
    const queryClient = useQueryClient()
    const refetch = () =>
        void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(code) })

    useEventStream<LiveEvent>(
        enabled ? LiveEventsService.orderUrl(code, token) : null,
        (event) => {
            if (event.type === 'order' && event.code === code) refetch()
        },
        { onReconnect: refetch },
    )
}

export function useSubmitPayment(code: string, token: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: SubmitPaymentInput) => OrderService.submitPayment(code, token, input),
        onSuccess: (order) => {
            queryClient.setQueryData(queryKeys.orders.detail(code), order)
        },
    })
}
