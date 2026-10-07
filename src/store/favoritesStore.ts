import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { Product } from '@/@types/product'

/** What a favorite keeps of its product: enough to list it while the live data loads. */
export interface FavoriteSnapshot {
    id: string
    slug: string
    name: string
    brandName?: string
    imageUrl?: string
    price: number
    addedAt: string
}

/** The /favoritos page fetches each product by slug; more than this would be a request storm. */
export const MAX_FAVORITES = 48

interface FavoritesState {
    items: FavoriteSnapshot[]
    toggle: (product: Product) => void
    remove: (productId: string) => void
    /** Refreshes a snapshot's slug, name or price from live data (renamed product). */
    refresh: (product: Product) => void
}

function snapshotOf(product: Product): FavoriteSnapshot {
    return {
        id: product.id,
        slug: product.slug,
        name: product.name,
        brandName: product.brand?.name,
        imageUrl: product.images.at(0)?.url,
        price: product.price,
        addedAt: new Date().toISOString(),
    }
}

const FAVORITES_VERSION = 1

export const useFavoritesStore = create<FavoritesState>()(
    persist(
        (set) => ({
            items: [],

            toggle: (product) =>
                set((state) => {
                    if (state.items.some((item) => item.id === product.id)) {
                        return { items: state.items.filter((item) => item.id !== product.id) }
                    }
                    // Newest first; the oldest drops off past the cap.
                    return { items: [snapshotOf(product), ...state.items].slice(0, MAX_FAVORITES) }
                }),

            remove: (productId) =>
                set((state) => ({ items: state.items.filter((item) => item.id !== productId) })),

            refresh: (product) =>
                set((state) => {
                    const current = state.items.find((item) => item.id === product.id)
                    if (!current) return state
                    const next = { ...snapshotOf(product), addedAt: current.addedAt }
                    const isSame =
                        next.slug === current.slug &&
                        next.name === current.name &&
                        next.price === current.price &&
                        next.imageUrl === current.imageUrl &&
                        next.brandName === current.brandName
                    if (isSame) return state
                    return {
                        items: state.items.map((item) => (item.id === product.id ? next : item)),
                    }
                }),
        }),
        {
            name: 'kaizen-favorites',
            version: FAVORITES_VERSION,
            partialize: (state) => ({ items: state.items }),
            // Anything unreadable is dropped rather than breaking the page.
            migrate: (persisted) => {
                const raw = (persisted as { items?: unknown } | null)?.items
                const items = Array.isArray(raw)
                    ? (raw as Partial<FavoriteSnapshot>[]).filter(
                          (item): item is FavoriteSnapshot =>
                              typeof item?.id === 'string' && typeof item.slug === 'string',
                      )
                    : []
                return { items }
            },
        },
    ),
)

export function useFavorites(): FavoriteSnapshot[] {
    return useFavoritesStore((state) => state.items)
}

export function useFavoritesCount(): number {
    return useFavoritesStore((state) => state.items.length)
}

export function useIsFavorite(productId: string): boolean {
    return useFavoritesStore((state) => state.items.some((item) => item.id === productId))
}
