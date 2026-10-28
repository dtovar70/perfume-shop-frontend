/** Mirrors backend-perfume-shop/src/exchange-rate/exchange-rate.service.ts. */
export type RateSource = 'bcv' | 'dolarapi' | 'binance' | 'manual'

/**
 * Which rate turns the dollar prices into bolívares: the BCV dollar, the BCV euro or USDT on
 * Binance P2P. Prices are always in dollars (`Bs = USD x rate`).
 */
export type RateCurrency = 'USD' | 'EUR' | 'USDT'

/** `GET /exchange-rate/current`: the rate the checkout would use right now. */
export type PublicCurrentRate =
    | {
          available: true
          currency: RateCurrency
          /** Bolívares per unit of `currency` (4 decimals). */
          rate: number
          source: RateSource
          sourceLabel: string
          /** BCV "fecha valor" (the day it was read, for USDT), "YYYY-MM-DD". */
          effectiveDate: string
          fetchedAt: string
          isManual: boolean
          usableUntil: string
          isStale: false
      }
    | {
          available: false
          currency: RateCurrency
          reason: 'missing' | 'stale'
          message: string
      }

export interface ExchangeRateEntry {
    id: string
    currency: RateCurrency
    rate: number
    source: RateSource
    sourceLabel: string
    effectiveDate: string
    fetchedAt: string
    isManual: boolean
    createdBy: { id: string; name: string } | null
}

export interface CurrentExchangeRate extends ExchangeRateEntry {
    usableUntil: string
    isStale: boolean
}

export interface RateSyncAttempt {
    source: Exclude<RateSource, 'manual'>
    currency: RateCurrency
    ok: boolean
    rate?: number
    effectiveDate?: string
    error?: string
}

export interface CurrencySyncResult {
    outcome: 'stored' | 'unchanged' | 'failed'
    source?: Exclude<RateSource, 'manual'>
    rate?: number
    effectiveDate?: string
}

export interface RateSyncResult {
    at: string
    outcome: 'stored' | 'unchanged' | 'failed'
    currencies: Partial<Record<RateCurrency, CurrencySyncResult>>
    attempts: RateSyncAttempt[]
}

export interface AdminCurrencyRates {
    currency: RateCurrency
    label: string
    current: CurrentExchangeRate | null
    history: ExchangeRateEntry[]
}

export interface AdminRateSyncGroup {
    group: 'bcv' | 'binance'
    currencies: RateCurrency[]
    intervalMinutes: number
    lastSync: RateSyncResult | null
}

/** `GET /admin/exchange-rate`. */
export interface AdminExchangeRate {
    activeCurrency: RateCurrency
    activeCurrencyUpdatedAt: string | null
    activeCurrencyUpdatedBy: { id: string; name: string } | null
    /** The active currency's newest rate. */
    current: CurrentExchangeRate | null
    rates: AdminCurrencyRates[]
    syncs: AdminRateSyncGroup[]
    maxAgeHours: number
}
