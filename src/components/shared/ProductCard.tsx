import { useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router'

import type { Product } from '@/@types/product'
import { BsApproximation } from '@/components/shared/BsApproximation'
import { CardCartControl } from '@/components/shared/CardCartControl'
import { PriceTag } from '@/components/shared/PriceTag'
import { ProductMedia } from '@/components/shared/ProductMedia'
import { Badge } from '@/components/ui'
import { formatPerfumeSpec } from '@/constants/product.constant'
import { productPath } from '@/constants/route.constant'
import { cn } from '@/utils/cn'
import { priceRange } from '@/utils/productPrice'
import { defaultVariant as pickDefaultVariant, stockOf } from '@/utils/productStock'
import { productDetailQueryOptions } from '@/views/product/hooks/useProduct'

export interface ProductCardProps {
    product: Product
    /**
     * `grid`: the tall card of every product grid. `list`: one horizontal row per product
     * (photo, details, price and cart control), for the catalog's list view.
     */
    variant?: ProductCardVariant
    /** The first row of a page: its photos load eagerly. */
    priority?: boolean
    className?: string
}

export type ProductCardVariant = 'grid' | 'list'

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
export function ProductCard({
    product,
    variant = 'grid',
    priority = false,
    className,
}: ProductCardProps) {
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

    const badges: { key: string; label: string; tone: 'solid' | 'overlay' | 'neutral' }[] = []
    if (isSoldOut) badges.push({ key: 'agotado', label: 'Agotado', tone: 'neutral' })
    if (discount) badges.push({ key: 'oferta', label: `-${discount}%`, tone: 'solid' })
    else if (product.tags.includes('oferta')) {
        badges.push({ key: 'oferta', label: 'Oferta', tone: 'solid' })
    }
    if (product.tags.includes('nuevo'))
        badges.push({ key: 'nuevo', label: 'Nuevo', tone: 'overlay' })

    const nameLink = (
        <Link
            to={productPath(product.slug)}
            className="rounded-sm transition-colors group-hover:text-accent-strong after:absolute after:inset-0 after:content-['']"
        >
            {product.name}
        </Link>
    )

    if (variant === 'list') {
        const badge = badges.at(0)
        return (
            <article
                data-fly-scope=""
                onMouseEnter={prefetchDetail}
                onFocus={prefetchDetail}
                className={cn(
                    'group relative flex h-full gap-3 rounded-xl2 border border-line bg-surface p-2.5 shadow-soft transition duration-300 hover:border-cherry-500/30 hover:shadow-lift sm:gap-5 sm:p-3.5',
                    className,
                )}
            >
                <div className="relative aspect-[4/5] w-24 shrink-0 self-start overflow-hidden rounded-xl border border-line bg-surface sm:w-32">
                    <ProductMedia
                        image={coverImage}
                        fallbackAlt={product.name}
                        brandName={product.brand?.name}
                        loading={priority ? 'eager' : 'lazy'}
                        sizes="8rem"
                        muted={isSoldOut}
                        className="transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transform-none"
                    />
                    {badge ? (
                        <Badge
                            tone={badge.tone}
                            size="sm"
                            className="pointer-events-none absolute top-1.5 left-1.5 px-2"
                        >
                            {badge.label}
                        </Badge>
                    ) : null}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-0.5 py-0.5 sm:gap-1 sm:py-1">
                    {product.brand ? (
                        <p className="truncate text-[11px] font-semibold tracking-[0.12em] text-accent uppercase sm:text-xs sm:tracking-[0.15em]">
                            {product.brand.name}
                        </p>
                    ) : null}
                    <h3 className="line-clamp-2 font-display text-base leading-snug font-semibold text-fg sm:text-lg">
                        {nameLink}
                    </h3>
                    {spec || product.olfactoryFamily ? (
                        <p className="truncate text-xs text-fg-soft sm:text-sm">
                            {[spec, product.olfactoryFamily].filter(Boolean).join(' · ')}
                        </p>
                    ) : null}

                    <div className="mt-auto flex flex-wrap items-end justify-between gap-x-3 gap-y-2 pt-2">
                        <div className="min-w-0 space-y-0.5">
                            <PriceTag
                                price={fromPrice}
                                isFromPrice={fromPrice !== toPrice}
                                compareAtPrice={product.compareAtPrice}
                                size="sm"
                            />
                            <BsApproximation usd={fromPrice} compact />
                        </div>
                        {isSoldOut ? (
                            <Badge tone="neutral" size="sm">
                                Agotado
                            </Badge>
                        ) : (
                            <CardCartControl product={product} variant={defaultVariant} />
                        )}
                    </div>
                </div>
            </article>
        )
    }

    return (
        <article
            data-fly-scope=""
            onMouseEnter={prefetchDetail}
            onFocus={prefetchDetail}
            className={cn(
                'group relative flex h-full flex-col overflow-hidden rounded-xl2 border border-line bg-surface shadow-soft transition duration-300 hover:-translate-y-1 hover:border-cherry-500/30 hover:shadow-lift motion-reduce:transform-none',
                className,
            )}
        >
            <div className="relative aspect-square overflow-hidden border-b border-line bg-surface">
                <ProductMedia
                    image={coverImage}
                    fallbackAlt={product.name}
                    brandName={product.brand?.name}
                    loading={priority ? 'eager' : 'lazy'}
                    sizes="(min-width: 1280px) 20rem, (min-width: 768px) 30vw, 50vw"
                    muted={isSoldOut}
                    className="transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transform-none"
                />

                {badges.length > 0 ? (
                    <ul className="pointer-events-none absolute top-2.5 left-2.5 flex flex-col items-start gap-1.5 sm:top-3.5 sm:left-3.5">
                        {badges.slice(0, 2).map((badge) => (
                            <li key={badge.key}>
                                <Badge tone={badge.tone} size="sm">
                                    {badge.label}
                                </Badge>
                            </li>
                        ))}
                    </ul>
                ) : null}

                {!isSoldOut ? (
                    <CardCartControl
                        product={product}
                        variant={defaultVariant}
                        className="absolute right-2.5 bottom-2.5 sm:right-3.5 sm:bottom-3.5"
                    />
                ) : null}
            </div>

            <div className="flex flex-1 flex-col gap-1 p-3 sm:gap-1.5 sm:p-5">
                {product.brand ? (
                    <p className="truncate text-[11px] font-semibold tracking-[0.12em] text-accent uppercase sm:text-xs sm:tracking-[0.15em]">
                        {product.brand.name}
                    </p>
                ) : null}

                <h3 className="line-clamp-2 font-display text-base leading-snug font-semibold text-fg sm:text-lg">
                    {nameLink}
                </h3>

                {spec ? <p className="text-xs text-fg-soft sm:text-sm">{spec}</p> : null}

                <div className="mt-auto space-y-0.5 pt-2 sm:pt-3">
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
