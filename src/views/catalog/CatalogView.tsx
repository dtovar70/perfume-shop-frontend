import { useState } from 'react'
import { PackageOpen, SearchX, Tags, X } from 'lucide-react'

import { EmptyState } from '@/components/shared/EmptyState'
import { ProductGrid } from '@/components/shared/ProductGrid'
import { Button, ButtonLink, Drawer } from '@/components/ui'
import { GENDER_LABELS } from '@/constants/product.constant'
import { CONTAINER } from '@/constants/layout.constant'
import { brandCatalogPath, categoryPath, ROUTES } from '@/constants/route.constant'
import { cn } from '@/utils/cn'
import { useSeo } from '@/utils/hooks/useSeo'
import { useMediaQuery } from '@/utils/hooks/useMediaQuery'
import { CatalogFilters } from '@/views/catalog/components/CatalogFilters'
import { CatalogPagination } from '@/views/catalog/components/CatalogPagination'
import { CatalogSearch } from '@/views/catalog/components/CatalogSearch'
import { CatalogToolbar } from '@/views/catalog/components/CatalogToolbar'
import { CategoryChips } from '@/views/catalog/components/CategoryChips'
import { CATALOG_PAGE_SIZE, useCatalogFilters } from '@/views/catalog/hooks/useCatalogFilters'
import { useCatalogView } from '@/views/catalog/hooks/useCatalogView'
import { useCategories } from '@/views/catalog/hooks/useCategories'
import { useFacets } from '@/views/catalog/hooks/useFacets'
import { useProducts } from '@/views/catalog/hooks/useProducts'

const eyebrowClass = 'text-[11px] font-bold tracking-[0.28em] text-accent uppercase sm:text-xs'
const titleClass = 'font-display text-[2.4rem] leading-none font-semibold text-fg sm:text-5xl'

