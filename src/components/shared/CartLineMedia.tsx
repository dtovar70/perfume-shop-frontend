import type { CartItem } from '@/@types/cart'
import { ProductThumbnail } from '@/components/shared/ProductThumbnail'
import { cn } from '@/utils/cn'

export interface CartLineMediaProps {
    item: CartItem
    size: 'sm' | 'lg'
    className?: string
}

/** A cart line's picture in a 4:5 frame: the whole product photo on its plate, or the placeholder. */
export function CartLineMedia({ item, size, className }: CartLineMediaProps) {
    return (
        <ProductThumbnail
            imageUrl={item.imageUrl}
            alt={item.name}
            brandName={item.brandName}
            size={size === 'sm' ? 'sm' : 'md'}
            className={cn(
                size === 'sm' ? 'w-[4.5rem] rounded-xl sm:w-20' : 'w-full rounded-2xl',
                className,
            )}
        />
    )
}
