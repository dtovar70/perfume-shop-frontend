import { useEffect, useState, type ReactNode, type RefObject } from 'react'

import { PriceTag } from '@/components/shared/PriceTag'
import { useUiStore } from '@/store/uiStore'
import { cn } from '@/utils/cn'

/** Matches the bar's height below `lg` (where the bar is shown). */
const BODY_PADDING_CLASS = 'max-lg:pb-24'

export interface StickyAddToCartBarProps {
    /** The inline add-to-cart row; the bar shows once it has scrolled up out of view. */
    anchorRef: RefObject<HTMLElement | null>
    price: number
    compareAtPrice?: number
    /** Product name, shown above the price. */
    title?: string
    /** The add button (same rules as the inline one: stock, quantity). */
    children: ReactNode
}

/**
 * Phones only: a bar pinned to the bottom with the price and "Agregar al carrito", so the
 * customer never has to scroll back up past the description and details to buy.
 */
export function StickyAddToCartBar({
    anchorRef,
    price,
    compareAtPrice,
    title,
    children,
}: StickyAddToCartBarProps) {
    const [isVisible, setIsVisible] = useState(false)
    const setStickyBarVisible = useUiStore((state) => state.setStickyBarVisible)

    // Measured on scroll (once per frame) rather than with an IntersectionObserver: an observer
    // only reports *changes*, so jumping straight past a row that started below the fold (End
    // key, a restored scroll position) never fires and the bar would stay hidden.
    useEffect(() => {
        const anchor = anchorRef.current
        if (!anchor) return
        let frame = 0

        const measure = () => {
            frame = 0
            // Only once the row is entirely above the viewport: before reaching it, it is ahead.
            setIsVisible(anchor.getBoundingClientRect().bottom < 0)
        }
        const schedule = () => {
            if (!frame) frame = window.requestAnimationFrame(measure)
        }

        measure()
        window.addEventListener('scroll', schedule, { passive: true })
        window.addEventListener('resize', schedule)
        return () => {
            window.removeEventListener('scroll', schedule)
            window.removeEventListener('resize', schedule)
            if (frame) window.cancelAnimationFrame(frame)
        }
    }, [anchorRef])

    // While the bar is up, the page gets room at the bottom so it never hides the footer, and
    // the floating WhatsApp button rises above it.
    useEffect(() => {
        if (!isVisible) return
        document.body.classList.add(BODY_PADDING_CLASS)
        setStickyBarVisible(true)
        return () => {
            document.body.classList.remove(BODY_PADDING_CLASS)
            setStickyBarVisible(false)
        }
    }, [isVisible, setStickyBarVisible])

    return (
        <div
            aria-hidden={!isVisible}
            inert={!isVisible}
            className={cn(
                'fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-up backdrop-blur transition-transform duration-300 motion-reduce:transition-none lg:hidden',
                isVisible ? 'translate-y-0' : 'translate-y-full',
            )}
        >
            <div className="mx-auto flex max-w-xl items-center gap-3">
                {title ? (
                    <div className="min-w-0 shrink">
                        <p className="truncate font-display text-base leading-tight font-semibold text-fg">
                            {title}
                        </p>
                        <PriceTag price={price} compareAtPrice={compareAtPrice} size="sm" />
                    </div>
                ) : null}
                <PriceTag
                    price={price}
                    compareAtPrice={compareAtPrice}
                    size="md"
                    className={cn('min-w-0 shrink-0 flex-col items-start gap-0', title && 'hidden')}
                />
                <div className="ml-auto max-w-56 min-w-36 flex-1 [&>button]:w-full">{children}</div>
            </div>
        </div>
    )
}
