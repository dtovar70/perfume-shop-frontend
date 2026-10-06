/**
 * Categories are managed from the admin, so any slug the API returns is valid. The alias only
 * documents intent where a string holds a category slug.
 */
export type CategorySlug = string

export type ProductTag = 'nuevo' | 'bestseller' | 'oferta'

export const PRODUCT_GENDERS = ['mujer', 'hombre', 'unisex'] as const
export type ProductGender = (typeof PRODUCT_GENDERS)[number]

export const CONCENTRATIONS = ['EDC', 'EDT', 'EDP', 'PARFUM', 'EXTRAIT'] as const
export type Concentration = (typeof CONCENTRATIONS)[number]

export interface ProductVariant {
    id: string
    label: string
    priceDelta: number
    /** Bottle size of this version; null when the variant is not a size. */
    volumeMl: number | null
    /** Units of this version in stock; 0 means it is sold out ("Agotada"). */
    stock: number
}

export interface ProductImage {
    id: string
    url: string
    alt: string | null
}

/** The brand as embedded in a product. */
export interface ProductBrand {
    slug: string
    name: string
    logoUrl: string | null
}

/** Olfactory pyramid: top (salida), heart (corazón) and base (fondo) notes. */
export interface OlfactoryNotes {
    top: string[]
    heart: string[]
    base: string[]
}

export interface Product {
    id: string
    slug: string
    name: string
    category: CategorySlug
    brand: ProductBrand | null
    gender: ProductGender
    concentration: Concentration | null
    /** Bottle size of the base product; variants may override it. */
    volumeMl: number | null
    notes: OlfactoryNotes
    olfactoryFamily: string | null
    isFeatured: boolean
    sku: string | null
    price: number
    compareAtPrice?: number
    description: string
    highlights: string[]
    variants: ProductVariant[]
    tags: ProductTag[]
    /** Units in stock: the sum of the variants' stock when the product has variants. */
    stock: number
    createdAt: string
    /** Uploaded photos in display order; empty means the placeholder card is shown. */
    images: ProductImage[]
}

export interface Category {
    slug: CategorySlug
    name: string
    tagline: string
    description: string
    colorHex: string
    productCount: number
}

/** `GET /brands`. */
export interface Brand {
    slug: string
    name: string
    logoUrl: string | null
    description: string
    productCount: number
}

export interface FacetCount<T extends string = string> {
    value: T
    count: number
}

/** `GET /products/facets?category=`: what the filter panel can offer. */
export interface ProductFacets {
    priceMin: number
    priceMax: number
    brands: { slug: string; name: string; count: number }[]
    genders: FacetCount<ProductGender>[]
    families: FacetCount[]
    concentrations: FacetCount<Concentration>[]
}

export interface Review {
    id: string
    productId: string
    author: string
    rating: number
    comment: string
    createdAt: string
}
