import { BottleArt } from '@/components/shared/BottleArt'
import { cldSrcSet, cldUrl } from '@/utils/cloudinary'
import { cn } from '@/utils/cn'

type MediaSize = 'sm' | 'md' | 'lg'

/**
 * Candidate widths (for `srcSet`) and the default `sizes` of each slot. Phones with 2-3x screens
 * pick the larger candidates; nothing ever downloads the full-size upload. Over the backdrop the
 * photo's CSS size comes from `sizes`, so it must be at least the frame's width.
 */
const RESPONSIVE: Record<MediaSize, { widths: number[]; sizes: string }> = {
    sm: { widths: [96, 192, 288], sizes: '96px' },
    md: { widths: [320, 480, 640, 800], sizes: '(min-width: 1024px) 22rem, 50vw' },
    lg: { widths: [480, 800, 1200, 1600], sizes: '(min-width: 1024px) 52rem, 100vw' },
}

/**
 * Breathing room between the plate's edge and the photo: about 6px on thumbnails and a share
 * of the frame on cards and the gallery, so a tall bottle never touches the frame.
 */
const PLATE_PADDING: Record<MediaSize, string> = {
    sm: 'p-1.5',
    md: 'p-[5%]',
    lg: 'p-[4%]',
}

/** Corners of the photo laid over the blurred backdrop, in step with its frame. */
const PHOTO_RADIUS: Record<MediaSize, string> = {
    sm: '',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
}

/** Width of the blurred backdrop: blurred this much, a tiny download looks the same as a big one. */
const BACKDROP_WIDTH = 64

/** Intrinsic size hints (4:5, the frame most slots use); CSS sizes the photo to its frame. */
const INTRINSIC: Record<MediaSize, { width: number; height: number }> = {
    sm: { width: 96, height: 120 },
    md: { width: 640, height: 800 },
    lg: { width: 1200, height: 1500 },
}

export interface ProductMediaImage {
    url: string
    alt?: string | null
}

export interface ProductMediaProps {
    /** Uploaded photo; when missing, the bottle placeholder is drawn instead. */
    image?: ProductMediaImage
    /** Accessible name for the photo when it has no `alt` of its own. */
    fallbackAlt?: string
    /** Shown on the placeholder under the bottle. */
    brandName?: string | null
    size?: MediaSize
    /** Applied to the root (the plate, or the placeholder); both fill their parent frame. */
    className?: string
    /** Sold-out look: the photo (not the plate) or the placeholder fades to grey. */
    muted?: boolean
    loading?: 'eager' | 'lazy'
    /** `sizes` of the photo when its slot is not the size variant's default width. */
    sizes?: string
    /** Hint for the most important photo of the page (the gallery's main image). */
    fetchPriority?: 'high' | 'low' | 'auto'
}

/**
 * A product's photo, whole (`object-contain`) and never cropped, over a blurred, enlarged copy
 * of itself that fills the frame: photos with their own background (AI scenes) leave no empty
 * bands, and white-background photos still read as a light plate. Thumbnails (`sm`) keep the
 * plain plate. Without a photo, a
 * dark placeholder with a line-drawn bottle when it has none. Both fill the parent: the caller
 * owns the frame (aspect ratio, radius). The root carries `data-product-media`, which the
 * fly-to-cart effect clones.
 */
export function ProductMedia({
    image,
    fallbackAlt,
    brandName,
    size = 'md',
    className,
    muted = false,
    loading = 'lazy',
    sizes,
    fetchPriority,
}: ProductMediaProps) {
    if (!image) {
        return (
            <BottlePlaceholder
                brandName={brandName}
                size={size}
                className={cn(muted && 'opacity-50 grayscale', className)}
            />
        )
    }

    const responsive = RESPONSIVE[size]
    const srcSet = cldSrcSet(image.url, responsive.widths)
    const hasBackdrop = size !== 'sm'

    return (
        <div
            data-product-media=""
            className={cn(
                'relative product-plate size-full overflow-hidden',
                // Centres the photo, which over the backdrop is sized to its own pixels.
                hasBackdrop && 'flex items-center justify-center',
                PLATE_PADDING[size],
                className,
            )}
        >
            {hasBackdrop ? (
                <img
                    src={cldUrl(image.url, BACKDROP_WIDTH)}
                    alt=""
                    aria-hidden="true"
                    loading={loading}
                    decoding="async"
                    draggable={false}
                    className={cn(
                        // Scaled up so the blur's soft edge falls outside the frame; important so hover zooms
                        // that target every `img` (CategoryCard) move only the photo. Slightly
                        // dimmed so the photo stands out; a white background stays near white.
                        'pointer-events-none absolute inset-0 size-full scale-125! object-cover blur-2xl brightness-[0.87] select-none',
                        muted && 'opacity-55 grayscale',
                    )}
                />
            ) : null}
            <img
                src={cldUrl(image.url, responsive.widths.at(-1) ?? 800)}
                srcSet={srcSet}
                sizes={srcSet ? (sizes ?? responsive.sizes) : undefined}
                alt={image.alt || fallbackAlt || ''}
                width={INTRINSIC[size].width}
                height={INTRINSIC[size].height}
                loading={loading}
                fetchPriority={fetchPriority}
                decoding="async"
                draggable={false}
                className={cn(
                    'relative select-none',
                    hasBackdrop
                        ? // Box = the photo itself (not the frame), so corners and shadow hug it.
                          cn(
                              'h-auto max-h-full w-auto max-w-full shadow-[0_14px_36px_-10px_rgb(0_0_0/0.5)]',
                              PHOTO_RADIUS[size],
                          )
                        : // Multiply melts a white background into the plate.
                          'size-full object-contain object-center mix-blend-multiply',
                    muted && 'opacity-55 grayscale',
                )}
            />
        </div>
    )
}

interface BottlePlaceholderProps {
    brandName?: string | null
    size: MediaSize
    className?: string
}

/** Dark card with a soft cherry glow, a line-art bottle and the brand name. Decorative. */
function BottlePlaceholder({ brandName, size, className }: BottlePlaceholderProps) {
    const isSmall = size === 'sm'

    return (
        <div
            aria-hidden="true"
            data-product-media=""
            className={cn(
                'relative flex size-full flex-col items-center justify-center gap-3 overflow-hidden bg-surface glow-spot select-none',
                className,
            )}
        >
            <BottleArt
                className={cn(
                    'relative',
                    isSmall
                        ? 'h-3/5 w-auto'
                        : size === 'lg'
                          ? 'h-auto w-[30%] max-w-44 min-w-16'
                          : 'h-auto w-[30%] max-w-28 min-w-12',
                )}
                strokeWidth={isSmall ? 2.5 : 1.5}
            />

            {brandName && !isSmall ? (
                <span
                    className={cn(
                        'relative line-clamp-2 max-w-[90%] px-2 text-center font-display text-xs leading-tight font-medium tracking-[0.18em] text-fg-soft uppercase sm:text-sm',
                        // On two-column phone cards the brand already sits under the frame.
                        size === 'md' && 'max-sm:hidden',
                    )}
                >
                    {brandName}
                </span>
            ) : null}
        </div>
    )
}
