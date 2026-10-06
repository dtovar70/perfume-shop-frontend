import { useCallback, useMemo } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'

import type { ProductQueryParams, SortOption } from '@/@types/common'
import {
    CONCENTRATIONS,
    PRODUCT_GENDERS,
    type CategorySlug,
    type Concentration,
    type ProductGender,
    type ProductTag,
} from '@/@types/product'
import { categoryPath, ROUTES } from '@/constants/route.constant'

export const CATALOG_SEARCH_PARAM = 'search'
export const CATALOG_PAGE_SIZE = 12

const SORT_PARAM = 'sort'
const PRICE_PARAM = 'price'
const TAGS_PARAM = 'tags'
const PAGE_PARAM = 'page'
/** Repeatable: `?brand=dior&brand=lattafa`. */
export const BRAND_PARAM = 'brand'
const GENDER_PARAM = 'gender'
const CONCENTRATION_PARAM = 'concentration'
const FAMILY_PARAM = 'family'

export const SORT_OPTIONS = [
    'relevance',
    'price-asc',
    'price-desc',
    'newest',
    'name-asc',
] as const satisfies readonly SortOption[]

export const PRODUCT_TAGS = [
    'nuevo',
    'bestseller',
    'oferta',
] as const satisfies readonly ProductTag[]

export type PriceBracketId = 'all' | 'under-10' | '10-to-20' | 'over-20'

export interface PriceBracket {
    id: PriceBracketId
    label: string
    minPrice?: number
    maxPrice?: number
}

export const PRICE_BRACKETS: readonly PriceBracket[] = [
    { id: 'all', label: 'Todos los precios' },
    { id: 'under-10', label: 'Menos de $10', maxPrice: 10 },
    { id: '10-to-20', label: 'Entre $10 y $20', minPrice: 10, maxPrice: 20 },
    { id: 'over-20', label: 'Más de $20', minPrice: 20 },
]

const PRICE_BRACKET_IDS = PRICE_BRACKETS.map((bracket) => bracket.id)

export interface CatalogFilters {
    category?: CategorySlug
    search: string
    sort: SortOption
    priceBracket: PriceBracketId
    tags: ProductTag[]
    brands: string[]
    gender?: ProductGender
    concentration?: Concentration
    family?: string
    page: number
}

export interface UseCatalogFiltersResult {
    filters: CatalogFilters
    queryParams: ProductQueryParams
    isFiltered: boolean
    setCategory: (category?: CategorySlug) => void
    setSearch: (search: string) => void
    setSort: (sort: SortOption) => void
    setPriceBracket: (bracket: PriceBracketId) => void
    toggleTag: (tag: ProductTag) => void
    toggleBrand: (slug: string) => void
    setGender: (gender?: ProductGender) => void
    setConcentration: (concentration?: Concentration) => void
    setFamily: (family?: string) => void
    /** Filters chosen besides the category, search and sort (drives the "Filtros" badge). */
    activeFilterCount: number
    setPage: (page: number) => void
    clearFilters: () => void
}

function isMember<T extends string>(allowed: readonly T[], value: string | null): value is T {
    return value !== null && (allowed as readonly string[]).includes(value)
}

function parseFilters(categoryParam: string | undefined, params: URLSearchParams): CatalogFilters {
    const rawSort = params.get(SORT_PARAM)
    const rawPrice = params.get(PRICE_PARAM)
    const rawPage = Number.parseInt(params.get(PAGE_PARAM) ?? '1', 10)
    const rawGender = params.get(GENDER_PARAM)
    const rawConcentration = params.get(CONCENTRATION_PARAM)
    const family = params.get(FAMILY_PARAM)?.trim()

    return {
        // Categories are dynamic: any slug is kept, and the view decides whether it exists.
        category: categoryParam || undefined,
        search: params.get(CATALOG_SEARCH_PARAM)?.trim() ?? '',
        sort: isMember(SORT_OPTIONS, rawSort) ? rawSort : 'relevance',
        priceBracket: isMember(PRICE_BRACKET_IDS, rawPrice) ? rawPrice : 'all',
        tags: (params.get(TAGS_PARAM)?.split(',') ?? []).filter((tag): tag is ProductTag =>
            isMember(PRODUCT_TAGS, tag),
        ),
        brands: [...new Set(params.getAll(BRAND_PARAM).filter(Boolean))],
        gender: isMember(PRODUCT_GENDERS, rawGender) ? rawGender : undefined,
        concentration: isMember(CONCENTRATIONS, rawConcentration) ? rawConcentration : undefined,
        family: family || undefined,
        page: Number.isFinite(rawPage) && rawPage > 1 ? rawPage : 1,
    }
}

