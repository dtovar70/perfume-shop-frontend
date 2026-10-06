import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    useSyncExternalStore,
    type HTMLAttributes,
    type ReactNode,
} from 'react'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router'

import type { HeroMedia } from '@/@types/content'
import type { Product } from '@/@types/product'
import { BottleArt, type BottleShape } from '@/components/shared/BottleArt'
import { ProductMedia } from '@/components/shared/ProductMedia'
import { Skeleton, Sticker } from '@/components/ui'
import { productPath } from '@/constants/route.constant'
import { cldSrcSet, cldUrl, cldVideoPoster } from '@/utils/cloudinary'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/formatCurrency'
import { usePrefersReducedMotion } from '@/utils/hooks/useMediaQuery'
import { useSiteContent, useSiteContentQuery } from '@/utils/hooks/useSiteContent'
import { priceRange } from '@/utils/productPrice'
import { useFeaturedProducts } from '@/views/home/hooks/useFeaturedProducts'

/** Time each featured product stays in the big card. */
const ROTATION_MS = 5000
/** Slides of the carousel; more dots would not fit beside the corner card on phones. */
const MAX_SLIDES = 5
/** Widths the big card renders at (it is capped at 32rem). */
const CARD_SIZES = '(min-width: 1024px) 32rem, (min-width: 640px) 28rem, 19rem'

/*
 * One frame for every mode, so swapping content never moves anything: the big square card, two
 * square cards tucked into its corners and two tilted stickers.
 */
// `isolate` keeps the slides' z-index inside the card, under the corner cards and stickers.
const BIG_CARD =
    'relative isolate aspect-square overflow-hidden rounded-blob border border-line bg-surface glow-cherry shadow-lift'
const CORNER_CARD =
    'absolute aspect-square overflow-hidden rounded-3xl border border-line shadow-lift'
const CORNERS = [
    { position: '-bottom-8 -left-3 w-28 sm:-left-6 sm:w-36', sizes: '9rem', shape: 'round' },
    { position: '-top-6 -right-2 w-24 sm:-right-5 sm:w-28', sizes: '7rem', shape: 'tall' },
] as const satisfies readonly { position: string; sizes: string; shape: BottleShape }[]

type CornerSlot = (typeof CORNERS)[number]

function subscribeVisibility(onChange: () => void) {
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
}

/** False while the tab is in the background. */
function usePageVisible(): boolean {
    return useSyncExternalStore(
        subscribeVisibility,
        () => document.visibilityState === 'visible',
        () => true,
    )
}

/** The visitor asked the browser to save data (Chrome's "Lite mode", Android data saver). */
function prefersSaveData(): boolean {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    return connection?.saveData === true
}

function priceLabel(product: Product): string {
    const { min, max } = priceRange(product)
    return `${min !== max ? 'Desde ' : ''}${formatCurrency(min)}`
}

/**
 * Right side of the home hero. With a hero photo or video from the admin, it fills the big
 * card and two featured products sit in the corners; otherwise the featured products rotate
 * through the big card. With no product photos at all, the drawn bottles remain.
 */
export function HeroShowcase() {
    const { home } = useSiteContent()
    const contentQuery = useSiteContentQuery()
    const featured = useFeaturedProducts()
    const products = useMemo(
        () => (featured.data ?? []).filter((product) => product.images.length > 0),
        [featured.data],
    )

    // Until the content arrives we cannot know whether a hero media exists.
    const contentLoading = contentQuery.isPending && contentQuery.failureCount === 0
    const productsLoading = featured.isPending && featured.failureCount === 0
    const media = home.heroMedia

    if (contentLoading) return <ShowcaseFrame big={<PlateSkeleton />} corners="loading" />

    if (media) {
        const shown = products.slice(0, 2)
        return (
            <ShowcaseFrame
                big={<HeroMediaView media={media} />}
                corners={productsLoading ? 'loading' : shown.length ? shown : 'art'}
                sticker={
                    shown.length === 0 || shown.some((product) => product.tags.includes('nuevo'))
                        ? '¡Nuevo!'
                        : 'Destacados'
                }
            />
        )
    }

    if (products.length > 0) return <FeaturedCarousel products={products.slice(0, MAX_SLIDES)} />
    if (productsLoading) return <ShowcaseFrame big={<PlateSkeleton />} corners="loading" />
    return <ShowcaseFrame big={<DrawnBottle />} corners="art" sticker="¡Nuevo!" />
}

