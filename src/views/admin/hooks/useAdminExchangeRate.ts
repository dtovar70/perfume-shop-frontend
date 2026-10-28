import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { AdminExchangeRate, RateCurrency } from '@/@types/exchange-rate'
import { queryKeys } from '@/constants/query-keys.constant'
import { ExchangeRateService } from '@/services/ExchangeRateService'

export function useAdminExchangeRate() {
    return useQuery({
        queryKey: queryKeys.admin.exchangeRate(),
        queryFn: ExchangeRateService.getAdmin,
        staleTime: 0,
    })
}

function useSync() {
    const queryClient = useQueryClient()
    return (data: AdminExchangeRate) => {
        queryClient.setQueryData(queryKeys.admin.exchangeRate(), data)
        void queryClient.invalidateQueries({ queryKey: queryKeys.exchangeRate })
        void queryClient.invalidateQueries({ queryKey: queryKeys.admin.orders.summary() })
    }
}

export function useSetManualRate() {
    const sync = useSync()
    return useMutation({
        mutationFn: ({
            currency,
            rate,
            effectiveDate,
        }: {
            currency: RateCurrency
            rate: number
            effectiveDate?: string
        }) => ExchangeRateService.setManual(currency, rate, effectiveDate),
        onSuccess: sync,
    })
}

export function useSetActiveCurrency() {
    const sync = useSync()
    return useMutation({
        mutationFn: (currency: RateCurrency) => ExchangeRateService.setActiveCurrency(currency),
        onSuccess: sync,
    })
}

export function useRefreshRate() {
    const sync = useSync()
    return useMutation({
        mutationFn: ExchangeRateService.refresh,
        onSuccess: sync,
    })
}
