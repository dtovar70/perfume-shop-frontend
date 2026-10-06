import { useEffect, useRef, useState } from 'react'

import { PerfumeLoader } from '@/components/shared/PerfumeLoader'
import { useGlobalLoadingActions } from '@/store/loadingStore'
import { cn } from '@/utils/cn'

/**
 * Chunks that resolve faster than this never paint the loader, so quick navigations stay
 * instant instead of flashing a full-screen overlay.
 */
const APPEAR_DELAY_MS = 180

/**
 * When one loader hands over to the next (the site-content gate to the first route chunk, or
 * one route swap to another), the next one skips the delay: fading out and back in would
 * flash the half-rendered page between them.
 */
const HANDOFF_WINDOW_MS = 150
let lastVisibleLoaderEndedAt = Number.NEGATIVE_INFINITY

export interface RouteFallbackProps {
    message?: string
}

/**
 * The app-wide loader. It claims the screen on boot and on every route swap, and it
 * registers itself as soon as it mounts — before it is even visible — so spot loaders
 * stay hidden for the whole transition, not just while the overlay is painted.
 */
export function RouteFallback({ message = 'Preparando todo…' }: RouteFallbackProps) {
    const { beginGlobal, endGlobal } = useGlobalLoadingActions()
    const [isVisible, setIsVisible] = useState(
        () => performance.now() - lastVisibleLoaderEndedAt < HANDOFF_WINDOW_MS,
    )
    const isVisibleRef = useRef(isVisible)

    useEffect(() => {
        isVisibleRef.current = isVisible
    }, [isVisible])

    useEffect(() => {
        beginGlobal()
        const timeout = window.setTimeout(() => setIsVisible(true), APPEAR_DELAY_MS)

        return () => {
            window.clearTimeout(timeout)
            if (isVisibleRef.current) lastVisibleLoaderEndedAt = performance.now()
            endGlobal()
        }
    }, [beginGlobal, endGlobal])

    return (
        <div
            className={cn(
                'fixed inset-0 z-60 flex items-center justify-center bg-canvas px-4 transition-opacity duration-200 motion-reduce:transition-none',
                isVisible ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
        >
            <span
                aria-hidden="true"
                className="absolute top-1/4 -left-24 size-80 rounded-full bg-cherry-500/10 blur-3xl"
            />
            <span
                aria-hidden="true"
                className="absolute -right-24 bottom-1/4 size-80 rounded-full bg-cherry-500/10 blur-3xl"
            />

            <PerfumeLoader message={message} className="relative" />
        </div>
    )
}
