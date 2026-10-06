import type { CategorySlug, Concentration, ProductGender, ProductTag } from '@/@types/product'

export type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'newest' | 'name-asc'

export interface Paginated<T> {
    items: T[]
    page: number
    pageSize: number
    total: number
    totalPages: number
}

export interface ProductQueryParams {
    category?: CategorySlug
    search?: string
    sort?: SortOption
    minPrice?: number
    maxPrice?: number
    tags?: ProductTag[]
    /** Brand slugs (repeatable `brand` param). */
    brands?: string[]
    gender?: ProductGender
    concentration?: Concentration
    family?: string
    page?: number
    pageSize?: number
}
