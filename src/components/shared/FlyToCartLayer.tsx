import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import { registerFlyLayer } from '@/utils/flyToCart'

/**
 * The fixed, click-through layer the fly-to-cart clones travel in (above the sticky header and
 * bars, below drawers and dialogs), plus the polite live region that announces each add.
 * Mounted once by the store layout; unmounting it cancels every flight.
 */
export function FlyToCartLayer() {
    const layerRef = useRef<HTMLDivElement>(null)
    const regionRef = useRef<HTMLParagraphElement>(null)

    useEffect(() => {
        registerFlyLayer(layerRef.current, regionRef.current)
        return () => registerFlyLayer(null, null)
    }, [])

    return createPortal(
        <>
            <div
                ref={layerRef}
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 z-[45] overflow-hidden"
            />
            <p ref={regionRef} role="status" aria-live="polite" className="sr-only" />
        </>,
        document.body,
    )
}
