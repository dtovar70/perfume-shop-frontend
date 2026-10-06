import { useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router'

import type { Product } from '@/@types/product'
import { BsApproximation } from '@/components/shared/BsApproximation'
import { CardCartControl } from '@/components/shared/CardCartControl'
import { PriceTag } from '@/components/shared/PriceTag'
import { ProductMedia } from '@/components/shared/ProductMedia'
import { Sticker } from '@/components/ui'
import { formatPerfumeSpec } from '@/constants/product.constant'
import { productPath } from '@/constants/route.constant'
import { cn } from '@/utils/cn'
import { priceRange } from '@/utils/productPrice'
import { defaultVariant as pickDefaultVariant, stockOf } from '@/utils/productStock'
import { productDetailQueryOptions } from '@/views/product/hooks/useProduct'

export interface ProductCardProps {
    product: Product
    /**
     * Layout of the card. Only `grid` exists today; `list` (one row per product) is the seam for
     * the catalog's grid/list toggle.
     */
    variant?: 'grid'
    /** The first row of a page: its photos load eagerly. */
    priority?: boolean
    className?: string
}

/** "-25%" when the product shows a "before" price; null otherwise. */
function discountPercent(price: number, compareAt: number | undefined): number | null {
    if (!compareAt || compareAt <= price) return null
    return Math.round((1 - price / compareAt) * 100)
}

/**
 * The one product card used everywhere (catalog, home rails, related products). The whole card
 * is a link through the name's stretched `::after`; the cart control is a sibling above it, so
 * there are no nested interactive elements.
 */
export function ProductCard({ product, priority = false, className }: ProductCardProps) {
    const queryClient = useQueryClient()
    // First version in stock; when all are sold out the card shows "Agotado".
    const defaultVariant = pickDefaultVariant(product)
    const { min: fromPrice, max: toPrice } = priceRange(product)
    const coverImage = product.images.at(0)
    const isSoldOut = stockOf(product, defaultVariant) <= 0
    const discount = discountPercent(fromPrice, product.compareAtPrice)
    const spec = formatPerfumeSpec(
        product.concentration,
        defaultVariant?.volumeMl ?? product.volumeMl,
    )

    const prefetchDetail = () => {
        void queryClient.prefetchQuery(productDetailQueryOptions(product.slug))
    }

    const badges: { key: string; label: string; tone: 'blush' | 'butter' | 'sky' | 'lilac' }[] =
        []
    if (isSoldOut) badges.push({ key: 'agotado', label: 'Agotado', tone: 'sky' })
    if (discount) badges.push({ key: 'oferta', label: `Oferta -${discount}%`, tone: 'blush' })
    else if (product.tags.includes('oferta')) {
        badges.push({ key: 'oferta', label: 'Oferta', tone: 'blush' })
    }
    if (product.tags.includes('nuevo')) badges.push({ key: 'nuevo', label: 'Nuevo', tone: 'butter' })

    return (
        <article
            onMouseEnter={prefetchDetail}
            onFocus={prefetchDetail}
            className={cn('group relative flex h-full flex-col', className)}
        >
            <div className="relative aspect-[4/5] overflow-hidden rounded-card border border-line/70 bg-rose-50 transition-shadow duration-500 group-hover:shadow-lift">
                <ProductMedia
                    image={coverImage}
                    fallbackAlt={product.name}
                    brandName={product.brand?.name}
                    loading={priority ? 'eager' : 'lazy'}
                    sizes="(min-width: 1280px) 20rem, (min-width: 768px) 30vw, 50vw"
                    className={cn(
                        'transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transform-none',
                        isSoldOut && 'opacity-60 grayscale-[35%]',
                    )}
                />

                {badges.length > 0 ? (
                    <ul className="pointer-events-none absolute top-2.5 left-2.5 flex flex-col items-start gap-1.5 sm:top-3 sm:left-3">
                        {badges.slice(0, 2).map((badge) => (
                            <li key={badge.key}>
                                <Sticker tone={badge.tone} size="sm">
                                    {badge.label}
                                </Sticker>
                            </li>
                        ))}
                    </ul>
                ) : null}

                {defaultVariant && !isSoldOut ? (
                    <CardCartControl
                        product={product}
                        variant={defaultVariant}
                        className="absolute right-2.5 bottom-2.5 sm:right-3 sm:bottom-3"
                    />
                ) : null}
            </div>

            <div className="flex flex-1 flex-col gap-1 px-0.5 pt-3.5 sm:pt-4">
                {product.brand ? (
                    <p className="truncate text-[10px] font-bold tracking-[0.2em] text-gold-700 uppercase sm:text-[11px]">
                        {product.brand.name}
                    </p>
                ) : null}

                <h3 className="line-clamp-2 font-display text-lg leading-tight font-semibold text-ink sm:text-xl">
                    <Link
                        to={productPath(product.slug)}
                        className="rounded-sm transition-colors after:absolute after:inset-0 after:rounded-card after:content-[''] group-hover:text-rose-700"
                    >
                        {product.name}
                    </Link>
                </h3>

                {spec ? <p className="text-xs text-ink-soft">{spec}</p> : null}

                <div className="mt-auto space-y-0.5 pt-2">
                    <PriceTag
                        price={fromPrice}
                        isFromPrice={fromPrice !== toPrice}
                        compareAtPrice={product.compareAtPrice}
                        size="sm"
                    />
                    <BsApproximation usd={fromPrice} compact />
                </div>
            </div>
        </article>
    )
}
