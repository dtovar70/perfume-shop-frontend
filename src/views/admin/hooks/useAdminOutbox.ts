import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { AdminOutboxQueryParams } from '@/@types/outbox'
import { queryKeys } from '@/constants/query-keys.constant'
import { AdminOutboxService } from '@/services/AdminOutboxService'

/** Retried messages move on within seconds: the open list refreshes this often. */
const OUTBOX_POLL_MS = 15_000

export function useAdminOutbox(params: AdminOutboxQueryParams, { enabled = true } = {}) {
    return useQuery({
        queryKey: queryKeys.admin.outbox.list(params),
        queryFn: () => AdminOutboxService.getMessages(params),
        enabled,
        placeholderData: keepPreviousData,
        staleTime: 0,
        refetchInterval: OUTBOX_POLL_MS,
    })
}

/** "Reintentar": schedules the message now; every outbox list is refreshed afterwards. */
export function useRetryOutboxMessage() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => AdminOutboxService.retry(id),
        onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.outbox.all() }),
    })
}