interface ShowcaseFrameProps {
    big: ReactNode
    /** Products to show in the corners (repeated when fewer than two), or a placeholder. */
    corners: readonly Product[] | 'loading' | 'art'
    /** Top-left sticker; none while loading. */
    sticker?: ReactNode
    /** Extra layers inside the big card (carousel controls). */
    overlay?: ReactNode
    className?: string
    frameProps?: HTMLAttributes<HTMLDivElement>
}

function ShowcaseFrame({
    big,
    corners,
    sticker,
    overlay,
    className,
    frameProps,
}: ShowcaseFrameProps) {
    return (
        <div
            {...frameProps}
            className={cn(
                'relative mx-auto w-full max-w-[19rem] sm:max-w-md lg:max-w-lg',
                className,
            )}
        >
            <div className={BIG_CARD}>
                {big}
                {overlay}
            </div>

            {CORNERS.map((slot, index) => (
                <CornerCard
                    key={slot.position}
                    slot={slot}
                    content={
                        typeof corners === 'string'
                            ? corners
                            : corners.length
                              ? corners[index % corners.length]
                              : 'art'
                    }
                />
            ))}

            {sticker ? (
                <Sticker
                    tone="blush"
                    size="lg"
                    rotation="left"
                    aria-hidden="true"
                    className="absolute -top-4 left-4 max-w-[calc(100%-8rem)] shadow-lift sm:max-w-[calc(100%-9.5rem)]"
                >
                    {sticker}
                </Sticker>
            ) : null}
            <Sticker
                tone="sky"
                rotation="right"
                aria-hidden="true"
                className="absolute right-3 -bottom-4 shadow-lift"
            >
                100% original
            </Sticker>
        </div>
    )
}

function CornerCard({
    slot,
    content,
}: {
    slot: CornerSlot
    content: Product | 'loading' | 'art' | undefined
}) {
    if (content === 'loading') {
        return (
            <div aria-hidden="true" className={cn(CORNER_CARD, 'product-plate p-4', slot.position)}>
                <Skeleton shape="block" className="size-full rounded-2xl bg-black/5" />
            </div>
        )
    }
    if (!content || content === 'art') {
        return (
            <div
                aria-hidden="true"
                className={cn(
                    CORNER_CARD,
                    'flex items-center justify-center bg-elevated p-4',
                    slot.position,
                )}
            >
                <BottleArt shape={slot.shape} className="h-[72%] w-auto" />
            </div>
        )
    }
    return (
        <Link
            to={productPath(content.slug)}
            aria-label={content.name}
            className={cn(
                CORNER_CARD,
                'block transition duration-300 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-cherry-500 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:outline-none motion-reduce:transform-none',
                slot.position,
            )}
        >
            <ProductMedia
                image={{ url: content.images[0]?.url ?? '', alt: '' }}
                size="sm"
                sizes={slot.sizes}
                loading="eager"
                className="p-[12%]"
            />
        </Link>
    )
}

/** Light plate with a pulsing bottle-sized block: holds the card while the photos load. */
function PlateSkeleton() {
    return (
        <div
            aria-hidden="true"
            className="product-plate flex size-full items-center justify-center"
        >
            <Skeleton shape="block" className="h-[62%] w-[38%] rounded-[2rem] bg-black/6" />
        </div>
    )
}

/** The original drawn bottle: the last resort when no product has a photo. */
function DrawnBottle() {
    return (
        <div aria-hidden="true" className="flex size-full items-center justify-center">
            <span className="absolute bottom-[12%] left-1/2 h-6 w-1/2 -translate-x-1/2 rounded-full bg-cherry-500/25 blur-xl" />
            <BottleArt className="relative h-[62%] w-auto text-fg/85" strokeWidth={1.1} />
        </div>
    )
}

/* -------------------------------------------------------------- Hero media */

function HeroMediaView({ media }: { media: HeroMedia }) {
    if (media.type === 'video') return <HeroVideo media={media} />
    return (
        <img
            src={cldUrl(media.url, 1200)}
            srcSet={cldSrcSet(media.url, [480, 800, 1200])}
            sizes={CARD_SIZES}
            alt={media.alt}
            width={1200}
            height={1200}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            draggable={false}
            className="absolute inset-0 size-full object-cover select-none"
        />
    )
}