function serializeFilters(filters: CatalogFilters): string {
    const params = new URLSearchParams()

    if (filters.search) params.set(CATALOG_SEARCH_PARAM, filters.search)
    if (filters.sort !== 'relevance') params.set(SORT_PARAM, filters.sort)
    if (filters.priceBracket !== 'all') params.set(PRICE_PARAM, filters.priceBracket)
    if (filters.tags.length > 0) params.set(TAGS_PARAM, filters.tags.join(','))
    for (const brand of filters.brands) params.append(BRAND_PARAM, brand)
    if (filters.gender) params.set(GENDER_PARAM, filters.gender)
    if (filters.concentration) params.set(CONCENTRATION_PARAM, filters.concentration)
    if (filters.family) params.set(FAMILY_PARAM, filters.family)
    if (filters.page > 1) params.set(PAGE_PARAM, String(filters.page))

    const query = params.toString()
    return query ? `?${query}` : ''
}

function toQueryParams(filters: CatalogFilters): ProductQueryParams {
    const bracket = PRICE_BRACKETS.find((candidate) => candidate.id === filters.priceBracket)

    return {
        category: filters.category,
        search: filters.search || undefined,
        sort: filters.sort,
        minPrice: bracket?.minPrice,
        maxPrice: bracket?.maxPrice,
        tags: filters.tags.length > 0 ? filters.tags : undefined,
        brands: filters.brands.length > 0 ? filters.brands : undefined,
        gender: filters.gender,
        concentration: filters.concentration,
        family: filters.family,
        page: filters.page,
        pageSize: CATALOG_PAGE_SIZE,
    }
}

/**
 * Single owner of the catalog's URL state: the category lives in the path segment
 * (`/catalogo/:category`) and every other filter in the query string, so any view
 * state is shareable as a link.
 */
export function useCatalogFilters(): UseCatalogFiltersResult {
    const { category: categoryParam } = useParams()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const rawQuery = searchParams.toString()

    const filters = useMemo(
        () => parseFilters(categoryParam, new URLSearchParams(rawQuery)),
        [categoryParam, rawQuery],
    )

    const applyFilters = useCallback(
        (patch: Partial<CatalogFilters>) => {
            const next: CatalogFilters = { ...filters, ...patch }
            const pathname = next.category ? categoryPath(next.category) : ROUTES.catalog

            void navigate(`${pathname}${serializeFilters(next)}`, { replace: true })
        },
        [filters, navigate],
    )

    const activeFilterCount =
        (filters.priceBracket !== 'all' ? 1 : 0) +
        filters.tags.length +
        filters.brands.length +
        (filters.gender ? 1 : 0) +
        (filters.concentration ? 1 : 0) +
        (filters.family ? 1 : 0)

    return {
        filters,
        queryParams: toQueryParams(filters),
        activeFilterCount,
        isFiltered:
            filters.category !== undefined ||
            filters.search !== '' ||
            filters.sort !== 'relevance' ||
            activeFilterCount > 0,
        setCategory: (category) => applyFilters({ category, page: 1 }),
        setSearch: (search) => applyFilters({ search, page: 1 }),
        setSort: (sort) => applyFilters({ sort, page: 1 }),
        setPriceBracket: (priceBracket) => applyFilters({ priceBracket, page: 1 }),
        toggleTag: (tag) =>
            applyFilters({
                tags: filters.tags.includes(tag)
                    ? filters.tags.filter((current) => current !== tag)
                    : [...filters.tags, tag],
                page: 1,
            }),
        toggleBrand: (slug) =>
            applyFilters({
                brands: filters.brands.includes(slug)
                    ? filters.brands.filter((current) => current !== slug)
                    : [...filters.brands, slug],
                page: 1,
            }),
        setGender: (gender) => applyFilters({ gender, page: 1 }),
        setConcentration: (concentration) => applyFilters({ concentration, page: 1 }),
        setFamily: (family) => applyFilters({ family, page: 1 }),
        setPage: (page) => applyFilters({ page }),
        clearFilters: () => void navigate(ROUTES.catalog, { replace: true }),
    }
}
