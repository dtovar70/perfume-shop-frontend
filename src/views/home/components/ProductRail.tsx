import { ArrowRight, PackageOpen } from 'lucide-react'
import { Link } from 'react-router'

import type { Product } from '@/@types/product'
import { EmptyState } from '@/components/shared/EmptyState'
import { ProductGrid } from '@/components/shared/ProductGrid'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { Button } from '@/components/ui'
import { CONTAINER } from '@/constants/layout.constant'
import { cn } from '@/utils/cn'

export interface ProductRailProps {
    id: string
    eyebrow: string
    title: string
    description?: string
    products: Product[] | undefined
    isPending: boolean
    isError: boolean
    onRetry: () => void
    /** Where "ver todo" goes. */
    moreTo: string
    moreLabel: string
    skeletonCount: number
    /** Renders nothing when the list comes back empty (e.g. no product tagged "nuevo" yet). */
    hideWhenEmpty?: boolean
    className?: string
}

/** A home section with a heading and a grid of product cards. */
export function ProductRail({
    id,
    eyebrow,
    title,
    description,
    products,
    isPending,
    isError,
    onRetry,
    moreTo,
    moreLabel,
    skeletonCount,
    hideWhenEmpty = true,
    className,
}: ProductRailProps) {
    if (hideWhenEmpty && !isPending && !isError && (products?.length ?? 0) === 0) return null

    return (
        <section aria-labelledby={id} className={cn('py-16 lg:py-24', className)}>
            <div className={cn(CONTAINER, 'space-y-10')}>
                <SectionHeading
                    headingId={id}
                    eyebrow={eyebrow}
                    title={title}
                    description={description}
                    action={
                        <Link
                            to={moreTo}
                            className="group inline-flex min-h-11 items-center gap-2 text-sm font-bold text-rose-700 transition hover:text-rose-800"
                        >
                            {moreLabel}
                            <ArrowRight
                                aria-hidden="true"
                                className="size-4 transition-transform group-hover:translate-x-1"
                            />
                        </Link>
                    }
                />

                {isError ? (
                    <EmptyState
                        title="No pudimos cargar los perfumes"
                        description="Algo falló al traer esta selección. Inténtalo de nuevo."
                        icon={<PackageOpen className="size-6" />}
                        action={
                            <Button variant="secondary" onClick={onRetry}>
                                Reintentar
                            </Button>
                        }
                    />
                ) : (
                    <ProductGrid
                        products={products ?? []}
                        isPending={isPending}
                        skeletonCount={skeletonCount}
                    />
                )}
            </div>
        </section>
    )
}