/**
 * Muted, looping, inline and without controls, like a moving photo. It plays only while on
 * screen; with reduced motion or data saver it stays a still (the poster, or the first frame).
 */
function HeroVideo({ media }: { media: HeroMedia }) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const prefersReducedMotion = usePrefersReducedMotion()
    const [saveData] = useState(prefersSaveData)
    const isStill = prefersReducedMotion || saveData
    const poster = media.posterUrl ? cldUrl(media.posterUrl, 1200) : cldVideoPoster(media.url)
    const a11y = media.alt
        ? { role: 'img' as const, 'aria-label': media.alt }
        : { 'aria-hidden': true as const }

    useEffect(() => {
        const video = videoRef.current
        if (!video || isStill) return
        // Some browsers only allow autoplay once the property (not just the attribute) is set.
        video.muted = true
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) void video.play().catch(() => undefined)
                else video.pause()
            },
            { threshold: 0.2 },
        )
        observer.observe(video)
        return () => {
            observer.disconnect()
            video.pause()
        }
    }, [isStill, media.url])

    if (isStill && poster) {
        return (
            <img
                src={poster}
                alt={media.alt}
                width={1200}
                height={1200}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="absolute inset-0 size-full object-cover"
            />
        )
    }

    return (
        <video
            ref={videoRef}
            key={media.url}
            // Without a poster, `#t=0.1` makes browsers paint the first frame of a still video.
            src={isStill ? `${media.url}#t=0.1` : media.url}
            poster={poster ?? undefined}
            autoPlay={!isStill}
            muted
            loop
            playsInline
            disablePictureInPicture
            preload="metadata"
            width={1200}
            height={1200}
            className="absolute inset-0 size-full object-cover"
            {...a11y}
        />
    )
}

/* --------------------------------------------------------------- Carousel */

