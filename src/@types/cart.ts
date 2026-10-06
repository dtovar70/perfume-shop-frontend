import type { CategorySlug } from '@/@types/product'

/**
 * A cart line stores a render-ready snapshot instead of the whole product so the
 * persisted payload stays small and survives catalog changes.
 */
export interface CartItem {
    lineId: string
    productId: string
    slug: string
    name: string
    category: CategorySlug
    variantId: string
    variantLabel: string
    /** Brand name at the time it was added (absent on lines saved before brands existed). */
    brandName?: string
    /** First product photo at the time it was added; absent when the product has none. */
    imageUrl?: string
    unitPrice: number
    quantity: number
}

export interface CartLineTotals {
    subtotal: number
    itemCount: number
    shipping: number
    total: number
}

/** Live stock of one cart line (`POST /products/availability`). */
export interface CartAvailability {
    productId: string
    /** Null for a product without variants. */
    variantId: string | null
    /** Units left of the variant (or of the product without variants). */
    stock: number
    isActive: boolean
    /** False when the product or its variant was deleted. */
    exists: boolean
}
