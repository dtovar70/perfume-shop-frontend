import { cldSrcSet, cldUrl } from '@/utils/cloudinary'
import { cn } from '@/utils/cn'

type MediaSize = 'sm' | 'md' | 'lg'

/**
 * Candidate widths (for `srcSet`) and the default `sizes` of each slot. Phones with 2-3x screens
 * pick the larger candidates; nothing ever downloads the full-size upload.
 */
const RESPONSIVE: Record<MediaSize, { widths: number[]; sizes: string }> = {
    sm: { widths: [96, 192, 288], sizes: '96px' },
    md: { widths: [320, 480, 640, 800], sizes: '(min-width: 1024px) 22rem, 50vw' },
    lg: { widths: [480, 800, 1200, 1600], sizes: '(min-width: 1024px) 40rem, 100vw' },
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
    /** `cover` crops to fill the frame (cards); `contain` shows the whole photo (gallery). */
    fit?: 'cover' | 'contain'
    /** Applied to the image (or placeholder); both fill their parent frame. */
    className?: string
    loading?: 'eager' | 'lazy'
    /** `sizes` of the photo when its slot is not the size variant's default width. */
    sizes?: string
    /** Hint for the most important photo of the page (the gallery's main image). */
    fetchPriority?: 'high' | 'low' | 'auto'
}

/**
 * A product's photo, or a blush placeholder with a line-drawn bottle when it has none. Both fill
 * the parent: the caller owns the frame (aspect ratio, radius, background).
 */
export function ProductMedia({
    image,
    fallbackAlt,
    brandName,
    size = 'md',
    fit = 'cover',
    className,
    loading = 'lazy',
    sizes,
    fetchPriority,
}: ProductMediaProps) {
    if (!image) {
        return <BottlePlaceholder brandName={brandName} size={size} className={className} />
    }

    const responsive = RESPONSIVE[size]
    const srcSet = cldSrcSet(image.url, responsive.widths)

    return (
        <img
            src={cldUrl(image.url, responsive.widths.at(-1) ?? 800)}
            srcSet={srcSet}
            sizes={srcSet ? (sizes ?? responsive.sizes) : undefined}
            alt={image.alt || fallbackAlt || ''}
            loading={loading}
            fetchPriority={fetchPriority}
            decoding="async"
            draggable={false}
            className={cn(
                'size-full select-none',
                fit === 'cover' ? 'object-cover' : 'object-contain',
                className,
            )}
        />
    )
}

interface BottlePlaceholderProps {
    brandName?: string | null
    size: MediaSize
    className?: string
}

/** Blush-to-champagne card with a minimal perfume bottle and the brand name. Decorative. */
function BottlePlaceholder({ brandName, size, className }: BottlePlaceholderProps) {
    const isSmall = size === 'sm'

    return (
        <div
            aria-hidden="true"
            className={cn(
                'gradient-blush relative flex size-full flex-col items-center justify-center gap-3 overflow-hidden select-none',
                className,
            )}
        >
            {/* Soft light behind the bottle. */}
            <span className="absolute top-1/2 left-1/2 size-3/5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60 blur-2xl" />

            <svg
                viewBox="0 0 80 112"
                fill="none"
                className={cn(
                    'relative text-rose-700/70',
                    isSmall ? 'h-3/5 w-auto' : 'h-auto w-[28%] max-w-28 min-w-12',
                )}
            >
                {/* Cap */}
                <rect x="28" y="6" width="24" height="18" rx="3" className="fill-gold-300/70" />
                <path d="M28 14h24" stroke="#a77b3b" strokeOpacity=".5" strokeWidth="1" />
                {/* Neck */}
                <rect x="33" y="24" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                {/* Body */}
                <rect x="8" y="33" width="64" height="73" rx="12" stroke="currentColor" strokeWidth="1.5" />
                {/* Juice */}
                <path
                    d="M12 72c10 5 46 5 56 0v22a8 8 0 0 1-8 8H20a8 8 0 0 1-8-8Z"
                    className="fill-rose-200/70"
                />
                {/* Label */}
                <rect x="22" y="48" width="36" height="16" rx="2" stroke="#c4954f" strokeOpacity=".7" strokeWidth="1" />
                {/* Glass highlight */}
                <path d="M17 44v26" stroke="white" strokeWidth="3" strokeLinecap="round" strokeOpacity=".8" />
            </svg>

            {brandName && !isSmall ? (
                <span className="relative max-w-[85%] truncate px-2 font-display text-sm tracking-[0.18em] text-rose-800/80 uppercase sm:text-base">
                    {brandName}
                </span>
            ) : null}
        </div>
    )
}
