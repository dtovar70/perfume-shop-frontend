import { useId, useState } from 'react'
import { ArrowRight, PackageOpen, X } from 'lucide-react'
import { Link } from 'react-router'

import { AddToCartButton } from '@/components/shared/AddToCartButton'
import { BsApproximation } from '@/components/shared/BsApproximation'
import { FavoriteButton } from '@/components/shared/FavoriteButton'
import { PriceTag } from '@/components/shared/PriceTag'
import { Button, Dialog, QuantityStepper, Spinner } from '@/components/ui'
import { formatPerfumeSpec, GENDER_LABELS } from '@/constants/product.constant'
import { productPath } from '@/constants/route.constant'
import { NotFoundError } from '@/services/ProductService'
import { MAX_LINE_QUANTITY, useCartItems } from '@/store/cartStore'
import { cn } from '@/utils/cn'
import { hasVariablePrice } from '@/utils/productPrice'
import { resolvePurchase } from '@/utils/productPurchase'
import { variantDisplayLabel } from '@/utils/variantLabel'
import { ProductGallery } from '@/views/product/components/ProductGallery'
import { StockState } from '@/views/product/components/StockState'
import { VariantPicker } from '@/views/product/components/VariantPicker'
import { useProduct } from '@/views/product/hooks/useProduct'

export interface QuickViewDialogProps {
    slug: string
    onClose: () => void
}

/**
 * "Vista rápida": the essentials of a product (photos, price, stock, size, quantity) in a
 * dialog over the list. Reads the same cache entry as the product page. Adding to the cart
 * closes the dialog at once, so the bottle can be seen flying from its photo to the header
 * cart (a dialog that stayed open would hide the flight and the cart badge).
 */
