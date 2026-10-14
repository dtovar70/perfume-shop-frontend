import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
    type QueryClient,
} from '@tanstack/react-query'

import type { AdminProduct, AdminProductQueryParams, ProductInput } from '@/@types/admin'
import { queryKeys } from '@/constants/query-keys.constant'
import { isApiError } from '@/services/errors'
import { AdminService } from '@/services/AdminService'

/** 409 of an edit whose stock changed since the form was loaded (orders took units). */
export const STOCK_CHANGED = 'STOCK_CHANGED'

/** Current counts the API sends with a 409 `STOCK_CHANGED`. */
export interface StockChangedPayload {
    /** The product's stock (the sum of its variants when it has any). */
    stock: number
    variants: { id: string; label: string; stock: number }[]
}

/** The current counts of a 409 `STOCK_CHANGED`, or null for any other error. */
export function readStockChanged(error: unknown): StockChangedPayload | null {
    if (!isApiError(error, 409) || error.code !== STOCK_CHANGED) return null
    const { stock, variants } = error.payload
    return {
        stock: typeof stock === 'number' ? stock : 0,
        variants: Array.isArray(variants) ? (variants as StockChangedPayload['variants']) : [],
    }
}

/**
 * Any product change can alter what the storefront shows (lists, detail, featured,
 * related) and the per-category counts, so all of it is marked stale together.
 */
export function invalidateProductCaches(queryClient: QueryClient): Promise<void> {
    return Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.products.lists() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.categories.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories() }),
    ]).then(() => undefined)
}

/** Stores the fresh product the API returned and refreshes everything derived from it. */
function syncProduct(queryClient: QueryClient, product: AdminProduct): Promise<void> {
    queryClient.setQueryData(queryKeys.admin.products.detail(product.id), product)
    return invalidateProductCaches(queryClient)
}

export function useAdminProducts(params: AdminProductQueryParams) {
    return useQuery({
        queryKey: queryKeys.admin.products.list(params),
        queryFn: () => AdminService.getProducts(params),
        placeholderData: keepPreviousData,
        staleTime: 0,
    })
}

export function useAdminProduct(id: string) {
    return useQuery({
        queryKey: queryKeys.admin.products.detail(id),
        queryFn: () => AdminService.getProduct(id),
        enabled: id.length > 0,
        staleTime: 0,
    })
}

export function useCreateProduct() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: ProductInput) => AdminService.createProduct(input),
        onSuccess: (product) => syncProduct(queryClient, product),
    })
}

export function useUpdateProduct(id: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: Partial<ProductInput>) => AdminService.updateProduct(id, input),
        onSuccess: (product) => syncProduct(queryClient, product),
        onError: (error) => {
            // Orders moved the stock: refetch so the page and the list show the current counts.
            if (readStockChanged(error)) {
                void queryClient.invalidateQueries({
                    queryKey: queryKeys.admin.products.detail(id),
                })
                void queryClient.invalidateQueries({
                    queryKey: queryKeys.admin.products.lists(),
                })
            }
        },
    })
}

export function useSetProductActive() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
            AdminService.setProductActive(id, isActive),
        onSuccess: (product) => syncProduct(queryClient, product),
    })
}

export function useDeleteProduct() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => AdminService.deleteProduct(id),
        onSuccess: (_data, id) => {
            queryClient.removeQueries({ queryKey: queryKeys.admin.products.detail(id) })
            return invalidateProductCaches(queryClient)
        },
    })
}

export function useUploadProductImages(id: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (files: File[]) => AdminService.uploadProductImages(id, files),
        onSuccess: (product) => syncProduct(queryClient, product),
    })
}

export function useDeleteProductImage(id: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (imageId: string) => AdminService.deleteProductImage(id, imageId),
        onSuccess: (product) => syncProduct(queryClient, product),
    })
}

/** Reorders optimistically so the grid follows the user's move at once. */
export function useReorderProductImages(id: string) {
    const queryClient = useQueryClient()
    const detailKey = queryKeys.admin.products.detail(id)

    return useMutation({
        mutationFn: (imageIds: string[]) => AdminService.reorderProductImages(id, imageIds),
        onMutate: async (imageIds) => {
            await queryClient.cancelQueries({ queryKey: detailKey })
            const previous = queryClient.getQueryData<AdminProduct>(detailKey)
            if (previous) {
                const byId = new Map(previous.images.map((image) => [image.id, image]))
                const images = imageIds.flatMap((imageId) => byId.get(imageId) ?? [])
                queryClient.setQueryData<AdminProduct>(detailKey, { ...previous, images })
            }
            return { previous }
        },
        onError: (_error, _imageIds, context) => {
            if (context?.previous) queryClient.setQueryData(detailKey, context.previous)
        },
        onSuccess: (product) => syncProduct(queryClient, product),
    })
}
