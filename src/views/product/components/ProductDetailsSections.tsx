import type { Product } from '@/@types/product'
import { Tabs, type TabItem } from '@/components/ui/Tabs'
import { useMediaQuery } from '@/utils/hooks/useMediaQuery'
import { OlfactoryPyramid } from '@/views/product/components/OlfactoryPyramid'
import { ProductDescription, ProductFaq, ProductMeta } from '@/views/product/components/ProductMeta'

/** Tailwind's `lg`. */
const DESKTOP_QUERY = '(min-width: 64rem)'

export interface ProductDetailsSectionsProps {
    product: Product
}

function hasProductDescription(product: Product): boolean {
    return product.description.trim() !== '' || product.highlights.length > 0
}

function hasPyramid(product: Product): boolean {
    const { top, heart, base } = product.notes
    return top.length + heart.length + base.length > 0 || Boolean(product.olfactoryFamily)
}

/**
 * What sits under the buy box. Desktop: "Descripción", "Pirámide olfativa" and "Preguntas
 * frecuentes" as tabs (only the ones with content). Phones and tablets: the stacked sections,
 * where scrolling is the natural way through them.
 */
export function ProductDetailsSections({ product }: ProductDetailsSectionsProps) {
    const isDesktop = useMediaQuery(DESKTOP_QUERY)

    if (!isDesktop) {
        return (
            <div className="grid gap-10">
                <OlfactoryPyramid notes={product.notes} family={product.olfactoryFamily} />
                <ProductMeta product={product} />
            </div>
        )
    }

    const items: TabItem[] = []
    if (hasProductDescription(product)) {
        items.push({
            id: 'descripcion',
            label: 'Descripción',
            content: (
                <div className="max-w-3xl">
                    <ProductDescription product={product} hideHeading />
                </div>
            ),
        })
    }
    if (hasPyramid(product)) {
        items.push({
            id: 'notas',
            label: 'Pirámide olfativa',
            content: (
                <OlfactoryPyramid
                    notes={product.notes}
                    family={product.olfactoryFamily}
                    className="max-w-3xl"
                />
            ),
        })
    }
    items.push({
        id: 'preguntas',
        label: 'Preguntas frecuentes',
        content: (
            <div className="max-w-3xl">
                <ProductFaq hideHeading />
            </div>
        ),
    })

    return <Tabs items={items} label="Detalles del perfume" panelClassName="pt-8" />
}
