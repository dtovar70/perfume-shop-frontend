import { z } from 'zod'

import type { AdminBrand, BrandInput } from '@/@types/admin'
import { SLUG_PATTERN } from '@/views/admin/products/schema/product.schema'

export const BRAND_NAME_MAX_LENGTH = 60
export const BRAND_DESCRIPTION_MAX_LENGTH = 1000
/** Logos are small marks; anything bigger is almost certainly the wrong file. */
export const BRAND_LOGO_MAX_BYTES = 2 * 1024 * 1024
export const BRAND_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']

/** Mirrors the API's brand DTO. */
export const brandFormSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, 'Escribe el nombre de la marca')
        .max(BRAND_NAME_MAX_LENGTH, `Máximo ${BRAND_NAME_MAX_LENGTH} caracteres`),
    slug: z
        .string()
        .trim()
        .max(80, 'Máximo 80 caracteres')
        .refine(
            (value) => value === '' || SLUG_PATTERN.test(value),
            'Solo minúsculas, números y guiones, por ejemplo carolina-herrera',
        ),
    description: z
        .string()
        .trim()
        .max(BRAND_DESCRIPTION_MAX_LENGTH, `Máximo ${BRAND_DESCRIPTION_MAX_LENGTH} caracteres`),
    sortOrder: z
        .number({ error: 'Escribe un número' })
        .int('Usa un número entero')
        .min(0, 'No puede ser negativo')
        .max(9999, 'Usa un número menor'),
    isActive: z.boolean(),
    logoUrl: z
        .string()
        .trim()
        .refine(
            (value) => value === '' || /^https?:\/\/\S+$/i.test(value),
            'Pega un enlace que empiece por https://',
        ),
})

export type BrandFormValues = z.infer<typeof brandFormSchema>

export const EMPTY_BRAND_FORM: BrandFormValues = {
    name: '',
    slug: '',
    description: '',
    sortOrder: 0,
    isActive: true,
    logoUrl: '',
}

export function toBrandFormValues(brand: AdminBrand): BrandFormValues {
    return {
        name: brand.name,
        slug: brand.slug,
        description: brand.description,
        sortOrder: brand.sortOrder,
        isActive: brand.isActive,
        logoUrl: brand.logoUrl ?? '',
    }
}

/**
 * Form values to request body. A chosen file wins over the URL (sent as multipart); otherwise
 * the URL is sent as JSON, and an emptied URL on edit removes the logo (`null`).
 */
export function toBrandInput(
    values: BrandFormValues,
    logo: File | null,
    mode: 'create' | 'edit',
): BrandInput {
    const slug = values.slug.trim()
    const logoUrl = values.logoUrl.trim()
    return {
        name: values.name.trim(),
        ...(slug ? { slug } : {}),
        description: values.description.trim(),
        sortOrder: values.sortOrder,
        isActive: values.isActive,
        ...(logo ? { logo } : logoUrl ? { logoUrl } : mode === 'edit' ? { logoUrl: null } : {}),
    }
}
