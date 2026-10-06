import { keepPreviousData, useQuery } from '@tanstack/react-query'

import type { CategorySlug } from '@/@types/product'
import { queryKeys } from '@/constants/query-keys.constant'
import { ProductService } from '@/services/ProductService'

/** Filter options (brands, genders, families…) for the catalog, scoped to a category. */
export function useFacets(category?: CategorySlug) {
    return useQuery({
        queryKey: queryKeys.products.facets(category),
        queryFn: () => ProductService.getFacets(category),
        placeholderData: keepPreviousData,
        staleTime: 5 * 60_000,
    })
}
