import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useMatch } from 'react-router'

import { SocialIcon } from '@/components/shared/SocialIcon'
import { productPath, ROUTES } from '@/constants/route.constant'
import { useIsOverlayOpen, useUiStore } from '@/store/uiStore'
import { cn } from '@/utils/cn'
import { whatsappUrl } from '@/utils/content'
import { useSiteContent } from '@/utils/hooks/useSiteContent'
import { useProduct } from '@/views/product/hooks/useProduct'

/** Set once the first-visit hint has been shown, so it never nags again. */
const HINT_STORAGE_KEY = 'kaizen-whatsapp-hint'
const HINT_DELAY_MS = 2500
const HINT_DURATION_MS = 6000

function hasSeenHint(): boolean {
    try {
        return window.localStorage.getItem(HINT_STORAGE_KEY) === '1'
    } catch {
        // Storage blocked: better to skip the hint than to show it on every page.
        return true
    }
}

function rememberHint(): void {
    try {
        window.localStorage.setItem(HINT_STORAGE_KEY, '1')
    } catch {
        // Storage blocked: the hint simply may show again on a later visit.
    }
}

/** A small "¿Dudas? Escríbenos" bubble the first time someone visits the store. */
function useFirstVisitHint(isEnabled: boolean): boolean {
    const [isShowing, setIsShowing] = useState(false)

    useEffect(() => {
        if (!isEnabled || hasSeenHint()) return
        const show = window.setTimeout(() => {
            rememberHint()
            setIsShowing(true)
        }, HINT_DELAY_MS)
        return () => window.clearTimeout(show)
    }, [isEnabled])

    useEffect(() => {
        if (!isShowing) return
        const hide = window.setTimeout(() => setIsShowing(false), HINT_DURATION_MS)
        return () => window.clearTimeout(hide)
    }, [isShowing])

    return isShowing && isEnabled
}

/**
 * Floating WhatsApp button (bottom right). On a product page it pre-fills the product's name
 * and link; elsewhere a greeting. Steps aside while a drawer, the menu or a dialog is open, on
 * the checkout (it would sit over the form's last button on phones) and when the store has no
 * WhatsApp number. On phones it rides above the product page's sticky add-to-cart bar.
 */
export function WhatsAppFab() {
    const { contact, general } = useSiteContent()
    const isOverlayOpen = useIsOverlayOpen()
    const isStickyBarVisible = useUiStore((state) => state.isStickyBarVisible)
    const productMatch = useMatch(ROUTES.product)
    const isCheckout = useMatch(ROUTES.checkout) !== null
    const slug = productMatch?.params.slug ?? ''
    // Same cache entry the product page reads: no extra request.
    const { data: product } = useProduct(slug)
    const reduceMotion = useReducedMotion()

    const isAvailable = Boolean(contact.whatsapp) && !isCheckout
    const isVisible = isAvailable && !isOverlayOpen
    const isHintShowing = useFirstVisitHint(isVisible)

    if (!isAvailable) return null

    const message =
        slug && product
            ? `Hola, me interesa ${product.name}${product.brand ? ` de ${product.brand.name}` : ''} (${window.location.origin}${productPath(product.slug)})`
            : `Hola, vengo de la tienda ${general.brandName} y tengo una consulta.`

    return (
        <div
            inert={!isVisible}
            aria-hidden={!isVisible || undefined}
            className={cn(
                'fixed right-4 z-30 flex items-center gap-3 transition-[bottom,opacity,transform] duration-300 ease-out motion-reduce:transition-opacity sm:right-6',
                // Phones: above the product page's sticky bar when it is up.
                isStickyBarVisible
                    ? 'bottom-[calc(5.5rem+env(safe-area-inset-bottom))] lg:bottom-6'
                    : 'bottom-[max(1rem,env(safe-area-inset-bottom))] sm:bottom-6',
                isVisible ? 'opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
            )}
        >
            <AnimatePresence>
                {isHintShowing ? (
                    <motion.p
                        key="hint"
                        role="status"
                        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="rounded-full border border-line bg-surface px-3.5 py-2 text-sm font-semibold whitespace-nowrap text-fg shadow-soft"
                    >
                        ¿Dudas? Escríbenos
                    </motion.p>
                ) : null}
            </AnimatePresence>

            <a
                href={whatsappUrl(contact.whatsapp, message)}
                target="_blank"
                rel="noreferrer"
                aria-label="Escríbenos por WhatsApp"
                className="group relative flex size-14 shrink-0 items-center justify-center rounded-full bg-whatsapp text-white shadow-[0_10px_28px_-10px_rgb(14_122_109/0.75)] ring-1 ring-black/5 transition duration-200 hover:-translate-y-0.5 hover:bg-whatsapp-hover focus-visible:outline-offset-4 active:scale-95 motion-reduce:transform-none"
            >
                {isHintShowing ? (
                    <span
                        aria-hidden="true"
                        className="absolute inset-0 animate-ping rounded-full bg-whatsapp opacity-40 motion-reduce:hidden"
                    />
                ) : null}
                <SocialIcon network="WhatsApp" className="relative size-7" />
            </a>
        </div>
    )
}
