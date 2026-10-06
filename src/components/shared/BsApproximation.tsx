import { useExchangeRate } from '@/utils/hooks/useExchangeRate'
import { formatBolivares, formatRate, usdToBolivares } from '@/utils/formatBolivares'
import { formatDay } from '@/utils/formatDate'
import { cn } from '@/utils/cn'

export interface BsApproximationProps {
    /** Total in US dollars. */
    usd: number
    className?: string
    /** Only the amount, without the rate line (product cards). */
    compact?: boolean
}

/**
 * "≈ Bs 32.469,62" plus the rate it used ("Tasa BCV del 24/09/2026: 854,46 Bs/$"). Renders
 * nothing while the rate loads or when it is unavailable (the checkout says so on its own).
 */
export function BsApproximation({ usd, className, compact = false }: BsApproximationProps) {
    const { data } = useExchangeRate()
    if (!data?.available) return null

    if (compact) {
        return (
            <p className={cn('text-xs text-fg-soft tabular-nums', className)}>
                ≈ {formatBolivares(usdToBolivares(usd, data.rate))}
            </p>
        )
    }

    return (
        <div className={cn('space-y-0.5 text-right', className)}>
            <p className="text-sm font-semibold text-fg">
                ≈ {formatBolivares(usdToBolivares(usd, data.rate))}
            </p>
            <p className="text-xs text-fg-soft">
                Tasa BCV del {formatDay(data.effectiveDate)}: {formatRate(data.rate)} Bs/$
            </p>
        </div>
    )
}
