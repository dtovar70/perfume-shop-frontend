import type {
    AdminBrand,
    AdminCategory,
    AdminProduct,
    AdminProductQueryParams,
    CategoryCreateInput,
    BrandInput,
    CategoryInput,
    ProductInput,
} from '@/@types/admin'
import type { Paginated } from '@/@types/common'
import type { CategorySlug } from '@/@types/product'
import { apiClient } from '@/services/ApiClient'

const PRODUCTS = '/admin/products'
const CATEGORIES = '/admin/categories'
const BRANDS = '/admin/brands'

function brandPath(slug: string): string {
    return `${BRANDS}/${encodeURIComponent(slug)}`
}

/** JSON body, or multipart when a logo file is attached. */
function brandBody(input: Partial<BrandInput>): FormData | Partial<BrandInput> {
    const { logo, ...fields } = input
    if (!logo) return fields
    const form = new FormData()
    for (const [key, value] of Object.entries(fields)) {
        if (value === undefined || value === null) continue
        form.append(key, String(value))
    }
    form.append('logo', logo)
    return form
}

/** JSON body, or multipart when a cover image is attached (fields travel as text). */
function categoryBody(
    input: Partial<CategoryCreateInput>,
): FormData | Partial<CategoryCreateInput> {
    const { image, ...fields } = input
    if (!image) return fields
    const form = new FormData()
    for (const [key, value] of Object.entries(fields)) {
        if (value === undefined || value === null) continue
        form.append(key, String(value))
    }
    form.append('image', image)
    return form
}

function categoryPath(slug: CategorySlug, suffix = ''): string {
    return `${CATEGORIES}/${encodeURIComponent(slug)}${suffix}`
}

function productPath(id: string, suffix = ''): string {
    return `${PRODUCTS}/${encodeURIComponent(id)}${suffix}`
}

/** Back-office endpoints. Every call needs the admin session cookie. */
export const AdminService = {
    getProducts: (params: AdminProductQueryParams = {}) =>
        apiClient.get<Paginated<AdminProduct>>(PRODUCTS, {
            query: {
                search: params.search?.trim(),
                category: params.category,
                isActive: params.isActive,
                brand: params.brand,
                page: params.page,
                pageSize: params.pageSize,
            },
        }),
    getProduct: (id: string) => apiClient.get<AdminProduct>(productPath(id)),
    createProduct: (input: ProductInput) => apiClient.post<AdminProduct>(PRODUCTS, input),
    updateProduct: (id: string, input: Partial<ProductInput>) =>
        apiClient.patch<AdminProduct>(productPath(id), input),
    setProductActive: (id: string, isActive: boolean) =>
        apiClient.patch<AdminProduct>(productPath(id, '/active'), { isActive }),
    deleteProduct: (id: string) => apiClient.delete(productPath(id)),

    uploadProductImages: (id: string, files: File[]) => {
        const form = new FormData()
        for (const file of files) form.append('files', file)
        return apiClient.post<AdminProduct>(productPath(id, '/images'), form)
    },
    reorderProductImages: (id: string, imageIds: string[]) =>
        apiClient.patch<AdminProduct>(productPath(id, '/images/order'), { imageIds }),
    deleteProductImage: (id: string, imageId: string) =>
        apiClient.delete<AdminProduct>(productPath(id, `/images/${encodeURIComponent(imageId)}`)),

    getCategories: () => apiClient.get<AdminCategory[]>(CATEGORIES),
    createCategory: (input: CategoryCreateInput) =>
        apiClient.post<AdminCategory>(CATEGORIES, categoryBody(input)),
    updateCategory: (slug: CategorySlug, input: CategoryInput) =>
        apiClient.patch<AdminCategory>(categoryPath(slug), categoryBody(input)),
    /** `slugs` must list every category exactly once; returns the list in its new order. */
    reorderCategories: (slugs: CategorySlug[]) =>
        apiClient.patch<AdminCategory[]>(`${CATEGORIES}/order`, { slugs }),
    /** Rejected with 409 while the category still has products, hidden ones included. */
    deleteCategory: (slug: CategorySlug) => apiClient.delete(categoryPath(slug)),

    getBrands: () => apiClient.get<AdminBrand[]>(BRANDS),
    createBrand: (input: BrandInput) => apiClient.post<AdminBrand>(BRANDS, brandBody(input)),
    updateBrand: (slug: string, input: Partial<BrandInput>) =>
        apiClient.patch<AdminBrand>(brandPath(slug), brandBody(input)),
    /** Rejected with 409 while the brand still has products. */
    deleteBrand: (slug: string) => apiClient.delete(brandPath(slug)),
} as const
