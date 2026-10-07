import {
    useEffect,
    useId,
    useRef,
    useState,
    type KeyboardEvent,
    type PointerEvent as ReactPointerEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { Check, X } from 'lucide-react'

import type { SelectOption } from '@/components/ui/Select'
import { cn } from '@/utils/cn'

/** How far the sheet has to be dragged down before letting go closes it. */
const DISMISS_DRAG_PX = 90
/** Matches the closing slide, so the sheet unmounts once it is off screen. */
const CLOSE_MS = 200

export interface SelectSheetProps {
    title: string
    options: SelectOption[]
    selectedValue: string
    onSelect: (value: string) => void
    onClose: () => void
}

/**
 * The phone version of the Select list: a sheet that rises from the bottom edge with big rows,
 * like the pickers of native apps, instead of the operating system's unstyled dropdown.
 * Closes on the backdrop, on Escape, from the × or by dragging it down; traps focus while open,
 * locks the page scroll and hands focus back to whatever opened it.
 */
export function SelectSheet({
    title,
    options,
    selectedValue,
    onSelect,
    onClose,
}: SelectSheetProps) {
    const titleId = useId()
    const panelRef = useRef<HTMLDivElement>(null)
    const drag = useRef({ startY: 0, active: false })
    const [offset, setOffset] = useState(0)
    const [isClosing, setIsClosing] = useState(false)
    const [isDragging, setIsDragging] = useState(false)

    const close = (afterClose?: () => void) => {
        if (isClosing) return
        setIsClosing(true)
        window.setTimeout(() => {
            afterClose?.()
            onClose()
        }, CLOSE_MS)
    }

    useEffect(() => {
        const previouslyFocused = document.activeElement as HTMLElement | null
        const { overflow } = document.body.style
        document.body.style.overflow = 'hidden'
        // Land on the chosen option, so the keyboard starts where the customer left off.
        const selected = panelRef.current?.querySelector<HTMLElement>('[aria-selected="true"]')
        ;(selected ?? panelRef.current)?.focus()
        selected?.scrollIntoView({ block: 'nearest' })
        return () => {
            document.body.style.overflow = overflow
            previouslyFocused?.focus()
        }
    }, [])

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Escape') {
            event.preventDefault()
            close()
            return
        }
        const rows = Array.from(
            panelRef.current?.querySelectorAll<HTMLElement>(
                '[role="option"]:not([aria-disabled="true"])',
            ) ?? [],
        )
        const index = rows.indexOf(document.activeElement as HTMLElement)
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            const step = event.key === 'ArrowDown' ? 1 : -1
            rows[(index + step + rows.length) % rows.length]?.focus()
            return
        }
        if (event.key === 'Tab') {
            // Focus stays inside: the × and the rows are the only stops.
            const focusable = Array.from(
                panelRef.current?.querySelectorAll<HTMLElement>('button:not([disabled])') ?? [],
            )
            const first = focusable[0]
            const last = focusable[focusable.length - 1]
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault()
                last?.focus()
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault()
                first?.focus()
            }
        }
    }

    // Drag-to-dismiss from the handle and title bar (the list itself keeps scrolling normally).
    const onDragStart = (event: ReactPointerEvent<HTMLDivElement>) => {
        drag.current = { startY: event.clientY, active: true }
        setIsDragging(true)
        event.currentTarget.setPointerCapture(event.pointerId)
    }
    const onDragMove = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (!drag.current.active) return
        setOffset(Math.max(0, event.clientY - drag.current.startY))
    }
    const onDragEnd = () => {
        if (!drag.current.active) return
        drag.current.active = false
        setIsDragging(false)
        if (offset > DISMISS_DRAG_PX) close()
        else setOffset(0)
    }

    return createPortal(
        <div className="fixed inset-0 z-[70] flex items-end" onKeyDown={onKeyDown}>
            <div
                aria-hidden="true"
                onClick={() => close()}
                className={cn(
                    'absolute inset-0 bg-scrim transition-opacity duration-200',
                    isClosing ? 'opacity-0' : 'animate-fade-in',
                )}
            />
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                style={{ transform: offset ? `translateY(${offset}px)` : undefined }}
                className={cn(
                    'relative z-10 flex max-h-[80dvh] w-full flex-col rounded-t-3xl border-t border-line bg-surface shadow-lift outline-none',
                    'pb-[max(0.75rem,env(safe-area-inset-bottom))]',
                    isDragging ? '' : 'transition-transform duration-200 ease-out',
                    isClosing ? 'translate-y-full' : 'animate-sheet-up',
                    'motion-reduce:animate-none motion-reduce:transition-none',
                )}
            >
                <div
                    className="shrink-0 cursor-grab touch-none px-5 pt-2.5 pb-2 active:cursor-grabbing"
                    onPointerDown={onDragStart}
                    onPointerMove={onDragMove}
                    onPointerUp={onDragEnd}
                    onPointerCancel={onDragEnd}
                >
                    <span
                        aria-hidden="true"
                        className="mx-auto block h-1.5 w-11 rounded-full bg-line-strong"
                    />
                    <div className="mt-2.5 flex items-center justify-between gap-3">
                        <h2 id={titleId} className="font-display text-lg font-semibold text-fg">
                            {title}
                        </h2>
                        <button
                            type="button"
                            aria-label="Cerrar"
                            onPointerDown={(event) => event.stopPropagation()}
                            onClick={() => close()}
                            className="-mr-2 flex size-11 items-center justify-center rounded-full text-fg-soft transition hover:bg-elevated hover:text-fg"
                        >
                            <X aria-hidden="true" className="size-5" />
                        </button>
                    </div>
                </div>

                <ul
                    role="listbox"
                    aria-labelledby={titleId}
                    className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain border-t border-line px-3 pt-2"
                >
                    {options.map((option) => {
                        const isSelected = option.value === selectedValue
                        return (
                            <li key={option.value}>
                                <button
                                    type="button"
                                    role="option"
                                    aria-selected={isSelected}
                                    aria-disabled={option.disabled || undefined}
                                    disabled={option.disabled}
                                    onClick={() => close(() => onSelect(option.value))}
                                    className={cn(
                                        'flex min-h-13 w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left text-base font-semibold transition',
                                        isSelected
                                            ? 'bg-cherry-tint text-accent'
                                            : 'text-fg hover:bg-elevated focus-visible:bg-elevated',
                                        option.disabled && 'cursor-not-allowed opacity-45',
                                    )}
                                >
                                    <span className="flex min-w-0 flex-col gap-0.5">
                                        <span className="truncate">{option.label}</span>
                                        {option.description ? (
                                            <span className="text-sm leading-snug font-normal text-fg-soft">
                                                {option.description}
                                            </span>
                                        ) : null}
                                    </span>
                                    {isSelected ? (
                                        <Check aria-hidden="true" className="size-5 shrink-0" />
                                    ) : null}
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>,
        document.body,
    )
}
