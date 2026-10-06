import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'

import { BrandTile } from '@/components/shared/BrandTile'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { Skeleton } from '@/components/ui'
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
                        <Link
                            to={ROUTES.brands}
                            className="group inline-flex min-h-11 items-center gap-2 text-sm font-bold text-rose-700 transition hover:text-rose-800"
                        >
                            Ver todas las marcas
                            <ArrowRight
                                aria-hidden="true"
                                className="size-4 transition-transform group-hover:translate-x-1"
                            />
                        </Link>
                    }
                />

                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
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
