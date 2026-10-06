import { Gem } from 'lucide-react'

import { BrandTile } from '@/components/shared/BrandTile'
import { EmptyState } from '@/components/shared/EmptyState'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { Button, Skeleton } from '@/components/ui'
import { CONTAINER } from '@/constants/layout.constant'
import { cn } from '@/utils/cn'
import { useBrands } from '@/views/catalog/hooks/useBrands'

/** `/marcas`: every brand with products, alphabetically; each opens the filtered catalog. */
export function BrandsView() {
    const { data: brands, isPending, isError, refetch } = useBrands()
    const visible = [...(brands ?? [])]
        .filter((brand) => brand.productCount > 0)
        .sort((a, b) => a.name.localeCompare(b.name, 'es'))

    return (
        <div className={cn(CONTAINER, 'space-y-10 py-12 lg:py-16')}>
            <SectionHeading
                level="h1"
                eyebrow="Casas de perfumería"
                title="Nuestras *marcas*"
                description="Elige una casa para ver todas sus fragancias disponibles."
            />

            {isError ? (
                <EmptyState
                    title="No pudimos cargar las marcas"
                    description="Revisa tu conexión e inténtalo otra vez."
                    icon={<Gem className="size-6" />}
                    action={
                        <Button variant="secondary" onClick={() => void refetch()}>
                            Reintentar
                        </Button>
                    }
                />
            ) : !isPending && visible.length === 0 ? (
                <EmptyState
                    title="Pronto verás nuestras marcas aquí"
                    description="Estamos preparando el catálogo."
                    icon={<Gem className="size-6" />}
                />
            ) : (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
                    {isPending
                        ? Array.from({ length: 10 }, (_, index) => (
                              <li key={index}>
                                  <Skeleton shape="block" className="h-28 w-full" />
                              </li>
                          ))
                        : visible.map((brand) => (
                              <li key={brand.slug}>
                                  <BrandTile brand={brand} showCount />
                              </li>
                          ))}
                </ul>
            )}
        </div>
    )
}
