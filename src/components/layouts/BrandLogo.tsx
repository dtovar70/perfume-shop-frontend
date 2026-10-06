import { Link } from 'react-router'

import { appConfig } from '@/configs/app.config'
import { ROUTES } from '@/constants/route.constant'
import { cn } from '@/utils/cn'
import { useSiteContent } from '@/utils/hooks/useSiteContent'

export interface WordmarkProps {
    className?: string
}

/** "KaiZen" set in Outfit: a light lead and a cherry accent. */
export function Wordmark({ className }: WordmarkProps) {
    return (
        <span
            className={cn('font-display leading-none font-bold tracking-tight text-fg', className)}
        >
            {appConfig.wordmark.lead}
            <span className="text-accent">{appConfig.wordmark.accent}</span>
        </span>
    )
}

/** Round "K" monogram (favicon look) for compact places such as the admin rail. */
export function Monogram({ className }: { className?: string }) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                'flex size-11 shrink-0 items-center justify-center rounded-2xl bg-cherry-500 shadow-glow',
                className,
            )}
        >
            <span className="font-display text-2xl leading-none font-bold text-on-cherry">K</span>
        </span>
    )
}

/** The client's logo is a 64×43 px original, so it is never shown larger than 48 px. */
const LOGO_SRC = '/img/kaizen-logo.jpg'

export interface LogoMarkProps {
    className?: string
    /** Rendered size in px (36 compact header, 40 header, 48 footer). */
    size?: 36 | 40 | 48
}

/** Circular crop of the KaiZen logo: the original has a white background, so it sits in a white disc. */
export function LogoMark({ className, size = 40 }: LogoMarkProps) {
    return (
        <img
            src={LOGO_SRC}
            alt="KaiZen Perfumes"
            width={size}
            height={size}
            decoding="async"
            className={cn(
                'shrink-0 rounded-full bg-white object-contain p-0.5 ring-2 ring-cherry-500/40',
                className,
            )}
            style={{ width: size, height: size }}
        />
    )
}

export interface BrandLogoProps {
    className?: string
    /** Renders the tagline under the wordmark; used in the footer. */
    withTagline?: boolean
    /** Footer size: a 48px mark. */
    large?: boolean
}

export function BrandLogo({ className, withTagline = false, large = false }: BrandLogoProps) {
    const { general } = useSiteContent()

    return (
        <Link
            to={ROUTES.home}
            aria-label={`${appConfig.wordmark.lead}${appConfig.wordmark.accent} — ir al inicio`}
            className={cn('group inline-flex flex-col rounded-2xl', className)}
        >
            <span className="flex items-center gap-2.5 sm:gap-3">
                {large ? (
                    <LogoMark size={48} />
                ) : (
                    <>
                        <LogoMark size={36} className="sm:hidden" />
                        <LogoMark size={40} className="max-sm:hidden" />
                    </>
                )}
                <span className="flex flex-col items-start">
                    <Wordmark className="text-2xl sm:text-[1.7rem]" />
                    <span
                        aria-hidden="true"
                        className="mt-1 text-[0.6rem] font-bold tracking-[0.3em] text-fg-soft uppercase"
                    >
                        Perfumería
                    </span>
                </span>
            </span>
            {withTagline ? (
                <span className="mt-4 max-w-xs text-sm text-fg-soft">{general.tagline}</span>
            ) : null}
        </Link>
    )
}
