import type { CSSProperties } from 'react'

import { cn } from '@/utils/cn'

/**
 * Mist droplets of one spray burst: where each drifts to (viewBox units, left and up from the
 * nozzle), how big it grows, and a tiny stagger so the burst reads as a puff, not a line.
 */
const DROPLETS = [
    { dx: -46, dy: -10, r: 2.2, scale: 2.4, delay: 0 },
    { dx: -62, dy: -22, r: 1.6, scale: 3, delay: 0.04 },
    { dx: -38, dy: -26, r: 1.4, scale: 2.6, delay: 0.08 },
    { dx: -70, dy: -4, r: 1.8, scale: 3.2, delay: 0.06 },
    { dx: -54, dy: 6, r: 1.3, scale: 2.4, delay: 0.1 },
    { dx: -28, dy: -6, r: 1.2, scale: 2, delay: 0.02 },
    { dx: -80, dy: -16, r: 1.5, scale: 3.6, delay: 0.12 },
    { dx: -44, dy: -38, r: 1.1, scale: 2.8, delay: 0.14 },
] as const

/** Nozzle on the cap's left side, where the mist leaves the bottle. */
const NOZZLE = { x: 27, y: 14 }

export interface SprayBottleArtProps {
    className?: string
    strokeWidth?: number
}

/**
 * The tall line-art bottle, alive: its juice sways in two slow waves and, every few seconds,
 * the cap dips and a puff of mist leaves the nozzle and fades. Pure SVG + CSS (keyframes in
 * index.css); with reduced motion it stays still. Decorative: always `aria-hidden`.
 */
export function SprayBottleArt({ className, strokeWidth = 1 }: SprayBottleArtProps) {
    return (
        <svg
            viewBox="-100 -40 170 152"
            fill="none"
            aria-hidden="true"
            className={cn('overflow-visible text-fg/25', className)}
        >
            <defs>
                <clipPath id="spray-bottle-glass">
                    <rect x="19" y="35" width="42" height="72" rx="7" />
                </clipPath>
                <filter id="spray-bottle-blur" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="5" />
                </filter>
            </defs>

            {/* Mist: a soft cloud plus droplets, all born at the nozzle. */}
            <g className="text-cherry-300">
                <ellipse
                    cx={NOZZLE.x - 34}
                    cy={NOZZLE.y - 8}
                    rx="26"
                    ry="14"
                    fill="currentColor"
                    filter="url(#spray-bottle-blur)"
                    className="spray-cloud"
                />
                {DROPLETS.map((drop, index) => (
                    <circle
                        key={index}
                        cx={NOZZLE.x}
                        cy={NOZZLE.y}
                        r={drop.r}
                        fill="currentColor"
                        className="spray-droplet"
                        style={
                            {
                                '--spray-dx': `${drop.dx}px`,
                                '--spray-dy': `${drop.dy}px`,
                                '--spray-scale': drop.scale,
                                animationDelay: `${drop.delay}s`,
                            } as CSSProperties
                        }
                    />
                ))}
            </g>

            {/* Cap (with its nozzle), pressed at the start of every burst. */}
            <g className="spray-cap">
                <rect x="30" y="4" width="20" height="22" rx="4" className="fill-cherry-500" />
                <rect
                    x={NOZZLE.x - 1}
                    y={NOZZLE.y - 2}
                    width="4"
                    height="4"
                    rx="1"
                    className="fill-cherry-500"
                />
            </g>
            <rect
                x="34"
                y="26"
                width="12"
                height="8"
                rx="1.5"
                stroke="currentColor"
                strokeWidth={strokeWidth}
            />

            {/* Juice: two waves drifting at different speeds, clipped to the glass. */}
            <g clipPath="url(#spray-bottle-glass)">
                <g className="spray-sway">
                    <path
                        d="M-21 74q10-4 20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0V112H-21Z"
                        className="spray-wave-back fill-cherry-500/20"
                    />
                    <path
                        d="M-21 77q10-3.5 20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0V112H-21Z"
                        className="spray-wave-front fill-cherry-500/40"
                    />
                </g>
            </g>

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
                d="M25 44v26"
                stroke="currentColor"
                strokeWidth={strokeWidth * 2}
                strokeLinecap="round"
                strokeOpacity=".5"
            />
        </svg>
    )
}
