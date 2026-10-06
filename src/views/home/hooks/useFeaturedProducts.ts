import { useQuery } from '@tanstack/react-query'

import type { ProductQueryParams } from '@/@types/common'
import { queryKeys } from '@/constants/query-keys.constant'
import { ProductService } from '@/services/ProductService'

export const FEATURED_LIMIT = 8

/** `GET /products/featured`: products marked "destacado" from the admin. */
export function useFeaturedProducts(limit: number = FEATURED_LIMIT) {
    return useQuery({
        queryKey: queryKeys.products.featured(limit),
        queryFn: () => ProductService.getFeaturedProducts(limit),
    })
}

const NEW_ARRIVALS_PARAMS: ProductQueryParams = {
    tags: ['nuevo'],
    sort: 'newest',
    page: 1,
    pageSize: 8,
}

/** "Novedades": products tagged `nuevo`, newest first. */
export function useNewArrivals() {
    return useQuery({
        queryKey: queryKeys.products.list(NEW_ARRIVALS_PARAMS),
        queryFn: () => ProductService.getProducts(NEW_ARRIVALS_PARAMS),
    })
}
