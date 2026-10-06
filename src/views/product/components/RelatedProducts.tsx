import { ProductGrid } from '@/components/shared/ProductGrid'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { RELATED_LIMIT, useRelatedProducts } from '@/views/product/hooks/useRelatedProducts'

export interface RelatedProductsProps {
    slug: string
}

export function RelatedProducts({ slug }: RelatedProductsProps) {
    const { data: products, isPending, isError } = useRelatedProducts(slug)

    if (isError || (!isPending && (products?.length ?? 0) === 0)) return null

    return (
        <section aria-labelledby="related-heading" className="space-y-8">
            <SectionHeading
                headingId="related-heading"
                level="h3"
                eyebrow="También te puede gustar"
                title="Fragancias *relacionadas*"
            />

            <ProductGrid
                products={products ?? []}
                isPending={isPending}
                skeletonCount={RELATED_LIMIT}
            />
        </section>
    )
}
