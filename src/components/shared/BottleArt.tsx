import { cn } from '@/utils/cn'

/**
 * Minimal line-art perfume bottles, the store's stand-in for product photos. Drawn with
 * `currentColor` (the glass outline) plus a cherry cap and juice, so they read on any dark
 * surface. Decorative: always `aria-hidden`.
 */
export type BottleShape = 'classic' | 'round' | 'tall'

export interface BottleArtProps {
    shape?: BottleShape
    className?: string
    /** Stroke width in viewBox units; thinner reads more elegant at large sizes. */
    strokeWidth?: number
}

export function BottleArt({ shape = 'classic', className, strokeWidth = 1.5 }: BottleArtProps) {
    return (
        <svg
            viewBox="0 0 80 112"
            fill="none"
            aria-hidden="true"
            className={cn('text-fg/75', className)}
        >
            {shape === 'round' ? (
                <>
                    <rect x="31" y="8" width="18" height="16" rx="8" className="fill-cherry-500" />
                    <rect
                        x="34"
                        y="24"
                        width="12"
                        height="10"
                        rx="1.5"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                    />
                    <circle
                        cx="40"
                        cy="70"
                        r="34"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                    />
                    <path
                        d="M10 78a34 34 0 0 0 60 0c-14 5-46 5-60 0Z"
                        className="fill-cherry-500/35"
                    />
                    <path
                        d="M20 56a24 24 0 0 1 10-12"
                        stroke="currentColor"
                        strokeWidth={strokeWidth * 2}
                        strokeLinecap="round"
                        strokeOpacity=".5"
                    />
                </>
            ) : shape === 'tall' ? (
                <>
                    <rect x="30" y="4" width="20" height="22" rx="4" className="fill-cherry-500" />
                    <rect
                        x="34"
                        y="26"
                        width="12"
                        height="8"
                        rx="1.5"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                    />
                    <rect
                        x="18"
                        y="34"
                        width="44"
                        height="74"
                        rx="8"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                    />
                    <path
                        d="M21 80c8 4 30 4 38 0v20a5 5 0 0 1-5 5H26a5 5 0 0 1-5-5Z"
                        className="fill-cherry-500/35"
                    />
                    <path
                        d="M25 44v26"
                        stroke="currentColor"
                        strokeWidth={strokeWidth * 2}
                        strokeLinecap="round"
                        strokeOpacity=".5"
                    />
                </>
            ) : (
                <>
                    <rect x="28" y="6" width="24" height="18" rx="4" className="fill-cherry-500" />
                    <rect
                        x="33"
                        y="24"
                        width="14"
                        height="9"
                        rx="1.5"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                    />
                    <rect
                        x="8"
                        y="33"
                        width="64"
                        height="73"
                        rx="14"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                    />
                    <path
                        d="M12 74c10 5 46 5 56 0v18a10 10 0 0 1-10 10H22a10 10 0 0 1-10-10Z"
                        className="fill-cherry-500/35"
                    />
                    <rect
                        x="24"
                        y="48"
                        width="32"
                        height="14"
                        rx="3"
                        stroke="currentColor"
                        strokeWidth={strokeWidth * 0.7}
                        strokeOpacity=".6"
                    />
                    <path
                        d="M16 44v22"
                        stroke="currentColor"
                        strokeWidth={strokeWidth * 2}
                        strokeLinecap="round"
                        strokeOpacity=".5"
                    />
                </>
            )}
        </svg>
    )
}
