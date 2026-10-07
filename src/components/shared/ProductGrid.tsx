import type { Product } from '@/@types/product'
import { ProductCard, type ProductCardVariant } from '@/components/shared/ProductCard'
import { ProductCardSkeleton } from '@/components/shared/ProductCardSkeleton'
import { cn } from '@/utils/cn'

const DEFAULT_SKELETON_COUNT = 8

const LAYOUT_CLASS: Record<ProductCardVariant, string> = {
    grid: 'grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:gap-6 xl:grid-cols-4',
    /** One horizontal card per row; two columns once there is room for both (xl). */
    list: 'grid grid-cols-1 gap-3 sm:gap-4 xl:grid-cols-2',
}

export interface ProductGridProps {
    products: Product[]
    isPending?: boolean
    skeletonCount?: number
    /** How many leading cards load their photo eagerly (the first visible row). */
    priorityCount?: number
    /** `list` lays the products out as horizontal rows (catalog list view). */
    view?: ProductCardVariant
    /** Extra classes for the grid layout (only applied to the `grid` view). */
    className?: string
}

export function ProductGrid({
    products,
    isPending = false,
    skeletonCount = DEFAULT_SKELETON_COUNT,
    priorityCount = 0,
    view = 'grid',
    className,
}: ProductGridProps) {
    const gridClassName = cn(LAYOUT_CLASS[view], view === 'grid' && className)

    if (isPending) {
        return (
            <div className={gridClassName} aria-busy="true" aria-label="Cargando productos">
                {Array.from({ length: skeletonCount }, (_, index) => (
                    <ProductCardSkeleton key={index} variant={view} />
                ))}
            </div>
        )
    }

    return (
        <ul className={gridClassName}>
            {products.map((product, index) => (
                <li key={product.id} className="h-full">
                    <ProductCard
                        product={product}
                        variant={view}
                        priority={index < priorityCount}
                    />
                </li>
            ))}
        </ul>
    )
}
