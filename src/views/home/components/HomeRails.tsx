import { ROUTES } from '@/constants/route.constant'
import { useSiteContent } from '@/utils/hooks/useSiteContent'
import { ProductRail } from '@/views/home/components/ProductRail'
import {
    FEATURED_LIMIT,
    useFeaturedProducts,
    useNewArrivals,
} from '@/views/home/hooks/useFeaturedProducts'

/** "Novedades": products tagged `nuevo`. Hidden while there are none. */
export function NewArrivals() {
    const { data, isPending, isError, refetch } = useNewArrivals()

    return (
        <ProductRail
            id="new-heading"
            eyebrow="Recién llegados"
            title="*Novedades*"
            description="Las últimas fragancias que llegaron a nuestra vitrina."
            products={data?.items}
            isPending={isPending}
            isError={isError}
            onRetry={() => void refetch()}
            moreTo={`${ROUTES.catalog}?tags=nuevo`}
            moreLabel="Ver novedades"
            skeletonCount={4}
        />
    )
}

/** "Fragancias destacadas": products marked featured in the admin. */
export function FeaturedProducts() {
    const { data, isPending, isError, refetch } = useFeaturedProducts()
    const { home } = useSiteContent()

    return (
        <ProductRail
            id="featured-heading"
            eyebrow={home.featuredEyebrow}
            title={home.featuredTitle}
            description={home.featuredDescription}
            products={data}
            isPending={isPending}
            isError={isError}
            onRetry={() => void refetch()}
            moreTo={ROUTES.catalog}
            moreLabel={home.featuredCta}
            skeletonCount={FEATURED_LIMIT}
        />
    )
}
