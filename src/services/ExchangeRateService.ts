import type {
    AdminExchangeRate,
    PublicCurrentRate,
    RateCurrency,
    RateSyncResult,
} from '@/@types/exchange-rate'
import { apiClient } from '@/services/ApiClient'

const ADMIN = '/admin/exchange-rate'

/**
 * Bolívar rates (BCV dollar, BCV euro, USDT Binance): the public current value of the active
 * currency, the admin view, the active-currency choice, manual rates and refresh.
 */
export const ExchangeRateService = {
    getCurrent: (signal?: AbortSignal) =>
        apiClient.get<PublicCurrentRate>('/exchange-rate/current', { signal }),

    getAdmin: () => apiClient.get<AdminExchangeRate>(ADMIN),
    /** ADMIN only. Which rate the store converts with, from now on. */
    setActiveCurrency: (currency: RateCurrency) =>
        apiClient.put<AdminExchangeRate>(`${ADMIN}/active-currency`, { currency }),
    /** ADMIN only. Used until the currency's source publishes a different rate. */
    setManual: (currency: RateCurrency, rate: number, effectiveDate?: string) =>
        apiClient.post<AdminExchangeRate>(`${ADMIN}/manual`, { currency, rate, effectiveDate }),
    refresh: () => apiClient.post<AdminExchangeRate & { sync: RateSyncResult }>(`${ADMIN}/refresh`),
} as const
