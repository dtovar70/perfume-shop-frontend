import { useEffect } from 'react'
import { Heart, PackageX } from 'lucide-react'
import { useQueries } from '@tanstack/react-query'

import type { Product } from '@/@types/product'
import { EmptyState } from '@/components/shared/EmptyState'
import { ProductGrid } from '@/components/shared/ProductGrid'
import { Button, ButtonLink } from '@/components/ui'
import { CONTAINER } from '@/constants/layout.constant'
import { ROUTES } from '@/constants/route.constant'
import { NotFoundError } from '@/services/ProductService'
import { MAX_FAVORITES, useFavorites, useFavoritesStore } from '@/store/favoritesStore'
import { cn } from '@/utils/cn'
import { useSeo } from '@/utils/hooks/useSeo'
import { productDetailQueryOptions } from '@/views/product/hooks/useProduct'

/**
 * `/favoritos`: the perfumes saved with the heart, newest first, with their live price and
 * stock. The API has no "by ids" query, so each is read by slug (the same cache entries as the
 * product pages), capped at `MAX_FAVORITES`. Products that no longer exist can be cleared.
 */
export function FavoritesView() {
    const favorites = useFavorites()
    const { remove, refresh } = useFavoritesStore()
    const tracked = favorites.slice(0, MAX_FAVORITES)
    useSeo({
        title: 'Mis favoritos',
        description: 'Los perfumes que guardaste en KaiZen Perfumería.',
        noIndex: true,
    })

    const results = useQueries({
        queries: tracked.map((favorite) => ({
            ...productDetailQueryOptions(favorite.slug),
            staleTime: 60_000,
        })),
    })

    const products: Product[] = []
    const gone: string[] = []
    let pending = 0
    results.forEach((result, index) => {
        const favorite = tracked[index]
        if (!favorite) return
        if (result.data) products.push(result.data)
        else if (result.error instanceof NotFoundError) gone.push(favorite.id)
        else if (result.isPending) pending += 1
    })
    const failed = tracked.length - products.length - gone.length - pending

    // Live names, prices and photos refresh the saved snapshots.
    const loadedKey = products.map((product) => `${product.id}:${product.price}`).join('|')
    useEffect(() => {
        for (const product of products) refresh(product)
        // `loadedKey` stands for `products`, which is rebuilt on every render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadedKey, refresh])

    return (
        <div className={cn(CONTAINER, 'space-y-8 py-12 lg:py-16')}>
            <header className="space-y-2">
                <p className="text-[11px] font-bold tracking-[0.28em] text-accent uppercase sm:text-xs">
                    Tu lista
                </p>
                <h1 className="font-display text-[2.4rem] leading-none font-semibold text-fg sm:text-5xl">
                    Mis <span className="text-accent">favoritos</span>
                </h1>
                <p className="max-w-2xl text-fg-soft">
                    {favorites.length > 0
                        ? `${favorites.length} ${favorites.length === 1 ? 'perfume guardado' : 'perfumes guardados'} en este dispositivo.`
                        : 'Guarda los perfumes que te gustan para encontrarlos rápido.'}
                </p>
            </header>

            {favorites.length === 0 ? (
                <EmptyState
                    title="Aún no tienes favoritos"
                    description="Toca el corazón de cualquier perfume y aparecerá aquí."
                    icon={<Heart className="size-6" />}
                    action={<ButtonLink to={ROUTES.catalog}>Explorar perfumes</ButtonLink>}
                />
            ) : (
                <>
                    {products.length > 0 || pending > 0 ? (
                        <ProductGrid
                            products={products}
                            isPending={products.length === 0 && pending > 0}
                            skeletonCount={Math.min(pending, 8)}
                            priorityCount={4}
                        />
                    ) : null}

                    {gone.length > 0 ? (
                        <div className="flex flex-col items-start gap-3 rounded-card border border-line bg-elevated/60 p-5 sm:flex-row sm:items-center">
                            <PackageX aria-hidden="true" className="size-5 shrink-0 text-accent" />
                            <p className="flex-1 text-sm text-fg-soft">
                                {gone.length === 1
                                    ? 'Un perfume que guardaste ya no está disponible.'
                                    : `${gone.length} perfumes que guardaste ya no están disponibles.`}
                            </p>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => gone.forEach((id) => remove(id))}
                            >
                                Quitar de la lista
                            </Button>
                        </div>
                    ) : null}

                    {failed > 0 ? (
                        <p role="status" className="text-sm text-fg-soft">
                            No pudimos cargar {failed === 1 ? 'un perfume' : `${failed} perfumes`}{' '}
                            de tu lista. Revisa tu conexión y vuelve a intentarlo.
                        </p>
                    ) : null}
                </>
            )}
        </div>
    )
}
