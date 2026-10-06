import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'

import { buttonVariants } from '@/components/ui/Button.variants'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/formatCurrency'

export interface CheckoutCtaProps {
    to: string
    label: string
    count: number
    total: number
    disabled?: boolean
    onClick?: () => void
    className?: string
}

/** The cart's main CTA: [qty] Label …… total ›. Rendered as a link, or inert when disabled. */
export function CheckoutCta({ to, label, count, total, disabled, onClick, className }: CheckoutCtaProps) {
    const content = (
        <>
            <span
                aria-hidden="true"
                className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-white/20 px-1.5 text-xs font-bold tabular-nums"
            >
                {count}
            </span>
            <span className="flex-1 text-left">{label}</span>
            <span className="tabular-nums">{formatCurrency(total)}</span>
            <ChevronRight aria-hidden="true" className="-mr-1 size-4" />
        </>
    )
    const classes = cn(
        buttonVariants({ size: 'lg', fullWidth: true }),
        'justify-between gap-3 px-4',
        className,
    )
    const accessibleName = `${label}: ${count} ${count === 1 ? 'artículo' : 'artículos'}, ${formatCurrency(total)}`

    if (disabled) {
        return (
            <button type="button" disabled aria-label={accessibleName} className={classes}>
                {content}
            </button>
        )
    }

    return (
        <Link to={to} onClick={onClick} aria-label={accessibleName} className={classes}>
            {content}
        </Link>
    )
}
