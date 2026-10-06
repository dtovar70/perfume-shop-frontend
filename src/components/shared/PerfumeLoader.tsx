import { cn } from '@/utils/cn'

export interface PerfumeLoaderProps {
    /** Shown under the mark and announced to assistive tech. */
    message?: string
    className?: string
}

/**
 * The app-wide loader: a champagne ring turns slowly around a perfume bottle while a single
 * drop falls into it. Everything is decorative SVG; the message carries the meaning. With
 * reduced motion the ring and the drop stay still.
 */
export function PerfumeLoader({ message = 'Preparando todo…', className }: PerfumeLoaderProps) {
    return (
        <div
            role="status"
            aria-live="polite"
            className={cn('flex flex-col items-center gap-6', className)}
        >
            <div aria-hidden="true" className="relative flex size-28 items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-rose-100/70 blur-2xl" />

                {/* Gold ring: a faint full track plus a brighter arc that turns. */}
                <svg viewBox="0 0 112 112" className="absolute inset-0 size-full">
                    <defs>
                        <linearGradient id="loader-arc" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#ecd6ae" stopOpacity="0" />
                            <stop offset="55%" stopColor="#d4ab6d" />
                            <stop offset="100%" stopColor="#a77b3b" />
                        </linearGradient>
                    </defs>
                    <circle cx="56" cy="56" r="52" fill="none" stroke="#eedcbc" strokeWidth="1" />
                    <g className="origin-center animate-ring-spin motion-reduce:animate-none">
                        <circle
                            cx="56"
                            cy="56"
                            r="52"
                            fill="none"
                            stroke="url(#loader-arc)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeDasharray="110 217"
                        />
                    </g>
                </svg>

                {/* Bottle, line-drawn, with the falling drop above its neck. */}
                <svg viewBox="0 0 48 64" className="relative h-14 w-11 text-rose-700">
                    <path
                        d="M24 6c0 0-4 5-4 7.5a4 4 0 0 0 8 0C28 11 24 6 24 6Z"
                        className="animate-drop fill-gold-500 motion-reduce:animate-none"
                        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                    />
                    <rect x="19" y="22" width="10" height="7" rx="1.5" className="fill-gold-400" />
                    <rect
                        x="8"
                        y="29"
                        width="32"
                        height="31"
                        rx="7"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                    />
                    <path
                        d="M13 46c4 2.5 18 2.5 22 0v7a3 3 0 0 1-3 3H16a3 3 0 0 1-3-3Z"
                        className="fill-rose-200/80"
                    />
                </svg>
            </div>

            <p className="font-display text-xl text-ink-soft italic">{message}</p>
        </div>
    )
}
