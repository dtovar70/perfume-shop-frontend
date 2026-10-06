import { PackageOpen } from 'lucide-react'

import { CategoryCard } from '@/components/shared/CategoryCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { Button, ButtonLink, Skeleton } from '@/components/ui'
import { appConfig } from '@/configs/app.config'
import { CONTAINER } from '@/constants/layout.constant'
import { ROUTES } from '@/constants/route.constant'
import { cn } from '@/utils/cn'
import { categoryCountPhrase, fillPlaceholdersInSentence } from '@/utils/content'
import { useFillPlaceholders, useSiteContent } from '@/utils/hooks/useSiteContent'
import { useCategories } from '@/views/catalog/hooks/useCategories'

const LIMIT = appConfig.categoryLinkLimits.home

/**
 * The original store's category band. Phones get a horizontal, snapping row (one card and a
 * peek of the next); from `md` the cards sit in a three-column grid.
 */
export function CategoryStrip() {
    const { data: categories, isPending, isError, refetch } = useCategories()
    const { home } = useSiteContent()
    const fill = useFillPlaceholders()
    // "{categorias}" is the live category count (categories are managed in the admin).
    const description = fillPlaceholdersInSentence(fill(home.categoriesDescription), {
        categorias: categoryCountPhrase(categories?.length),
    })
    const featured = (categories ?? []).slice(0, LIMIT)

    const rowClass =
        '-mx-4 flex snap-x snap-mandatory scrollbar-none gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0'
    const itemClass = 'w-[78%] shrink-0 snap-start sm:w-[45%] md:w-auto'

    return (
        <section
            aria-labelledby="categories-heading"
            className="border-y border-line bg-surface py-16 lg:py-24"
        >
            <div className={cn(CONTAINER, 'space-y-10')}>
                <SectionHeading
                    headingId="categories-heading"
                    eyebrow={home.categoriesEyebrow}
                    title={home.categoriesTitle}
                    description={description}
                    action={
                        <ButtonLink to={ROUTES.catalog} variant="secondary">
                            Ver todo el catálogo
                        </ButtonLink>
                    }
                />

                {isError ? (
                    <EmptyState
                        title="No pudimos cargar las colecciones"
                        description="Revisa tu conexión e inténtalo otra vez."
                        icon={<PackageOpen className="size-6" />}
                        action={
                            <Button variant="secondary" onClick={() => void refetch()}>
                                Reintentar
                            </Button>
                        }
                    />
                ) : (
                    <ul className={rowClass}>
                        {isPending
                            ? Array.from({ length: LIMIT }, (_, index) => (
                                  <li key={index} className={itemClass}>
                                      <Skeleton shape="block" className="h-96 w-full" />
                                  </li>
                              ))
                            : featured.map((category, index) => (
                                  <li key={category.slug} className={itemClass}>
                                      <CategoryCard category={category} index={index} />
                                  </li>
                              ))}
                    </ul>
                )}
            </div>
        </section>
    )
}
