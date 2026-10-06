import { ProductMedia } from '@/components/shared/ProductMedia'
import { cn } from '@/utils/cn'

export interface ProductThumbnailProps {
    /** Product photo; without one the bottle placeholder is drawn. */
    imageUrl?: string | null
    /** Accessible name of the photo; "" when the product name is already next to it. */
    alt?: string
    brandName?: string | null
    /** `md` for large slots (the cart page on phones); `sm` for list rows. */
    size?: 'sm' | 'md'
    /** Width (and radius overrides); the frame is always 4:5, tall enough for a whole bottle. */
    className?: string
}

/**
 * The one small product picture of lists (cart drawer, cart page, checkout, orders, admin):
 * a 4:5 frame with the photo whole on the light plate, or the bottle placeholder.
 */
export function ProductThumbnail({
    imageUrl,
    alt = '',
    brandName,
    size = 'sm',
    className,
}: ProductThumbnailProps) {
    return (
        <div
            className={cn(
                'aspect-[4/5] w-14 shrink-0 overflow-hidden rounded-xl border border-line bg-elevated',
                className,
            )}
        >
            <ProductMedia
                image={imageUrl ? { url: imageUrl, alt } : undefined}
                fallbackAlt={alt}
                brandName={brandName}
                size={size}
            />
        </div>
    )
}
