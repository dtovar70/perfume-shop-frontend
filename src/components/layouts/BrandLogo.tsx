import { Link } from 'react-router'

import { appConfig } from '@/configs/app.config'
import { ROUTES } from '@/constants/route.constant'
import { cn } from '@/utils/cn'
import { useSiteContent } from '@/utils/hooks/useSiteContent'

export interface WordmarkProps {
    className?: string
    /** Light text for dark surfaces (footer). */
    inverted?: boolean
}

/** "KaiZen" set in Cormorant: ink (or ivory) lead, gold italic accent. */
export function Wordmark({ className, inverted = false }: WordmarkProps) {
    return (
        <span
            className={cn(
                'font-display leading-none font-semibold tracking-[0.02em]',
                inverted ? 'text-ivory' : 'text-ink',
                className,
            )}
        >
            {appConfig.wordmark.lead}
            <span className="gold-text italic">{appConfig.wordmark.accent}</span>
        </span>
    )
}

/** Square "K" monogram (favicon look) for compact places such as the admin rail. */
export function Monogram({ className }: { className?: string }) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                'flex size-11 shrink-0 items-center justify-center rounded-xl bg-rose-900 ring-1 ring-gold-400/50',
                className,
            )}
        >
            <span className="gold-text font-display text-2xl leading-none font-semibold">K</span>
        </span>
    )
}

export interface BrandLogoProps {
    className?: string
    /** Renders the tagline under the wordmark; used in the footer. */
    withTagline?: boolean
    inverted?: boolean
}

export function BrandLogo({ className, withTagline = false, inverted = false }: BrandLogoProps) {
    const { general } = useSiteContent()

    return (
        <Link
            to={ROUTES.home}
            aria-label={`${appConfig.wordmark.lead}${appConfig.wordmark.accent} — ir al inicio`}
            className={cn('group inline-flex flex-col rounded-lg', className)}
        >
            <Wordmark inverted={inverted} className="text-[1.75rem] sm:text-[2rem]" />
            <span
                aria-hidden="true"
                className={cn(
                    'mt-1 text-[0.6rem] font-bold tracking-[0.42em] uppercase',
                    inverted ? 'text-gold-300' : 'text-gold-700',
                )}
            >
                Perfumería
            </span>
            {withTagline ? (
                <span
                    className={cn(
                        'mt-3 max-w-xs text-sm',
                        inverted ? 'text-ivory/70' : 'text-ink-soft',
                    )}
                >
                    {general.tagline}
                </span>
            ) : null}
        </Link>
    )
}
