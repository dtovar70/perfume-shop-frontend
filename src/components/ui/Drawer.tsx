import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cva, type VariantProps } from 'class-variance-authority'
import { ChevronLeft, X } from 'lucide-react'

import { useLockBodyScroll } from '@/utils/hooks/useLockBodyScroll'
import { cn } from '@/utils/cn'

const panelVariants = cva(
    // Above `sm` the panel floats inset from the window edges, so it reads as a card
    // instead of a slab sliced by the top and bottom of the viewport.
    'pointer-events-auto flex h-full w-full flex-col overflow-hidden bg-ivory shadow-lift transition-transform duration-300 ease-out motion-reduce:transition-none',
    {
        variants: {
            side: {
                right: 'ml-auto rounded-l-card sm:rounded-card',
                left: 'mr-auto rounded-r-card sm:rounded-card',
            },
            size: {
                md: 'max-w-md',
                /** Full width on phones, 400px from `sm` (the cart). */
                sm: 'sm:max-w-[400px]',
            },
            isOpen: {
                true: 'translate-x-0',
                false: '',
            },
        },
        compoundVariants: [
            // The extra 2rem clears the container's `sm:p-4` inset: translating by exactly
            // 100% would leave the panel's inset edge — rounded corners, scrollbar and all —
            // peeking in at the side of the window.
            {
                side: 'right',
                isOpen: false,
                class: 'translate-x-full sm:translate-x-[calc(100%+2rem)]',
            },
            {
                side: 'left',
                isOpen: false,
                class: '-translate-x-full sm:-translate-x-[calc(100%+2rem)]',
            },
        ],
        defaultVariants: {
            side: 'right',
            size: 'md',
            isOpen: false,
        },
    },
)

const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export interface DrawerProps extends Pick<VariantProps<typeof panelVariants>, 'side' | 'size'> {
    isOpen: boolean
    onClose: () => void
    title: string
    children: ReactNode
    footer?: ReactNode
    /** `back` shows a "volver" chevron before the title instead of the × at the end. */
    closeStyle?: 'close' | 'back'
}

export function Drawer({
    isOpen,
    onClose,
    title,
    side = 'right',
    size = 'md',
    children,
    footer,
    closeStyle = 'close',
}: DrawerProps) {
    const panelRef = useRef<HTMLDivElement>(null)
    const titleId = useId()

    useLockBodyScroll(isOpen)

    useEffect(() => {
        if (!isOpen) return

        const previouslyFocused = document.activeElement
        const panel = panelRef.current
        panel?.focus()

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.stopPropagation()
                onClose()
                return
            }

            if (event.key !== 'Tab' || !panel) return

            const focusable = Array.from(
                panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
            ).filter((element) => element.offsetParent !== null)

            const first = focusable[0]
            const last = focusable[focusable.length - 1]
            if (!first || !last) {
                event.preventDefault()
                panel.focus()
                return
            }

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault()
                last.focus()
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault()
                first.focus()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            if (previouslyFocused instanceof HTMLElement) {
                previouslyFocused.focus()
            }
        }
    }, [isOpen, onClose])

    return createPortal(
        <div
            className={cn(
                // `overflow-hidden` keeps the closed, translated panel from widening the page.
                'fixed inset-0 z-50 flex overflow-hidden sm:p-4',
                isOpen ? 'pointer-events-auto' : 'pointer-events-none',
            )}
            aria-hidden={!isOpen}
        >
            <button
                type="button"
                tabIndex={isOpen ? 0 : -1}
                aria-label="Cerrar el panel"
                onClick={onClose}
                className={cn(
                    'absolute inset-0 cursor-default bg-noir/45 backdrop-blur-[3px] transition-opacity duration-300 motion-reduce:transition-none',
                    isOpen ? 'opacity-100' : 'opacity-0',
                )}
            />

            <div
                ref={panelRef}
                role="dialog"
                aria-modal={isOpen || undefined}
                aria-labelledby={titleId}
                tabIndex={-1}
                className={cn('relative z-10 flex w-full', panelVariants({ side, size, isOpen }))}
            >
                <header className="flex items-center gap-2 border-b border-line px-3 py-3 sm:px-4">
                    {closeStyle === 'back' ? (
                        <button
                            type="button"
                            onClick={onClose}
                            tabIndex={isOpen ? 0 : -1}
                            aria-label="Volver"
                            className="flex size-11 shrink-0 items-center justify-center rounded-full text-ink transition hover:bg-rose-50"
                        >
                            <ChevronLeft aria-hidden="true" className="size-5" />
                        </button>
                    ) : null}
                    <h2
                        id={titleId}
                        className={cn(
                            'min-w-0 flex-1 truncate font-display text-2xl font-semibold',
                            closeStyle === 'close' && 'pl-2',
                        )}
                    >
                        {title}
                    </h2>
                    {closeStyle === 'close' ? (
                        <button
                            type="button"
                            onClick={onClose}
                            tabIndex={isOpen ? 0 : -1}
                            aria-label="Cerrar"
                            className="flex size-11 shrink-0 items-center justify-center rounded-full text-ink transition hover:rotate-90 hover:bg-rose-50"
                        >
                            <X aria-hidden="true" className="size-5" />
                        </button>
                    ) : null}
                </header>

                <div className="scroll-soft flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>

                {footer ? (
                    <div className="relative z-10 border-t border-line bg-white px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-12px_28px_-18px_rgb(43_31_36/0.3)] sm:px-6">
                        {footer}
                    </div>
                ) : null}
            </div>
        </div>,
        document.body,
    )
}
