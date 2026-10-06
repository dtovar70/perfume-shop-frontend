import { Link } from 'react-router'

import { brandCatalogPath } from '@/constants/route.constant'
import { cn } from '@/utils/cn'

export interface BrandTileProps {
    brand: { slug: string; name: string; logoUrl: string | null; productCount?: number }
    /** Adds the product count under the name (brands page). */
    showCount?: boolean
    className?: string
}

/** A brand's logo (or its name set in display type) linking to the catalog filtered by it. */
export function BrandTile({ brand, showCount = false, className }: BrandTileProps) {
    return (
        <Link
            to={brandCatalogPath(brand.slug)}
            className={cn(
                'group flex h-28 flex-col items-center justify-center gap-1.5 rounded-card border border-line bg-white px-4 text-center transition duration-300 hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-soft',
                className,
            )}
        >
            {brand.logoUrl ? (
                <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    loading="lazy"
                    decoding="async"
                    className="max-h-12 w-auto max-w-[80%] object-contain opacity-80 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0"
                />
            ) : (
                <span className="line-clamp-2 font-display text-xl leading-tight font-semibold tracking-[0.06em] text-ink uppercase transition-colors group-hover:text-rose-700 sm:text-2xl">
                    {brand.name}
                </span>
            )}
            {showCount && brand.productCount !== undefined ? (
                <span className="text-xs text-ink-soft">
                    {brand.productCount} {brand.productCount === 1 ? 'fragancia' : 'fragancias'}
                </span>
            ) : null}
        </Link>
    )
}
