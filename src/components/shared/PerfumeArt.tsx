import { useId } from 'react'

import { cn } from '@/utils/cn'

/**
 * Brand illustration (hero, About, 404): an arched champagne window with a large bottle, soft
 * light and, optionally, a few floating note tags. Pure SVG/CSS and decorative (`aria-hidden`),
 * so it never competes with text for contrast.
 */
const DEFAULT_NOTES = [
    { label: 'Bergamota', className: 'top-[14%] -left-2 sm:-left-8' },
    { label: 'Rosa de Damasco', className: 'top-[46%] -right-2 sm:-right-10' },
    { label: 'Ámbar · Vainilla', className: 'bottom-[12%] left-0 sm:-left-4' },
]

export interface PerfumeArtProps {
    /** Floating note tags; pass `false` to hide them. */
    notes?: false | readonly { label: string; className: string }[]
    className?: string
}

export function PerfumeArt({ notes = DEFAULT_NOTES, className }: PerfumeArtProps) {
    // Gradient ids must be unique when the art appears twice on a page.
    const id = `art${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
    const glass = `${id}-glass`
    const juice = `${id}-juice`
    const gold = `${id}-gold`

    return (
        <div
            aria-hidden="true"
            className={cn('relative mx-auto aspect-[4/5] w-full max-w-[22rem] sm:max-w-md', className)}
        >
            {/* Arched window */}
            <div className="absolute inset-0 overflow-hidden rounded-t-full border border-gold-300/80 bg-linear-to-b from-white/80 via-rose-50/70 to-gold-100/80 shadow-lift">
                <span className="absolute -top-10 left-1/2 size-72 -translate-x-1/2 rounded-full bg-rose-200/60 blur-3xl" />
                <span className="absolute -bottom-16 left-1/4 size-64 rounded-full bg-gold-200/70 blur-3xl" />
                <span className="absolute inset-3 rounded-t-full border border-white/70" />
            </div>

            {/* Bottle */}
            <svg viewBox="0 0 200 260" fill="none" className="absolute inset-x-[14%] bottom-[8%] w-[72%]">
                <defs>
                    <linearGradient id={glass} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#ffffff" stopOpacity=".95" />
                        <stop offset="1" stopColor="#f4d3d9" stopOpacity=".75" />
                    </linearGradient>
                    <linearGradient id={juice} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#ebb3be" stopOpacity=".55" />
                        <stop offset="1" stopColor="#c96b7e" stopOpacity=".75" />
                    </linearGradient>
                    <linearGradient id={gold} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#ecd6ae" />
                        <stop offset=".5" stopColor="#d4ab6d" />
                        <stop offset="1" stopColor="#a77b3b" />
                    </linearGradient>
                </defs>
                <ellipse cx="100" cy="250" rx="78" ry="7" fill="#4a2530" opacity=".12" />
                <rect x="70" y="8" width="60" height="44" rx="6" fill={`url(#${gold})`} />
                <path d="M70 28h60" stroke="#84602f" strokeOpacity=".35" />
                <rect x="82" y="52" width="36" height="20" rx="3" fill={`url(#${gold})`} opacity=".85" />
                <rect x="22" y="72" width="156" height="176" rx="28" fill={`url(#${glass})`} stroke="#b05468" strokeOpacity=".45" strokeWidth="1.5" />
                <path d="M30 160c26 10 114 10 140 0v58a22 22 0 0 1-22 22H52a22 22 0 0 1-22-22Z" fill={`url(#${juice})`} />
                <rect x="58" y="112" width="84" height="40" rx="3" fill="#fffaf7" fillOpacity=".85" stroke={`url(#${gold})`} />
                <text x="100" y="138" textAnchor="middle" fontFamily="'Cormorant Garamond', Georgia, serif" fontSize="20" fontWeight="600" fill="#4a2530">
                    KaiZen
                </text>
                <path d="M40 92v60" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeOpacity=".9" />
            </svg>

            {(notes || []).map((note) => (
                <span
                    key={note.label}
                    className={`absolute ${note.className} flex items-center gap-2 rounded-full border border-gold-200 bg-white/90 px-3.5 py-2 text-xs font-semibold text-ink shadow-soft backdrop-blur-sm`}
                >
                    <span className="size-1.5 rounded-full bg-gold-500" />
                    {note.label}
                </span>
            ))}
        </div>
    )
}
