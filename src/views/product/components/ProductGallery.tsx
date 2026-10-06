import { useState } from 'react'
import { cva } from 'class-variance-authority'

import type { Product } from '@/@types/product'
import { ProductMedia } from '@/components/shared/ProductMedia'
import { Sticker } from '@/components/ui'
import { cldSrcSet, cldUrl } from '@/utils/cloudinary'

const thumbVariants = cva(
    'relative flex aspect-[4/5] w-16 shrink-0 snap-start overflow-hidden rounded-xl border bg-white transition duration-200 sm:w-20',
    {
        variants: {
            isSelected: {
                true: 'border-rose-700 ring-1 ring-rose-700',
                false: 'border-line opacity-80 hover:border-gold-400 hover:opacity-100',
            },
        },
        defaultVariants: { isSelected: false },
    },
)

export interface ProductGalleryProps {
    product: Product
}

/** Main photo (whole bottle, `object-contain`) with thumbnails; the placeholder without photos. */
export function ProductGallery({ product }: ProductGalleryProps) {
    const [chosenImageId, setChosenImageId] = useState<string | null>(null)
    const activeImage =
        product.images.find((image) => image.id === chosenImageId) ?? product.images.at(0)
    const hasDiscount =
        product.compareAtPrice !== undefined && product.compareAtPrice > product.price

    return (
        <div className="space-y-3 sm:space-y-4">
            <div className="relative aspect-[4/5] overflow-hidden rounded-card border border-line bg-white sm:aspect-square lg:aspect-[4/5]">
                <ProductMedia
                    image={activeImage}
                    fallbackAlt={product.name}
                    brandName={product.brand?.name}
                    size="lg"
                    fit="contain"
                    loading="eager"
                    fetchPriority="high"
                    sizes="(min-width: 1024px) 40rem, 100vw"
                    className={activeImage ? 'p-4 sm:p-8' : undefined}
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
                    className="flex snap-x scrollbar-none gap-2.5 overflow-x-auto pb-1"
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
                                <img
                                    src={cldUrl(image.url, 160)}
                                    srcSet={cldSrcSet(image.url, [80, 160, 240])}
                                    sizes="80px"
                                    alt=""
                                    loading="lazy"
                                    decoding="async"
                                    draggable={false}
                                    className="size-full object-cover"
                                />
                            </button>
                        </li>
                    ))}
                </ul>
            ) : null}
        </div>
    )
}
