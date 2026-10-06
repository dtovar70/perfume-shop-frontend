import type { ProductVariant } from '@/@types/product'

/** "100 ml" when the variant is a size, its label otherwise. */
export function variantDisplayLabel(variant: ProductVariant): string {
    return variant.volumeMl ? `${variant.volumeMl} ml` : variant.label
}
