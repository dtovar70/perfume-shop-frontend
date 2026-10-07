import { useUiStore } from '@/store/uiStore'

/**
 * "Flies into the cart": a copy of the product's picture travels on an arc from where the
 * customer added it to the header cart button, shrinking into a small circle, then the cart
 * button pulses. Everything runs on the Web Animations API inside one fixed, click-through layer
 * (`FlyToCartLayer`), so the page never reflows or scrolls and any number of flights can overlap.
 *
 * Markup contract:
 * - `data-product-media` on a product picture (set by `ProductMedia`);
 * - `data-fly-scope` on a container whose picture belongs to the trigger inside it (cards);
 * - `data-fly-source="<productId>"` around a page-level picture (the detail gallery);
 * - `data-cart-target` on the header cart button.
 */

/** Diameter of the clone when it reaches the cart. */
const LANDING_SIZE = 22
/** Size of the clone when it has to start from the button itself (no picture on screen). */
const BUTTON_START_SIZE = 56
const BASE_DURATION_MS = 950
const MAX_EXTRA_DURATION_MS = 250
/** Eases in and glides out evenly, so the whole trip to the cart stays visible. */
const FLIGHT_EASING = 'cubic-bezier(.45,.05,.25,1)'
const PATH_SAMPLES = 24
/** Share of a picture that must be on screen for the flight to start from it. */
const MIN_VISIBLE_SHARE = 0.4

let layer: HTMLElement | null = null
let liveRegion: HTMLElement | null = null
const FALLBACK_LAYER_ID = 'fly-to-cart-layer'
const flights = new Set<{ animation: Animation; node: HTMLElement }>()

/** Called by `FlyToCartLayer`; `null` on unmount cancels and removes every clone in flight. */
export function registerFlyLayer(element: HTMLElement | null, region: HTMLElement | null): void {
    if (!element) {
        for (const flight of flights) {
            flight.animation.cancel()
            flight.node.remove()
        }
        flights.clear()
    }
    layer = element
    liveRegion = region
}

/**
 * The registered layer, or a self-made fallback when it is missing or detached (e.g. after a
 * hot reload re-evaluated this module and lost the registration), so a flight never silently
 * degrades into an instant landing.
 */
function flightLayer(): HTMLElement | null {
    if (layer?.isConnected) return layer
    if (typeof document === 'undefined' || !document.body) return null
    let fallback = document.getElementById(FALLBACK_LAYER_ID)
    if (!fallback) {
        fallback = document.createElement('div')
        fallback.id = FALLBACK_LAYER_ID
        fallback.setAttribute('aria-hidden', 'true')
        Object.assign(fallback.style, {
            position: 'fixed',
            inset: '0',
            zIndex: '45',
            overflow: 'hidden',
            pointerEvents: 'none',
        })
        document.body.append(fallback)
    }
    return fallback
}

export function prefersReducedMotion(): boolean {
    return (
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
}

/** Polite screen reader message; re-set on every call so repeats are announced again. */
export function announceCart(message: string): void {
    const region = liveRegion
    if (!region) return
    region.textContent = ''
    requestAnimationFrame(() => {
        region.textContent = message
    })
}

interface Point {
    x: number
    y: number
}

function visibleShare(rect: DOMRect): number {
    if (rect.width <= 0 || rect.height <= 0) return 0
    const width = Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0)
    const height = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0)
    if (width <= 0 || height <= 0) return 0
    return (width * height) / (rect.width * rect.height)
}

/**
 * Center of the visible header cart button. A button that is hidden, off screen or covered
 * (e.g. by a sticky bar) is skipped; without one the clone heads for the top-right corner.
 */
function findCartTarget(): Point {
    const candidates = document.querySelectorAll<HTMLElement>('[data-cart-target]')
    for (const candidate of candidates) {
        const rect = candidate.getBoundingClientRect()
        if (visibleShare(rect) < 0.99) continue
        const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
        const topmost = document.elementFromPoint(center.x, center.y)
        if (topmost && !candidate.contains(topmost)) continue
        return center
    }
    return { x: window.innerWidth - 28, y: 28 }
}

interface FlightSource {
    /** The picture to copy; `null` draws a plain cherry dot. */
    visual: HTMLElement | null
    rect: DOMRect
}

function findSource(trigger: HTMLElement | null, productId: string): FlightSource | null {
    const scoped = trigger
        ?.closest('[data-fly-scope]')
        ?.querySelector<HTMLElement>('[data-product-media]')
    const pageLevel = document.querySelector<HTMLElement>(
        `[data-fly-source="${CSS.escape(productId)}"] [data-product-media]`,
    )

    for (const visual of [scoped, pageLevel]) {
        if (!visual) continue
        const rect = visual.getBoundingClientRect()
        if (visibleShare(rect) >= MIN_VISIBLE_SHARE) return { visual, rect }
    }

    // The picture is scrolled away (e.g. the phone sticky bar): start small, from the button.
    if (!trigger) return null
    const button = trigger.getBoundingClientRect()
    const x = button.left + button.width / 2 - BUTTON_START_SIZE / 2
    const y = button.top + button.height / 2 - BUTTON_START_SIZE / 2
    return {
        visual: scoped ?? pageLevel ?? null,
        rect: new DOMRect(x, y, BUTTON_START_SIZE, BUTTON_START_SIZE),
    }
}

/**
 * A square, click-through copy of the picture, centered on the source rect: an outer node that
 * travels the path and an inner "token" that shrinks, rounds and spins on its own timing.
 */
