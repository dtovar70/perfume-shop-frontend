import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { motion } from 'motion/react'

import { cn } from '@/utils/cn'

export interface TabItem {
    id: string
    label: string
    content: ReactNode
}

export interface TabsProps {
    items: TabItem[]
    /** Accessible name of the tab list. */
    label: string
    className?: string
    panelClassName?: string
}

/**
 * WAI-ARIA tabs with automatic activation: arrows move between tabs (wrapping), Home/End jump
 * to the ends. The active tab is underlined by a cherry bar that slides between tabs (no slide
 * with reduced motion, via the app's MotionConfig). Every panel stays in the DOM (`hidden`
 * when inactive), so no content is lost to search engines or in-page find.
 */
export function Tabs({ items, label, className, panelClassName }: TabsProps) {
    const baseId = useId()
    const [activeId, setActiveId] = useState(items[0]?.id)
    const tabRefs = useRef(new Map<string, HTMLButtonElement>())
    const active = items.find((item) => item.id === activeId) ?? items[0]

    const select = (index: number) => {
        const item = items[(index + items.length) % items.length]
        if (!item) return
        setActiveId(item.id)
        tabRefs.current.get(item.id)?.focus()
    }

    const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
        const target =
            event.key === 'ArrowRight'
                ? index + 1
                : event.key === 'ArrowLeft'
                  ? index - 1
                  : event.key === 'Home'
                    ? 0
                    : event.key === 'End'
                      ? items.length - 1
                      : null
        if (target === null) return
        event.preventDefault()
        select(target)
    }

    return (
        <div className={className}>
            <div
                role="tablist"
                aria-label={label}
                className="scrollbar-none flex gap-1 overflow-x-auto border-b border-line"
            >
                {items.map((item, index) => {
                    const isActive = item.id === active?.id
                    return (
                        <button
                            key={item.id}
                            ref={(element) => {
                                if (element) tabRefs.current.set(item.id, element)
                                else tabRefs.current.delete(item.id)
                            }}
                            type="button"
                            role="tab"
                            id={`${baseId}-tab-${item.id}`}
                            aria-selected={isActive}
                            aria-controls={`${baseId}-panel-${item.id}`}
                            tabIndex={isActive ? 0 : -1}
                            onClick={() => setActiveId(item.id)}
                            onKeyDown={(event) => onKeyDown(event, index)}
                            className={cn(
                                'relative -mb-px min-h-12 shrink-0 rounded-t-xl px-5 font-display text-lg font-semibold whitespace-nowrap transition-colors duration-200 focus-visible:-outline-offset-2',
                                isActive ? 'text-fg' : 'text-fg-soft hover:text-fg',
                            )}
                        >
                            {item.label}
                            {isActive ? (
                                <motion.span
                                    layoutId={`${baseId}-underline`}
                                    aria-hidden="true"
                                    className="absolute inset-x-3 bottom-0 h-[3px] rounded-full bg-cherry-500"
                                    transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                                />
                            ) : null}
                        </button>
                    )
                })}
            </div>

            {items.map((item) => (
                <div
                    key={item.id}
                    role="tabpanel"
                    id={`${baseId}-panel-${item.id}`}
                    aria-labelledby={`${baseId}-tab-${item.id}`}
                    hidden={item.id !== active?.id}
                    tabIndex={0}
                    className={cn('focus-visible:outline-offset-4', panelClassName)}
                >
                    {item.content}
                </div>
            ))}
        </div>
    )
}
