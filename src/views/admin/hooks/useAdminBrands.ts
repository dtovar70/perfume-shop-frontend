import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'

import type { AdminBrand, BrandInput } from '@/@types/admin'
import { queryKeys } from '@/constants/query-keys.constant'
import { AdminService } from '@/services/AdminService'

/** Brands feed the storefront strip, filters and every product card, so all of those go stale. */
function invalidateBrandCaches(queryClient: QueryClient): Promise<void> {
    return Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.brands() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.products.lists() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.brands.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
    ]).then(() => undefined)
}

function sortBrands(brands: AdminBrand[]): AdminBrand[] {
    return [...brands].sort(
        (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'es'),
    )
}

export function useAdminBrands() {
    return useQuery({
        queryKey: queryKeys.admin.brands(),
        queryFn: AdminService.getBrands,
        select: sortBrands,
    })
}

export function useCreateBrand() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (input: BrandInput) => AdminService.createBrand(input),
        onSuccess: () => invalidateBrandCaches(queryClient),
    })
}

export function useUpdateBrand() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ slug, input }: { slug: string; input: Partial<BrandInput> }) =>
            AdminService.updateBrand(slug, input),
        onSuccess: () => invalidateBrandCaches(queryClient),
    })
}

export function useDeleteBrand() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (slug: string) => AdminService.deleteBrand(slug),
        onSuccess: () => invalidateBrandCaches(queryClient),
    })
}
