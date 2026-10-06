import { useEffect } from 'react'
import { useLocation } from 'react-router'

/**
 * Resets the scroll position on navigation; hash links scroll to their target instead.
 */
export function ScrollToTop() {
    const { pathname, hash } = useLocation()

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const behavior = prefersReducedMotion ? 'auto' : 'smooth'

        if (hash) {
            // Client-side links ("/contacto#preguntas") land before the lazy page renders:
            // retry for a moment until the target exists.
            let tries = 0
            const id = window.setInterval(() => {
                const target = document.getElementById(decodeURIComponent(hash.slice(1)))
                if (target || ++tries > 20) {
                    window.clearInterval(id)
                    target?.scrollIntoView({ behavior, block: 'start' })
                }
            }, 100)
            return () => window.clearInterval(id)
        }

        window.scrollTo({ top: 0, behavior })
        return undefined
    }, [pathname, hash])

    return null
}