function FeaturedCarousel({ products }: { products: Product[] }) {
    const count = products.length
    const [index, setIndex] = useState(0)
    const [isHovered, setIsHovered] = useState(false)
    const [hasFocus, setHasFocus] = useState(false)
    // Once the visitor moves the carousel (or pauses it), it no longer rotates on its own.
    const [isStopped, setIsStopped] = useState(false)
    const prefersReducedMotion = usePrefersReducedMotion()
    const isPageVisible = usePageVisible()

    const current = index % count
    const canRotate = count > 1 && !prefersReducedMotion && !isStopped
    const isRotating = canRotate && !isHovered && !hasFocus && isPageVisible

    useEffect(() => {
        if (!isRotating) return
        const timer = window.setTimeout(() => setIndex((value) => (value + 1) % count), ROTATION_MS)
        return () => window.clearTimeout(timer)
    }, [isRotating, current, count])

    const goTo = useCallback(
        (next: number) => {
            setIsStopped(true)
            setIndex(((next % count) + count) % count)
        },
        [count],
    )

    const product = products[current] ?? products[0]
    if (!product) return null
    const corners = [products[(current + 1) % count], products[(current + 2) % count]].filter(
        (item): item is Product => item !== undefined,
    )

    return (
        <ShowcaseFrame
            frameProps={{
                role: 'region',
                'aria-roledescription': 'carrusel',
                'aria-label': 'Productos destacados',
                onMouseEnter: () => setIsHovered(true),
                onMouseLeave: () => setIsHovered(false),
                onFocus: () => setHasFocus(true),
                onBlur: (event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) setHasFocus(false)
                },
            }}
            big={
                <div
                    className="absolute inset-0"
                    aria-live={isRotating ? 'off' : 'polite'}
                    aria-atomic="false"
                >
                    {products.map((item, position) => {
                        const isActive = position === current
                        return (
                            <motion.div
                                key={item.id}
                                role="group"
                                aria-roledescription="diapositiva"
                                aria-label={`${position + 1} de ${count}`}
                                aria-hidden={!isActive}
                                inert={!isActive}
                                initial={false}
                                animate={
                                    prefersReducedMotion
                                        ? { opacity: isActive ? 1 : 0 }
                                        : { opacity: isActive ? 1 : 0, scale: isActive ? 1 : 1.04 }
                                }
                                transition={{
                                    duration: prefersReducedMotion ? 0.15 : 0.9,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                                className={cn('absolute inset-0', isActive ? 'z-1' : 'z-0')}
                            >
                                <Link
                                    to={productPath(item.slug)}
                                    aria-label={`${item.name}, ${priceLabel(item)}`}
                                    className="block size-full focus-visible:outline-none"
                                >
                                    <ProductMedia
                                        image={{ url: item.images[0]?.url ?? '', alt: '' }}
                                        size="lg"
                                        sizes={CARD_SIZES}
                                        loading={position === 0 ? 'eager' : 'lazy'}
                                        fetchPriority={position === 0 ? 'high' : 'low'}
                                        // Extra room at the bottom for the controls.
                                        className="px-[12%] pt-[8%] pb-[19%]"
                                    />
                                </Link>
                            </motion.div>
                        )
                    })}
                </div>
            }
            overlay={
                count > 1 ? (
                    <CarouselControls
                        count={count}
                        current={current}
                        isRotating={canRotate}
                        onSelect={goTo}
                        onToggle={() => setIsStopped((value) => !value)}
                        canToggle={!prefersReducedMotion}
                    />
                ) : null
            }
            corners={corners}
            sticker={
                <motion.span
                    key={product.id}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex min-w-0 items-center gap-1.5"
                >
                    <span className="truncate">{product.name}</span>
                    <span>·</span>
                    <span className="shrink-0 tabular-nums">{priceLabel(product)}</span>
                </motion.span>
            }
        />
    )
}

interface CarouselControlsProps {
    count: number
    current: number
    isRotating: boolean
    canToggle: boolean
    onSelect: (index: number) => void
    onToggle: () => void
}

const controlButton =
    'flex size-8 shrink-0 items-center justify-center rounded-full text-fg transition hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-cherry-500 focus-visible:outline-none'

/**
 * Inside the card's lower-right, clear of the corner card and the "100% original" sticker.
 * Sits on the light plate in both themes, so it uses the plate's own light surface. Phones get
 * the dots only (the arrows would run under the corner card).
 */
function CarouselControls({
    count,
    current,
    isRotating,
    canToggle,
    onSelect,
    onToggle,
}: CarouselControlsProps) {
    return (
        <div className="absolute right-4 bottom-7 z-10 flex items-center gap-0.5 rounded-full border border-black/10 bg-white/85 p-0.5 text-neutral-900 shadow-soft backdrop-blur-sm sm:right-6 sm:bottom-8 [&_svg]:text-neutral-900">
            {canToggle ? (
                <button
                    type="button"
                    onClick={onToggle}
                    aria-label={isRotating ? 'Pausar el carrusel' : 'Reanudar el carrusel'}
                    className={controlButton}
                >
                    {isRotating ? (
                        <Pause aria-hidden="true" className="size-3.5" />
                    ) : (
                        <Play aria-hidden="true" className="size-3.5" />
                    )}
                </button>
            ) : null}
            <button
                type="button"
                onClick={() => onSelect(current - 1)}
                aria-label="Producto anterior"
                className={cn(controlButton, 'max-sm:hidden')}
            >
                <ChevronLeft aria-hidden="true" className="size-4" />
            </button>
            <div className="flex items-center">
                {Array.from({ length: count }, (_, position) => (
                    <button
                        key={position}
                        type="button"
                        onClick={() => onSelect(position)}
                        aria-label={`Ver el producto ${position + 1} de ${count}`}
                        aria-current={position === current ? 'true' : undefined}
                        className="group flex size-6 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-cherry-500 focus-visible:outline-none"
                    >
                        <span
                            className={cn(
                                'block h-1.5 rounded-full transition-all duration-300',
                                position === current
                                    ? 'w-4 bg-cherry-500'
                                    : 'w-1.5 bg-neutral-900/30 group-hover:bg-neutral-900/55',
                            )}
                        />
                    </button>
                ))}
            </div>
            <button
                type="button"
                onClick={() => onSelect(current + 1)}
                aria-label="Producto siguiente"
                className={cn(controlButton, 'max-sm:hidden')}
            >
                <ChevronRight aria-hidden="true" className="size-4" />
            </button>
        </div>
    )
}