export function CatalogView() {
    const catalog = useCatalogFilters()
    const { filters } = catalog
    const { data: categories } = useCategories()
    const { data: facets } = useFacets(filters.category)
    // Phones and tablets get the filters in a drawer; the sidebar only fits from `lg`.
    const isDesktop = useMediaQuery('(min-width: 64rem)')
    const [filtersOpen, setFiltersOpen] = useState(false)
    const [view, setView] = useCatalogView()

    const activeCategory = (categories ?? []).find((category) => category.slug === filters.category)
    /** A deleted category, or a mistyped link: known only once the categories have loaded. */
    const isUnknownCategory =
        filters.category !== undefined && categories !== undefined && !activeCategory
    const { data, isPending, isError, isPlaceholderData, refetch } = useProducts(
        catalog.queryParams,
        { enabled: !isUnknownCategory },
    )
    const products = data?.items ?? []
    const closeFilters = () => setFiltersOpen(false)
    const hasNoResults = !isPending && !isError && products.length === 0
    const brandName =
        filters.brands.length === 1
            ? facets?.brands.find((brand) => brand.slug === filters.brands[0])?.name
            : undefined

    const title =
        activeCategory?.name ??
        brandName ??
        (filters.gender
            ? `Perfumes para ${GENDER_LABELS[filters.gender].toLowerCase()}`
            : 'Perfumes')
    const brandOnly =
        filters.brands.length === 1 && !filters.category ? filters.brands[0] : undefined
    useSeo(
        isUnknownCategory
            ? { title: 'Colección no encontrada', noIndex: true }
            : {
                  title: brandName ? `Perfumes ${brandName}` : title,
                  description:
                      activeCategory?.description ||
                      (brandName
                          ? `Perfumes originales de ${brandName}: precios en dólares con referencia BCV y envíos a toda Venezuela.`
                          : 'Catálogo de perfumes originales para mujer y hombre: filtra por marca, familia olfativa o concentración.'),
                  // Filtered and sorted variants point at the listing they refine.
                  canonical: activeCategory
                      ? categoryPath(activeCategory.slug)
                      : brandOnly
                        ? brandCatalogPath(brandOnly)
                        : ROUTES.catalog,
                  noIndex: filters.search !== '',
              },
    )

    const filterPanel = (
        <CatalogFilters
            filters={filters}
            facets={facets}
            isFiltered={catalog.isFiltered}
            onBrandToggle={catalog.toggleBrand}
            onGenderChange={catalog.setGender}
            onConcentrationChange={catalog.setConcentration}
            onFamilyChange={catalog.setFamily}
            onPriceChange={catalog.setPriceRange}
            onTagToggle={catalog.toggleTag}
            onClear={catalog.clearFilters}
        />
    )

    if (isUnknownCategory) {
        return (
            <div className={cn(CONTAINER, 'space-y-8 py-12 lg:py-16')}>
                <header className="space-y-3">
                    <p className={eyebrowClass}>Catálogo</p>
                    <h1 className={titleClass}>Colección no encontrada</h1>
                </header>
                <EmptyState
                    title="Esta colección ya no existe"
                    description="Puede que la hayamos retirado o que el enlace esté mal escrito. El resto del catálogo sigue aquí."
                    icon={<Tags className="size-6" />}
                    action={<ButtonLink to={ROUTES.catalog}>Ver todo el catálogo</ButtonLink>}
                />
            </div>
        )
    }

    return (
        <div className="pb-12 lg:pb-16">
            <header className={cn(CONTAINER, 'space-y-3 pt-8 pb-5 sm:pt-12 lg:pt-14')}>
                <p className={eyebrowClass}>Catálogo</p>
                <h1 className={titleClass}>{title}</h1>
                <p className="max-w-2xl text-[15px] text-fg-soft">
                    {activeCategory?.description ||
                        'Fragancias originales para cada momento. Filtra por marca, familia olfativa o concentración.'}
                </p>
            </header>

            {/* Phones and tablets: the catalog's own search (desktop has the header's). */}
            <div className={cn(CONTAINER, 'pb-3 xl:hidden')}>
                <CatalogSearch value={filters.search} onSearch={catalog.setSearch} />
            </div>

            {/* Sticky toolbar: categories, count, sort and (below lg) filters. */}
            <div className="sticky top-16 z-30 border-y border-line/80 bg-canvas/90 backdrop-blur-md lg:top-20">
                <div
                    className={cn(
                        CONTAINER,
                        'flex flex-col gap-2 py-2.5 lg:flex-row lg:items-center lg:gap-6',
                    )}
                >
                    <CategoryChips
                        categories={categories}
                        selected={filters.category}
                        onSelect={catalog.setCategory}
                        className="-mx-4 scroll-px-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:min-w-0 lg:flex-1 lg:px-0"
                    />
                    <CatalogToolbar
                        total={data?.total ?? 0}
                        sort={filters.sort}
                        isRefreshing={isPlaceholderData}
                        onSortChange={catalog.setSort}
                        onOpenFilters={isDesktop ? undefined : () => setFiltersOpen(true)}
                        activeFilterCount={catalog.activeFilterCount}
                        view={view}
                        onViewChange={setView}
                    />
                </div>
            </div>

            <div className={cn(CONTAINER, 'pt-6 lg:pt-8')}>
                {filters.search ? (
                    <p className="mb-5 flex flex-wrap items-center gap-2 text-sm text-fg-soft">
                        Resultados para
                        <span className="inline-flex items-center gap-2 rounded-full bg-cherry-tint py-1 pr-2 pl-3 font-semibold text-accent-strong">
                            {filters.search}
                            <button
                                type="button"
                                onClick={() => catalog.setSearch('')}
                                aria-label="Quitar la búsqueda"
                                // A 44px hit area around the small icon, without a bigger chip.
                                className="relative rounded-full after:absolute after:-inset-[15px] after:content-['']"
                            >
                                <X aria-hidden="true" className="size-3.5" />
                            </button>
                        </span>
                    </p>
                ) : null}

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] xl:gap-12">
                    {isDesktop ? (
                        <aside aria-label="Filtros del catálogo" className="h-fit">
                            {filterPanel}
                        </aside>
                    ) : (
                        <Drawer
                            isOpen={filtersOpen}
                            onClose={closeFilters}
                            title="Filtros"
                            side="left"
                            footer={
                                <Button fullWidth onClick={closeFilters}>
                                    {data && !isPlaceholderData
                                        ? `Ver ${data.total} ${data.total === 1 ? 'perfume' : 'perfumes'}`
                                        : 'Ver perfumes'}
                                </Button>
                            }
                        >
                            {filterPanel}
                        </Drawer>
                    )}

                    <section aria-label="Resultados" className="min-w-0 space-y-8">
                        <p aria-hidden="true" className="-mt-2 text-sm text-fg-soft sm:hidden">
                            <span className="font-bold text-fg tabular-nums">
                                {data?.total ?? 0}
                            </span>{' '}
                            {data?.total === 1 ? 'perfume' : 'perfumes'}
                        </p>

                        {isError ? (
                            <EmptyState
                                title="No pudimos cargar el catálogo"
                                description="Hubo un problema al traer los perfumes. Inténtalo otra vez."
                                icon={<PackageOpen className="size-6" />}
                                action={
                                    <Button variant="secondary" onClick={() => void refetch()}>
                                        Reintentar
                                    </Button>
                                }
                            />
                        ) : hasNoResults ? (
                            filters.search ? (
                                <EmptyState
                                    title="No encontramos resultados para tu búsqueda"
                                    description="Intenta con otro nombre o marca."
                                    icon={<SearchX className="size-6" />}
                                    action={
                                        <Button
                                            variant="secondary"
                                            onClick={() => catalog.setSearch('')}
                                        >
                                            Borrar la búsqueda
                                        </Button>
                                    }
                                />
                            ) : (
                                <EmptyState
                                    title="No encontramos perfumes con esos filtros"
                                    description="Prueba con menos filtros u otra colección."
                                    icon={<SearchX className="size-6" />}
                                    action={
                                        <Button variant="secondary" onClick={catalog.clearFilters}>
                                            Limpiar filtros
                                        </Button>
                                    }
                                />
                            )
                        ) : (
                            <ProductGrid
                                products={products}
                                isPending={isPending}
                                skeletonCount={CATALOG_PAGE_SIZE}
                                priorityCount={4}
                                view={view}
                                className="lg:grid-cols-3"
                            />
                        )}

                        <CatalogPagination
                            page={data?.page ?? 1}
                            totalPages={data?.totalPages ?? 1}
                            onPageChange={catalog.setPage}
                        />
                    </section>
                </div>
            </div>
        </div>
    )
}
