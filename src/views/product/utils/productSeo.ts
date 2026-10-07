import type { Category, Product } from '@/@types/product'
import { categoryPath, productPath, ROUTES } from '@/constants/route.constant'
import { variantPrice } from '@/utils/productPrice'
import { defaultVariant, stockOf } from '@/utils/productStock'
import { absoluteUrl, type SeoOptions } from '@/utils/hooks/useSeo'

const DESCRIPTION_MAX = 160

/** First sentence-ish slice of the description, or a generated one. */
function describe(product: Product): string {
    const text = product.description.replace(/\s+/g, ' ').trim()
    const fallback = `${product.name}${product.brand ? ` de ${product.brand.name}` : ''}: fragancia original con envíos a toda Venezuela.`
    if (!text) return fallback
    return text.length <= DESCRIPTION_MAX
        ? text
        : `${text.slice(0, DESCRIPTION_MAX - 1).replace(/\s+\S*$/, '')}…`
}

/**
 * Title, description, preview image and schema.org data of a product page: a `Product` (brand,
 * sku, offer with the price shown by default, availability, URL) and its `BreadcrumbList`.
 */
export function productSeo(product: Product, category: Category | undefined): SeoOptions {
    const url = absoluteUrl(productPath(product.slug))
    const variant = defaultVariant(product)
    const inStock = stockOf(product, variant) > 0
    const images = product.images.map((image) => image.url)

    const breadcrumbs = [
        { name: 'Inicio', path: ROUTES.home },
        { name: 'Perfumes', path: ROUTES.catalog },
        ...(category ? [{ name: category.name, path: categoryPath(category.slug) }] : []),
        { name: product.name, path: productPath(product.slug) },
    ]

    return {
        title: product.name,
        description: describe(product),
        image: images[0],
        canonical: productPath(product.slug),
        type: 'product',
        jsonLd: [
            {
                '@context': 'https://schema.org',
                '@type': 'Product',
                name: product.name,
                description: describe(product),
                ...(images.length > 0 ? { image: images } : {}),
                ...(product.sku ? { sku: product.sku } : {}),
                ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand.name } } : {}),
                ...(category ? { category: category.name } : {}),
                offers: {
                    '@type': 'Offer',
                    url,
                    price: variantPrice(product, variant).toFixed(2),
                    priceCurrency: 'USD',
                    availability: inStock
                        ? 'https://schema.org/InStock'
                        : 'https://schema.org/OutOfStock',
                    itemCondition: 'https://schema.org/NewCondition',
                },
            },
            {
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: breadcrumbs.map((crumb, index) => ({
                    '@type': 'ListItem',
                    position: index + 1,
                    name: crumb.name,
                    item: absoluteUrl(crumb.path),
                })),
            },
        ],
    }
}
