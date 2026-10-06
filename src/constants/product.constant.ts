import type { Concentration, ProductGender, ProductTag } from '@/@types/product'

/**
 * How each tag reads in the store. The stored value stays `bestseller` (it drives the
 * relevance sort); customers see "favorito", which everyone understands.
 */
export const PRODUCT_TAG_LABELS: Record<ProductTag, string> = {
    nuevo: 'nuevo',
    bestseller: 'favorito',
    oferta: 'oferta',
}

export const GENDER_LABELS: Record<ProductGender, string> = {
    mujer: 'Mujer',
    hombre: 'Hombre',
    unisex: 'Unisex',
}

/** Short label shown on cards ("EDP"), long one on the product page. */
export const CONCENTRATION_LABELS: Record<Concentration, { short: string; long: string }> = {
    EDC: { short: 'EDC', long: 'Eau de Cologne' },
    EDT: { short: 'EDT', long: 'Eau de Toilette' },
    EDP: { short: 'EDP', long: 'Eau de Parfum' },
    PARFUM: { short: 'Parfum', long: 'Parfum' },
    EXTRAIT: { short: 'Extrait', long: 'Extrait de Parfum' },
}

/** "EDP · 100 ml", or whichever half is known; empty when neither is. */
export function formatPerfumeSpec(
    concentration: Concentration | null,
    volumeMl: number | null,
    long = false,
): string {
    const parts: string[] = []
    if (concentration) {
        // The API types it as a string: an unknown value is shown as it comes.
        const label = CONCENTRATION_LABELS[concentration] as
            (typeof CONCENTRATION_LABELS)[Concentration] | undefined
        parts.push(label ? (long ? label.long : label.short) : concentration)
    }
    if (volumeMl) parts.push(`${volumeMl} ml`)
    return parts.join(' · ')
}
