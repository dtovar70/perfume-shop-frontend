import { lazy, Suspense, useEffect } from 'react'
import { useLocation } from 'react-router'

import { useQuickView } from '@/store/uiStore'

/** Its own chunk: the dialog pulls in the product page's buy box, only needed once opened. */
const QuickViewDialog = lazy(() =>
    import('@/components/shared/QuickViewDialog').then((module) => ({
        default: module.QuickViewDialog,
    })),
)

/** Renders the quick view of whichever product a card asked for; closes on navigation. */
export function QuickViewHost() {
    const { slug, close } = useQuickView()
    const location = useLocation()

    useEffect(() => {
        close()
    }, [location.pathname, location.search, close])

    if (!slug) return null
    return (
        <Suspense fallback={null}>
            {/* Keyed by slug: another product starts with its own size and quantity. */}
            <QuickViewDialog key={slug} slug={slug} onClose={close} />
        </Suspense>
    )
}
