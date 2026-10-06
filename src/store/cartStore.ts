import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'

import type { CartItem } from '@/@types/cart'
import type { Product } from '@/@types/product'
import { stockOf } from '@/utils/productStock'

interface CartState {
    items: CartItem[]
    addItem: (product: Product, variantId: string, quantity?: number) => void
    removeItem: (lineId: string) => void
    /**
     * Sets a line's quantity; below 1 removes the line. `max` is the live cap of the line (its
     * variant's stock); it never goes above `MAX_LINE_QUANTITY`.
     */
    updateQuantity: (lineId: string, quantity: number, max?: number) => void
    clear: () => void
}

export interface CartActions {
    addItem: CartState['addItem']
    removeItem: CartState['removeItem']
    updateQuantity: CartState['updateQuantity']
    clear: CartState['clear']
}

export const MAX_LINE_QUANTITY = 99
/** v4: perfume lines; the old personalization/design fields are gone. */
const CART_VERSION = 4

/** A line is one product variant. */
function buildLineId(productId: string, variantId: string): string {
    return `${productId}:${variantId}`
}

/** Adds `line` to `items`, merging it into an identical line (quantities capped). */
function mergeLine(items: CartItem[], line: CartItem, cap: number): CartItem[] {
    const existing = items.find((item) => item.lineId === line.lineId)
    if (!existing) return [...items, line]
    return items.map((item) =>
        item.lineId === line.lineId
            ? { ...item, quantity: clampQuantity(item.quantity + line.quantity, cap) }
            : item,
    )
}

function clampQuantity(quantity: number, stock: number): number {
    const ceiling = Math.min(stock, MAX_LINE_QUANTITY)
    return Math.max(1, Math.min(Math.trunc(quantity), ceiling))
}

function createLine(product: Product, variantId: string, quantity: number): CartItem | null {
    const variant = product.variants.find((candidate) => candidate.id === variantId)
    // A sold-out version cannot be added (the server would refuse it at checkout anyway).
    if (!variant || stockOf(product, variant) <= 0) return null

    return {
        lineId: buildLineId(product.id, variant.id),
        productId: product.id,
        slug: product.slug,
        name: product.name,
        category: product.category,
        variantId: variant.id,
        variantLabel: variant.label,
        brandName: product.brand?.name,
        imageUrl: product.images.at(0)?.url,
        unitPrice: product.price + variant.priceDelta,
        quantity: clampQuantity(quantity, stockOf(product, variant)),
    }
}

/** Old line fields that no longer exist (sublimation era) and are stripped on migration. */
const LEGACY_LINE_FIELDS = [
    'personalization',
    'personalizable',
    'design',
    'colorHex',
    'printText',
] as const

/**
 * Lines up to v3 could carry a personalization text and a customer design, both part of the
 * line id. They are stripped, ids are rebuilt as `product:variant`, and lines that collapse
 * into the same id are merged. Anything unreadable is dropped.
 */
function migrateCart(persisted: unknown, version: number): { items: CartItem[] } {
    const raw = (persisted as { items?: unknown } | null)?.items
    const items = Array.isArray(raw) ? (raw as Partial<CartItem>[]) : []
    if (version >= CART_VERSION) return { items: items as CartItem[] }

    let migrated: CartItem[] = []
    for (const item of items) {
        if (typeof item?.productId !== 'string' || typeof item.variantId !== 'string') continue
        const line = { ...item } as CartItem & Record<string, unknown>
        for (const field of LEGACY_LINE_FIELDS) delete line[field]
        line.lineId = buildLineId(item.productId, item.variantId)
        line.quantity = clampQuantity(Number(item.quantity) || 1, MAX_LINE_QUANTITY)
        migrated = mergeLine(migrated, line, MAX_LINE_QUANTITY)
    }
    return { items: migrated }
}

export const useCartStore = create<CartState>()(
    persist(
        (set) => ({
            items: [],

            addItem: (product, variantId, quantity = 1) =>
                set((state) => {
                    const line = createLine(product, variantId, quantity)
                    if (!line) return state
                    const variant = product.variants.find((item) => item.id === variantId)
                    const cap = stockOf(product, variant)
                    const current = state.items.find((item) => item.lineId === line.lineId)
                    if (cap <= (current?.quantity ?? 0)) return state
                    return {
                        items: mergeLine(
                            state.items,
                            { ...line, quantity: clampQuantity(line.quantity, cap) },
                            cap,
                        ),
                    }
                }),

            removeItem: (lineId) =>
                set((state) => ({
                    items: state.items.filter((item) => item.lineId !== lineId),
                })),

            updateQuantity: (lineId, quantity, max = MAX_LINE_QUANTITY) =>
                set((state) => {
                    if (quantity < 1) {
                        return { items: state.items.filter((item) => item.lineId !== lineId) }
                    }
                    const current = state.items.find((item) => item.lineId === lineId)
                    if (!current) return state
                    // Going down is always allowed (it is how an over-stock line is fixed);
                    // going up stops at the cap.
                    const next =
                        quantity > current.quantity
                            ? clampQuantity(quantity, Math.max(max, current.quantity))
                            : clampQuantity(quantity, MAX_LINE_QUANTITY)
                    if (next === current.quantity) return state

                    return {
                        items: state.items.map((item) =>
                            item.lineId === lineId ? { ...item, quantity: next } : item,
                        ),
                    }
                }),

            clear: () => set({ items: [] }),
        }),
        {
            // The storage key is kept so carts saved before the rebrand are migrated, not lost.
            name: 'manada-russo-cart',
            version: CART_VERSION,
            partialize: (state) => ({ items: state.items }),
            migrate: migrateCart,
        },
    ),
)

export function useCartItems(): CartItem[] {
    return useCartStore((state) => state.items)
}

export function useCartCount(): number {
    return useCartStore((state) => state.items.reduce((count, item) => count + item.quantity, 0))
}

export function useCartSubtotal(): number {
    return useCartStore((state) =>
        state.items.reduce((total, item) => total + item.unitPrice * item.quantity, 0),
    )
}

export function useCartActions(): CartActions {
    return useCartStore(
        useShallow((state) => ({
            addItem: state.addItem,
            removeItem: state.removeItem,
            updateQuantity: state.updateQuantity,
            clear: state.clear,
        })),
    )
}
