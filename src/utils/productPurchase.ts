import type { CartItem } from '@/@types/cart'
import type { Product, ProductVariant } from '@/@types/product'
import { MAX_LINE_QUANTITY } from '@/store/cartStore'
import { cartUnitsOf } from '@/utils/cartAvailability'
import { variantPrice } from '@/utils/productPrice'
import { defaultVariant, isVariantSoldOut, stockOf } from '@/utils/productStock'

export interface ProductPurchase {
    selectedVariant: ProductVariant | undefined
    /** "" for a product without variants. */
    variantId: string
    unitPrice: number
    /** Units of the selected version in stock. */
    stockLeft: number
    /** Units of the selected version already in the cart. */
    inCart: number
    /** Units that can still be added (stock minus what the cart holds). */
    addable: number
    /** Ceiling of the quantity stepper (at least 1, so it never renders empty). */
    maxQuantity: number
    /** The chosen quantity, capped by `maxQuantity`. */
    quantity: number
}

/**
 * What the buy box of a product shows for a chosen version and quantity (product page and
 * quick view). A sold-out version is never selected; with every version sold out the first
 * one is shown and the button reads "Agotado".
 */
export function resolvePurchase(
    product: Product,
    chosenVariantId: string | null,
    quantity: number,
    cartItems: readonly CartItem[],
): ProductPurchase {
    const chosen = product.variants.find((variant) => variant.id === chosenVariantId)
    const selectedVariant = chosen && !isVariantSoldOut(chosen) ? chosen : defaultVariant(product)
    const stockLeft = stockOf(product, selectedVariant)
    const variantId = selectedVariant?.id ?? ''
    const inCart = cartUnitsOf(cartItems, product.id, variantId)
    const addable = Math.max(0, stockLeft - inCart)
    const maxQuantity = Math.max(1, Math.min(addable, MAX_LINE_QUANTITY))
    return {
        selectedVariant,
        variantId,
        unitPrice: variantPrice(product, selectedVariant),
        stockLeft,
        inCart,
        addable,
        maxQuantity,
        quantity: Math.min(quantity, maxQuantity),
    }
}
