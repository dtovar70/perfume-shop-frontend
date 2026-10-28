import type { RateCurrency } from '@/@types/exchange-rate'
import { formatRate } from '@/utils/formatBolivares'
import { formatDateTime, formatDay } from '@/utils/formatDate'

/** Mirrors backend `rate-currency.ts`. */
export const RATE_CURRENCIES: readonly RateCurrency[] = ['USD', 'EUR', 'USDT']

/** The choice as the admin sees it. */
export const RATE_CURRENCY_LABELS: Record<RateCurrency, string> = {
    USD: 'Dólar BCV',
    EUR: 'Euro BCV',
    USDT: 'USDT Binance',
}

/** The rate's name: "Tasa BCV del 24/09/2026". */
export const RATE_NAMES: Record<RateCurrency, string> = {
    USD: 'Tasa BCV',
    EUR: 'Tasa BCV (€)',
    USDT: 'Tasa USDT Binance',
}

/** Written after a rate: "854,46 Bs/$". */
export const RATE_UNITS: Record<RateCurrency, string> = {
    USD: 'Bs/$',
    EUR: 'Bs/€',
    USDT: 'Bs/USDT',
}

/**
 * The storefront's rate line. BCV rates carry their fecha valor ("Tasa BCV (€) del 24/09/2026:
 * 974,06 Bs/€"); USDT moves during the day, so it shows when it was read ("Tasa USDT Binance
 * (28/10/2026, 3:05 p. m.): 1.007,70 Bs/USDT").
 */
export function rateCaption(rate: {
    currency: RateCurrency
    rate: number
    effectiveDate: string
    fetchedAt: string
}): string {
    const value = `${formatRate(rate.rate)} ${RATE_UNITS[rate.currency]}`
    return rate.currency === 'USDT'
        ? `${RATE_NAMES.USDT} (${formatDateTime(rate.fetchedAt)}): ${value}`
        : `${RATE_NAMES[rate.currency]} del ${formatDay(rate.effectiveDate)}: ${value}`
}
