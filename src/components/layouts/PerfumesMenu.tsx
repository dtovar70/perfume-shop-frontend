import { useEffect, useId, useRef, useState } from 'react'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Link, useLocation } from 'react-router'

import { PRODUCT_GENDERS } from '@/@types/product'
import { GENDER_LABELS } from '@/constants/product.constant'
import { ROUTES } from '@/constants/route.constant'
import { cn } from '@/utils/cn'
import { useCategoryLinks } from '@/utils/hooks/useNavLinks'

/** Hover intent: the panel waits this long before closing, so a diagonal move does not drop it. */
const CLOSE_DELAY_MS = 140

export interface PerfumesMenuProps {
    triggerClassName: string
}

/**
 * "Perfumes ▾": a disclosure panel with the categories and a shortcut per gender. Opens on
 * hover (pointer) or click/Enter (keyboard, touch); closes on Escape, outside click and
 * navigation.
 */
export function PerfumesMenu({ triggerClassName }: PerfumesMenuProps) {
    const [isOpen, setIsOpen] = useState(false)
    const categoryLinks = useCategoryLinks()
    const panelId = useId()
    const rootRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)
    const closeTimer = useRef<number | undefined>(undefined)
    const reduceMotion = useReducedMotion()
    const location = useLocation()
    const isActive = location.pathname.startsWith(ROUTES.catalog)

    // Navigating anywhere closes the panel.
    const [lastKey, setLastKey] = useState(location.key)
    if (lastKey !== location.key) {
        setLastKey(location.key)
        setIsOpen(false)
    }

    useEffect(() => {
        if (!isOpen) return
        const onPointerDown = (event: PointerEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false)
        }
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return
            setIsOpen(false)
            triggerRef.current?.focus()
        }
        document.addEventListener('pointerdown', onPointerDown)
        document.addEventListener('keydown', onKeyDown)
        return () => {
            document.removeEventListener('pointerdown', onPointerDown)
            document.removeEventListener('keydown', onKeyDown)
        }
    }, [isOpen])

    useEffect(() => () => window.clearTimeout(closeTimer.current), [])

    const openNow = () => {
        window.clearTimeout(closeTimer.current)
        setIsOpen(true)
    }
    const closeSoon = () => {
        window.clearTimeout(closeTimer.current)
        closeTimer.current = window.setTimeout(() => setIsOpen(false), CLOSE_DELAY_MS)
    }

    return (
        <div
            ref={rootRef}
            className="relative"
            onPointerEnter={(event) => event.pointerType === 'mouse' && openNow()}
            onPointerLeave={(event) => event.pointerType === 'mouse' && closeSoon()}
            onBlur={(event) => {
                if (!rootRef.current?.contains(event.relatedTarget as Node)) setIsOpen(false)
            }}
        >
            <button
                ref={triggerRef}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setIsOpen((open) => !open)}
                className={cn(triggerClassName, 'inline-flex items-center gap-1')}
                data-active={isActive || undefined}
            >
                Perfumes
                <ChevronDown
                    aria-hidden="true"
                    className={cn(
                        'size-3.5 transition-transform duration-300',
                        isOpen && 'rotate-180',
                    )}
                />
            </button>

            <AnimatePresence>
                {isOpen ? (
                    <motion.div
                        id={panelId}
                        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="absolute top-full left-1/2 z-50 w-[34rem] -translate-x-1/2 pt-3"
                    >
                        <div className="grid grid-cols-[1.4fr_1fr] gap-6 overflow-hidden rounded-card border border-line bg-white p-6 shadow-lift">
                            <div>
                                <p className="text-[11px] font-bold tracking-[0.2em] text-gold-700 uppercase">
                                    Colecciones
                                </p>
                                <ul className="mt-3 space-y-0.5">
                                    {categoryLinks.map((link) => (
                                        <li key={link.to}>
                                            <Link
                                                to={link.to}
                                                className="group/link flex items-center justify-between rounded-lg px-2 py-2 font-display text-lg text-ink transition hover:bg-rose-50 hover:text-rose-700"
                                            >
                                                {link.label}
                                                <ArrowRight
                                                    aria-hidden="true"
                                                    className="size-4 -translate-x-1 opacity-0 transition group-hover/link:translate-x-0 group-hover/link:opacity-100"
                                                />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex flex-col">
                                <p className="text-[11px] font-bold tracking-[0.2em] text-gold-700 uppercase">
                                    Para
                                </p>
                                <ul className="mt-3 space-y-0.5">
                                    {PRODUCT_GENDERS.map((gender) => (
                                        <li key={gender}>
                                            <Link
                                                to={`${ROUTES.catalog}?gender=${gender}`}
                                                className="block rounded-lg px-2 py-2 text-sm font-semibold text-ink-soft transition hover:bg-rose-50 hover:text-rose-700"
                                            >
                                                {GENDER_LABELS[gender]}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    to={ROUTES.catalog}
                                    className="gradient-blush mt-auto flex items-center justify-between gap-2 rounded-xl px-4 py-3 text-sm font-bold text-rose-800 transition hover:brightness-[0.98]"
                                >
                                    Ver todo el catálogo
                                    <ArrowRight aria-hidden="true" className="size-4" />
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    )
}
