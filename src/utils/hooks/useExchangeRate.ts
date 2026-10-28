import { useQuery } from '@tanstack/react-query'

import { queryKeys } from '@/constants/query-keys.constant'
import { ExchangeRateService } from '@/services/ExchangeRateService'

/**
 * The rate the checkout would use now (the BCV dollar, the BCV euro or USDT, as the business
 * chose; `currency` says which). The storefront only shows approximate bolívar
 * amounts with it; the exact amount is fixed by the API when the order is created.
 */
export function useExchangeRate() {
    return useQuery({
        queryKey: queryKeys.exchangeRate,
        queryFn: ({ signal }) => ExchangeRateService.getCurrent(signal),
        staleTime: 5 * 60_000,
        refetchOnWindowFocus: true,
    })
}
