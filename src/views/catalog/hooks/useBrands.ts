import { useQuery } from '@tanstack/react-query'

import { queryKeys } from '@/constants/query-keys.constant'
import { ProductService } from '@/services/ProductService'

/** Active brands with their product counts (`GET /brands`), shared by home, catalog and menu. */
export function useBrands() {
    return useQuery({
        queryKey: queryKeys.brands.all,
        queryFn: () => ProductService.getBrands(),
        staleTime: 10 * 60_000,
    })
}
