import type { Product } from '@/@types/product'
import { ProductCard } from '@/components/shared/ProductCard'
import { ProductCardSkeleton } from '@/components/shared/ProductCardSkeleton'
import { cn } from '@/utils/cn'

const DEFAULT_SKELETON_COUNT = 8

export interface ProductGridProps {
    products: Product[]
    isPending?: boolean
    skeletonCount?: number
    /** How many leading cards load their photo eagerly (the first visible row). */
    priorityCount?: number
    className?: string
}

export function ProductGrid({
    products,
    isPending = false,
    skeletonCount = DEFAULT_SKELETON_COUNT,
    priorityCount = 0,
    className,
}: ProductGridProps) {
    const gridClassName = cn(
        'grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 md:grid-cols-3 xl:grid-cols-4',
        className,
    )

    if (isPending) {
        return (
            <div className={gridClassName} aria-busy="true" aria-label="Cargando productos">
                {Array.from({ length: skeletonCount }, (_, index) => (
                    <ProductCardSkeleton key={index} />
                ))}
            </div>
        )
    }

    return (
        <ul className={gridClassName}>
            {products.map((product, index) => (
                <li key={product.id} className="h-full">
                    <ProductCard product={product} priority={index < priorityCount} />
                </li>
            ))}
        </ul>
    )
}
