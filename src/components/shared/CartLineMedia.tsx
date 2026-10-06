import type { CartItem } from '@/@types/cart'
import { ProductMedia } from '@/components/shared/ProductMedia'
import { cn } from '@/utils/cn'

export interface CartLineMediaProps {
    item: CartItem
    size: 'sm' | 'lg'
    className?: string
}

/** A cart line's picture in a 4:5 frame: the product photo, or the bottle placeholder. */
export function CartLineMedia({ item, size, className }: CartLineMediaProps) {
    return (
        <div
            className={cn(
                'aspect-[4/5] shrink-0 overflow-hidden bg-rose-50',
                size === 'sm' ? 'w-16 rounded-xl sm:w-20' : 'w-full rounded-2xl',
                className,
            )}
        >
            <ProductMedia
                image={item.imageUrl ? { url: item.imageUrl } : undefined}
                fallbackAlt={item.name}
                brandName={item.brandName}
                size={size === 'sm' ? 'sm' : 'md'}
            />
        </div>
    )
}
