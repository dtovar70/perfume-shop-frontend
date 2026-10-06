import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

import { cn } from '@/utils/cn'

/** How long each message stays before the next one fades in. */
const ROTATE_MS = 5000

export interface AnnouncementBarProps {
    items: readonly string[]
    className?: string
}

/**
 * Thin blush bar above the header. One message at a time, cross-fading every few seconds;
 * with reduced motion it shows the messages one after another without the slide.
 * Screen readers get the full list once, never the rotation.
 */
export function AnnouncementBar({ items, className }: AnnouncementBarProps) {
    const [index, setIndex] = useState(0)
    const reduceMotion = useReducedMotion()
    const count = items.length

    useEffect(() => {
        if (count < 2) return
        const id = window.setInterval(() => setIndex((current) => (current + 1) % count), ROTATE_MS)
        return () => window.clearInterval(id)
    }, [count])

    if (count === 0) return null
    const current = items[index % count]

    return (
        <div
            className={cn(
                'gradient-blush relative border-b border-gold-200/60 text-ink',
                className,
            )}
        >
            <ul className="sr-only">
                {items.map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ul>

            <div
                aria-hidden="true"
                className="mx-auto flex h-9 max-w-[90rem] items-center justify-center overflow-hidden px-4"
            >
                <AnimatePresence mode="wait" initial={false}>
                    <motion.p
                        key={current}
                        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className="flex min-w-0 items-center gap-2.5 truncate text-[11px] font-semibold tracking-[0.14em] uppercase sm:text-xs"
                    >
                        <span className="size-1 shrink-0 rotate-45 bg-gold-500" />
                        <span className="truncate">{current}</span>
                        <span className="size-1 shrink-0 rotate-45 bg-gold-500" />
                    </motion.p>
                </AnimatePresence>
            </div>
        </div>
    )
}