export function QuickViewDialog({ slug, onClose }: QuickViewDialogProps) {
    const titleId = useId()
    const { data: product, isPending, isError, error, refetch } = useProduct(slug)
    const [chosenVariantId, setChosenVariantId] = useState<string | null>(null)
    const [quantity, setQuantity] = useState(1)
    const cartItems = useCartItems()

    const purchase = product ? resolvePurchase(product, chosenVariantId, quantity, cartItems) : null
    const specParts = product
        ? [
              formatPerfumeSpec(
                  product.concentration,
                  purchase?.selectedVariant?.volumeMl ?? product.volumeMl,
                  true,
              ) || null,
              GENDER_LABELS[product.gender] ?? null,
              product.olfactoryFamily,
          ].filter(Boolean)
        : []

    return (
        <Dialog
            isOpen
            onClose={onClose}
            labelledBy={titleId}
            data-fly-overlay=""
            className={cn(
                // Phones: a full-screen sheet. From `sm`: a centered card about 900px wide.
                'm-0 h-dvh max-h-none w-full max-w-none animate-sheet-up rounded-none border-0 motion-reduce:animate-none',
                'sm:m-auto sm:h-fit sm:max-h-[min(90dvh,46rem)] sm:w-[calc(100%-3rem)] sm:max-w-[56.25rem] sm:animate-select-pop sm:rounded-card sm:border',
            )}
        >
            <div data-fly-scope="" className="relative flex h-full max-h-[inherit] flex-col">
                <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-4 py-2 sm:absolute sm:top-3 sm:right-3 sm:z-10 sm:border-0 sm:p-0">
                    <p className="text-[11px] font-bold tracking-[0.22em] text-accent uppercase sm:sr-only">
                        Vista rápida
                    </p>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar la vista rápida"
                        className="-mr-2 flex size-11 items-center justify-center rounded-full text-fg transition hover:rotate-90 hover:bg-elevated motion-reduce:transform-none sm:mr-0 sm:border sm:border-line sm:bg-surface/90 sm:shadow-soft sm:backdrop-blur-sm"
                    >
                        <X aria-hidden="true" className="size-5" />
                    </button>
                </div>

                <div className="scroll-soft min-h-0 flex-1 overflow-y-auto overscroll-contain">
                    {product && purchase ? (
                        <div className="grid gap-6 p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:p-6 md:grid-cols-2 md:gap-8 md:p-8">
                            <div className="md:sticky md:top-0 md:self-start">
                                <ProductGallery product={product} compact />
                            </div>

                            <div className="min-w-0 space-y-5 md:pt-6">
                                <div className="space-y-1.5">
                                    {product.brand ? (
                                        <p className="text-xs font-bold tracking-[0.24em] text-accent uppercase">
                                            {product.brand.name}
                                        </p>
                                    ) : null}
                                    <div className="flex items-start justify-between gap-4">
                                        <h2
                                            id={titleId}
                                            className="font-display text-[1.75rem] leading-[1.1] font-semibold text-balance text-fg sm:text-3xl"
                                        >
                                            {product.name}
                                        </h2>
                                        <FavoriteButton product={product} appearance="inline" />
                                    </div>
                                    {specParts.length > 0 ? (
                                        <p className="text-sm text-fg-soft">
                                            {specParts.join(' · ')}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="space-y-2 border-y border-line py-4">
                                    <div className="flex flex-wrap items-end justify-between gap-x-5 gap-y-2">
                                        <PriceTag
                                            price={purchase.unitPrice}
                                            compareAtPrice={product.compareAtPrice}
                                            size="lg"
                                        />
                                        <BsApproximation
                                            usd={purchase.unitPrice}
                                            className="text-left sm:text-right"
                                        />
                                    </div>
                                    {hasVariablePrice(product) && purchase.selectedVariant ? (
                                        <p className="text-xs text-fg-soft">
                                            Precio para{' '}
                                            {variantDisplayLabel(purchase.selectedVariant)}.
                                        </p>
                                    ) : null}
                                    <StockState stock={purchase.stockLeft} />
                                </div>

                                <VariantPicker
                                    variants={product.variants}
                                    basePrice={product.price}
                                    selectedVariantId={purchase.selectedVariant?.id}
                                    onSelect={setChosenVariantId}
                                />

                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center gap-3">
                                        {purchase.stockLeft > 0 ? (
                                            <QuantityStepper
                                                value={purchase.quantity}
                                                max={purchase.maxQuantity}
                                                disabled={purchase.addable === 0}
                                                onChange={setQuantity}
                                                className="h-12"
                                            />
                                        ) : null}
                                        <AddToCartButton
                                            product={product}
                                            variantId={purchase.variantId}
                                            quantity={purchase.quantity}
                                            openDrawerOnAdd={false}
                                            onAdded={onClose}
                                            className="h-12 flex-1 basis-40 px-5"
                                        />
                                    </div>
                                    {purchase.inCart > 0 && purchase.stockLeft > 0 ? (
                                        <p role="status" className="text-sm text-fg-soft">
                                            Ya tienes {purchase.inCart} en el carrito
                                            {purchase.addable === 0
                                                ? ': no quedan más unidades de este tamaño.'
                                                : ` · puedes agregar ${Math.min(purchase.addable, MAX_LINE_QUANTITY)} más.`}
                                        </p>
                                    ) : null}
                                </div>

                                <Link
                                    to={productPath(product.slug)}
                                    onClick={onClose}
                                    className="group/link inline-flex min-h-11 items-center gap-2 text-sm font-bold text-accent underline-offset-4 hover:underline"
                                >
                                    Ver detalles completos
                                    <ArrowRight
                                        aria-hidden="true"
                                        className="size-4 transition-transform group-hover/link:translate-x-0.5 motion-reduce:transform-none"
                                    />
                                </Link>
                            </div>
                        </div>
                    ) : isPending ? (
                        <div className="flex min-h-80 items-center justify-center">
                            <h2 id={titleId} className="sr-only">
                                Cargando perfume
                            </h2>
                            <Spinner className="text-accent" label="Cargando el perfume" />
                        </div>
                    ) : (
                        <div className="flex min-h-80 flex-col items-center justify-center gap-4 p-8 text-center">
                            <span
                                aria-hidden="true"
                                className="flex size-14 items-center justify-center rounded-full bg-elevated text-accent"
                            >
                                <PackageOpen className="size-6" />
                            </span>
                            <h2 id={titleId} className="font-display text-xl text-fg">
                                {error instanceof NotFoundError
                                    ? 'Este perfume ya no está disponible'
                                    : 'No pudimos cargar este perfume'}
                            </h2>
                            {isError && !(error instanceof NotFoundError) ? (
                                <Button variant="secondary" onClick={() => void refetch()}>
                                    Reintentar
                                </Button>
                            ) : null}
                        </div>
                    )}
                </div>
            </div>
        </Dialog>
    )
}
