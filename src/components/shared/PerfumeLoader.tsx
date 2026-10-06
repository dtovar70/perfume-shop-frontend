import { cn } from '@/utils/cn'

export interface PerfumeLoaderProps {
    /** Shown under the mark and announced to assistive tech. */
    message?: string
    className?: string
}

/** Five petals around the center; each one breathes a beat after the previous one. */
const PETALS = [0, 72, 144, 216, 288]

/**
 * The app-wide loader: a cherry blossom whose petals light up in turn, inside a thin ring with
 * a turning arc. Decorative SVG; the message carries the meaning. With reduced motion the
 * blossom and the arc stay still.
 */
export function PerfumeLoader({ message = 'Preparando todo…', className }: PerfumeLoaderProps) {
    return (
        <div
            role="status"
            aria-live="polite"
            className={cn('flex flex-col items-center gap-6', className)}
        >
            <div aria-hidden="true" className="relative flex size-24 items-center justify-center">
                <span className="absolute inset-2 rounded-full bg-cherry-500/20 blur-2xl" />

                <svg viewBox="0 0 96 96" className="absolute inset-0 size-full">
                    <circle
                        cx="48"
                        cy="48"
                        r="45"
                        fill="none"
                        className="stroke-line"
                        strokeWidth="2"
                    />
                    <g className="origin-center animate-ring-spin motion-reduce:animate-none">
                        <circle
                            cx="48"
                            cy="48"
                            r="45"
                            fill="none"
                            className="stroke-cherry-500"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeDasharray="70 213"
                        />
                    </g>
                </svg>

                <svg viewBox="-24 -24 48 48" className="relative size-12">
                    {PETALS.map((angle, index) => (
                        <g key={angle} transform={`rotate(${angle})`}>
                            <path
                                d="M0 -2C-6 -6 -7 -15 -3 -20L0 -17L3 -20C7 -15 6 -6 0 -2Z"
                                className="animate-petal fill-accent motion-reduce:animate-none"
                                style={{
                                    animationDelay: `${index * 0.3}s`,
                                    transformBox: 'fill-box',
                                    transformOrigin: 'center bottom',
                                }}
                            />
                        </g>
                    ))}
                    <circle r="3" className="fill-fg" />
                </svg>
            </div>

            <p className="font-display text-lg font-medium text-fg-soft">{message}</p>
        </div>
    )
}
