import { useState } from 'react'
import { cva } from 'class-variance-authority'

import type { Product } from '@/@types/product'
import { ProductMedia } from '@/components/shared/ProductMedia'
import { Sticker } from '@/components/ui'
import { cldSrcSet, cldUrl } from '@/utils/cloudinary'
import { cn } from '@/utils/cn'

const thumbVariants = cva(
    'relative flex aspect-[4/5] w-16 shrink-0 snap-start overflow-hidden rounded-xl border bg-surface transition duration-200 sm:w-20',
    {
        variants: {
            isSelected: {
                true: 'border-cherry-500 ring-1 ring-cherry-500',
                false: 'border-line opacity-80 hover:border-cherry-500/50 hover:opacity-100',
            },
        },
        defaultVariants: { isSelected: false },
    },
)

export interface ProductGalleryProps {
    product: Product
    /** A square frame of its own size (the quick view) instead of the page's tall one. */
    compact?: boolean
}

/** Main photo (whole bottle, `object-contain`) with thumbnails; the placeholder without photos. */
export function ProductGallery({ product, compact = false }: ProductGalleryProps) {
    const [chosenImageId, setChosenImageId] = useState<string | null>(null)
    const activeImage =
        product.images.find((image) => image.id === chosenImageId) ?? product.images.at(0)
    const hasDiscount =
        product.compareAtPrice !== undefined && product.compareAtPrice > product.price

    return (
        <div className="space-y-3 sm:space-y-4">
            <div
                // The quick view is its own fly-to-cart scope; only the page gallery is the
                // page-level source.
                data-fly-source={compact ? undefined : product.id}
                className={cn(
                    'relative overflow-hidden rounded-xl2 border border-line bg-surface',
                    compact
                        ? 'aspect-square'
                        : 'aspect-[4/5] sm:aspect-square lg:aspect-auto lg:h-[min(calc(100svh-13rem),40rem)] lg:min-h-[24rem] lg:rounded-blob',
                )}
            >
                <ProductMedia
                    image={activeImage}
                    fallbackAlt={product.name}
                    brandName={product.brand?.name}
                    size="lg"
                    loading="eager"
                    fetchPriority={compact ? undefined : 'high'}
                    sizes={
                        compact
                            ? '(min-width: 640px) 26rem, 100vw'
                            : '(min-width: 1024px) 40rem, 100vw'
                    }
                />

                {hasDiscount ? (
                    <Sticker tone="blush" size="md" className="absolute top-4 left-4">
                        Oferta
                    </Sticker>
                ) : product.tags.includes('nuevo') ? (
                    <Sticker tone="butter" size="md" className="absolute top-4 left-4">
                        Nuevo
                    </Sticker>
                ) : null}
            </div>

            {product.images.length > 1 ? (
                <ul
                    aria-label="Fotos del producto"
                    className="scrollbar-none flex snap-x gap-2.5 overflow-x-auto pb-1"
                >
                    {product.images.map((image, index) => (
                        <li key={image.id}>
                            <button
                                type="button"
                                onClick={() => setChosenImageId(image.id)}
                                aria-pressed={image.id === activeImage?.id}
                                aria-label={`Ver foto ${index + 1} de ${product.images.length}`}
                                className={thumbVariants({
                                    isSelected: image.id === activeImage?.id,
                                })}
                            >
                                <span className="product-plate size-full p-1.5">
                                    <img
                                        src={cldUrl(image.url, 160)}
                                        srcSet={cldSrcSet(image.url, [80, 160, 240])}
                                        sizes="80px"
                                        alt=""
                                        width={80}
                                        height={100}
                                        loading="lazy"
                                        decoding="async"
                                        draggable={false}
                                        className="size-full object-contain mix-blend-multiply"
                                    />
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            ) : null}
        </div>
    )
}
