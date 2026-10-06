import { BrandTile } from '@/components/shared/BrandTile'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { ButtonLink, Skeleton } from '@/components/ui'
import { CONTAINER } from '@/constants/layout.constant'
import { ROUTES } from '@/constants/route.constant'
import { cn } from '@/utils/cn'
import { useBrands } from '@/views/catalog/hooks/useBrands'

const LIMIT = 12

/** "Marcas": the houses we carry, each linking to the catalog filtered by it. */
export function BrandsStrip() {
    const { data: brands, isPending, isError } = useBrands()
    const visible = (brands ?? []).filter((brand) => brand.productCount > 0).slice(0, LIMIT)

    if (isError || (!isPending && visible.length === 0)) return null

    return (
        <section aria-labelledby="brands-heading" className="py-16 lg:py-24">
            <div className={cn(CONTAINER, 'space-y-10')}>
                <SectionHeading
                    headingId="brands-heading"
                    eyebrow="Casas de perfumería"
                    title="Nuestras *marcas*"
                    description="Trabajamos con las casas que amas, siempre con producto original."
                    action={
                        <ButtonLink to={ROUTES.brands} variant="secondary">
                            Ver todas las marcas
                        </ButtonLink>
                    }
                />

                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
                    {isPending
                        ? Array.from({ length: 6 }, (_, index) => (
                              <li key={index}>
                                  <Skeleton shape="block" className="h-28 w-full" />
                              </li>
                          ))
                        : visible.map((brand) => (
                              <li key={brand.slug}>
                                  <BrandTile brand={brand} />
                              </li>
                          ))}
                </ul>
            </div>
        </section>
    )
}