function buildClone(source: FlightSource, size: number): { node: HTMLElement; token: HTMLElement } {
    const { rect, visual } = source
    const node = document.createElement('div')
    node.setAttribute('aria-hidden', 'true')
    node.className = 'fly-to-cart-clone'
    Object.assign(node.style, {
        position: 'fixed',
        left: `${rect.left + rect.width / 2 - size / 2}px`,
        top: `${rect.top + rect.height / 2 - size / 2}px`,
        width: `${size}px`,
        height: `${size}px`,
        margin: '0',
        willChange: 'transform',
    })

    const token = document.createElement('div')
    Object.assign(token.style, {
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        borderRadius: '16px',
        transformOrigin: '50% 50%',
        willChange: 'transform, opacity, border-radius',
        boxShadow: '0 0 0 1px var(--theme-line-strong), var(--theme-shadow-lift)',
        background: 'var(--theme-surface)',
    })

    if (visual) {
        const copy = visual.cloneNode(true) as HTMLElement
        copy.removeAttribute('data-product-media')
        copy.style.width = '100%'
        copy.style.height = '100%'
        copy.style.transform = 'none'
        for (const image of copy.querySelectorAll('img')) {
            image.loading = 'eager'
            image.removeAttribute('alt')
        }
        token.append(copy)
    } else {
        token.style.background = 'var(--theme-cherry-500)'
    }
    node.append(token)
    return { node, token }
}

/** Point on the quadratic Bézier p0 → p2 bent by c, at t ∈ [0, 1]. */
function bezier(p0: Point, c: Point, p2: Point, t: number): Point {
    const u = 1 - t
    return {
        x: u * u * p0.x + 2 * u * t * c.x + t * t * p2.x,
        y: u * u * p0.y + 2 * u * t * c.y + t * t * p2.y,
    }
}

export interface FlyToCartOptions {
    /** The clicked control; used to find the picture (or to start from it). */
    trigger: HTMLElement | null
    productId: string
    productName: string
    /** Runs when the flight lands (right away when there is no flight). */
    onLand?: () => void
}

/**
 * Plays the flight for one add-to-cart. Call it in the click handler *before* changing the
 * cart, so the picture is measured where the customer saw it. With reduced motion there is no
 * flight: the cart pulses and `onLand` runs at once.
 */
export function flyToCart({ trigger, productId, productName, onLand }: FlyToCartOptions): void {
    announceCart(`Agregado al carrito: ${productName}`)

    const land = () => {
        useUiStore.getState().pulseCart()
        onLand?.()
    }

    const host = flightLayer()
    const source = host && !prefersReducedMotion() ? findSource(trigger, productId) : null
    if (!host || !source || typeof host.animate !== 'function') {
        land()
        return
    }

    const size = Math.max(LANDING_SIZE, Math.min(source.rect.width, source.rect.height))
    const { node, token } = buildClone(source, size)
    host.append(node)

    const start = {
        x: source.rect.left + source.rect.width / 2,
        y: source.rect.top + source.rect.height / 2,
    }
    const end = findCartTarget()
    const distance = Math.hypot(end.x - start.x, end.y - start.y)
    const duration = BASE_DURATION_MS + Math.min(MAX_EXTRA_DURATION_MS, distance / 8)
    // Rises first, then glides into the cart: the bend sits above both ends, near the start.
    const control = {
        x: start.x + (end.x - start.x) * 0.25,
        y: Math.max(16, Math.min(start.y, end.y) - Math.min(220, Math.max(60, distance * 0.3))),
    }

    // The path: sampled along the curve, eased as a whole (a small pull back, then the throw).
    const path: Keyframe[] = []
    for (let index = 0; index <= PATH_SAMPLES; index += 1) {
        const t = index / PATH_SAMPLES
        const point = bezier(start, control, end, t)
        path.push({
            offset: t,
            transform: `translate(${point.x - start.x}px, ${point.y - start.y}px)`,
        })
    }

    // The token: lifts a touch, then shrinks into a circle right away (so it never hangs in
    // place during the pull back), turns slightly and fades as it lands.
    const endScale = LANDING_SIZE / size
    const startRadius = Math.min(50, (16 / size) * 100)
    const shape: Keyframe[] = [
        {
            offset: 0,
            transform: 'rotate(0deg) scale(1)',
            borderRadius: `${startRadius}%`,
            opacity: 1,
        },
        {
            offset: 0.12,
            transform: 'rotate(3deg) scale(1.05)',
            borderRadius: `${startRadius + 6}%`,
            opacity: 1,
        },
        {
            offset: 0.45,
            transform: `rotate(-4deg) scale(${Math.max(endScale, 0.32)})`,
            borderRadius: '50%',
            opacity: 1,
        },
        {
            offset: 0.85,
            transform: `rotate(-10deg) scale(${endScale * 1.15})`,
            borderRadius: '50%',
            opacity: 1,
        },
        {
            offset: 1,
            transform: `rotate(-14deg) scale(${endScale})`,
            borderRadius: '50%',
            opacity: 0.15,
        },
    ]

    const animation = node.animate(path, { duration, easing: FLIGHT_EASING, fill: 'forwards' })
    const shapeAnimation = token.animate(shape, { duration, easing: 'ease-out', fill: 'forwards' })
    const flight = { animation, node }
    flights.add(flight)

    animation.finished.then(
        () => {
            flights.delete(flight)
            shapeAnimation.cancel()
            node.remove()
            land()
        },
        // Cancelled (the layer unmounted): just clean up.
        () => {
            flights.delete(flight)
            node.remove()
        },
    )
}
