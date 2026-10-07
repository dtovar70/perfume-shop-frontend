import { useRef, useState } from 'react'
import { ChevronRight, PackageOpen, ShieldCheck, Truck } from 'lucide-react'
import { Link, useParams } from 'react-router'

import { AddToCartButton } from '@/components/shared/AddToCartButton'
import { BsApproximation } from '@/components/shared/BsApproximation'
import { EmptyState } from '@/components/shared/EmptyState'
import { PriceTag } from '@/components/shared/PriceTag'
import { SocialIcon } from '@/components/shared/SocialIcon'
import { Button, QuantityStepper } from '@/components/ui'
import { CONTAINER } from '@/constants/layout.constant'
import { formatPerfumeSpec, GENDER_LABELS } from '@/constants/product.constant'
import { brandCatalogPath, categoryPath, ROUTES } from '@/constants/route.constant'
import { NotFoundError } from '@/services/ProductService'
import { MAX_LINE_QUANTITY, useCartItems } from '@/store/cartStore'
import { cartUnitsOf } from '@/utils/cartAvailability'
import { cn } from '@/utils/cn'
import { whatsappUrl } from '@/utils/content'
import { hasVariablePrice, variantPrice } from '@/utils/productPrice'
import { defaultVariant, isVariantSoldOut, stockOf } from '@/utils/productStock'
import { useShippingContent, useSiteContent } from '@/utils/hooks/useSiteContent'
import { useCategory } from '@/views/catalog/hooks/useCategories'
import { NotFoundView } from '@/views/others/NotFoundView'
import { OlfactoryPyramid } from '@/views/product/components/OlfactoryPyramid'
import { ProductDetailSkeleton } from '@/views/product/components/ProductDetailSkeleton'
import { ProductGallery } from '@/views/product/components/ProductGallery'
import { ProductMeta } from '@/views/product/components/ProductMeta'
import { RelatedProducts } from '@/views/product/components/RelatedProducts'
import { StickyAddToCartBar } from '@/views/product/components/StickyAddToCartBar'
import { StockState } from '@/views/product/components/StockState'
import { VariantPicker } from '@/views/product/components/VariantPicker'
import { variantDisplayLabel } from '@/utils/variantLabel'
import { useProduct } from '@/views/product/hooks/useProduct'

const pageClass = 'space-y-16 py-6 sm:py-10 lg:space-y-24 lg:py-8'
const breadcrumbLinkClass =
    'inline-flex min-h-8 items-center text-fg-soft transition hover:text-accent'

export function ProductDetailView() {
    const { slug = '' } = useParams()
    const { data: product, isPending, isError, error, refetch } = useProduct(slug)
    const [chosenVariantId, setChosenVariantId] = useState<string | null>(null)
    const [quantity, setQuantity] = useState(1)
    const shipping = useShippingContent()
    const { contact } = useSiteContent()
    const cartItems = useCartItems()
    const category = useCategory(product?.category)
    const addRowRef = useRef<HTMLDivElement>(null)

    if (error instanceof NotFoundError) return <NotFoundView />

    if (isPending) {
        return (
            <div className={cn(CONTAINER, pageClass)}>
                <h1 className="sr-only">Cargando perfume</h1>
                <ProductDetailSkeleton />
            </div>
        )
    }

    if (isError) {
        return (
            <div className={cn(CONTAINER, pageClass)}>
                <h1 className="sr-only">Perfume no disponible</h1>
                <EmptyState
                    title="No pudimos cargar este perfume"
                    description="Revisa tu conexión e inténtalo de nuevo."
                    icon={<PackageOpen className="size-6" />}
                    action={
                        <Button variant="secondary" onClick={() => void refetch()}>
                            Reintentar
                        </Button>
                    }
                />
            </div>
        )
    }

    // A sold-out version is never selected; with every version sold out the first one is
    // shown and the button reads "Agotado".
    const chosenVariant = product.variants.find((variant) => variant.id === chosenVariantId)
    const selectedVariant =
        chosenVariant && !isVariantSoldOut(chosenVariant) ? chosenVariant : defaultVariant(product)
    const unitPrice = variantPrice(product, selectedVariant)
    const isVariablePrice = hasVariablePrice(product)
    const stockLeft = stockOf(product, selectedVariant)
    const variantId = selectedVariant?.id ?? ''
    const inCart = cartUnitsOf(cartItems, product.id, variantId)
    const addable = Math.max(0, stockLeft - inCart)
    const maxQuantity = Math.max(1, Math.min(addable, MAX_LINE_QUANTITY))
    const safeQuantity = Math.min(quantity, maxQuantity)
    const volumeMl = selectedVariant?.volumeMl ?? product.volumeMl
    const specParts = [
        formatPerfumeSpec(product.concentration, volumeMl ?? null, true) || null,
        GENDER_LABELS[product.gender] ? GENDER_LABELS[product.gender] : null,
    ].filter(Boolean)
    const whatsappMessage = `Hola, tengo una duda sobre ${product.name}${
        product.brand ? ` de ${product.brand.name}` : ''
    }${selectedVariant ? ` (${variantDisplayLabel(selectedVariant)})` : ''}.`

    return (
        <>
            <div className={cn(CONTAINER, pageClass)}>
                <div className="space-y-5 sm:space-y-6 lg:space-y-5">
                    <nav aria-label="Ruta de navegación" className="text-sm">
                        <ol className="flex flex-wrap items-center gap-x-1.5">
                            <li>
                                <Link to={ROUTES.home} className={breadcrumbLinkClass}>
                                    Inicio
                                </Link>
                            </li>
                            <li aria-hidden="true">
                                <ChevronRight className="size-3.5 text-fg-muted" />
                            </li>
                            <li>
                                <Link to={ROUTES.catalog} className={breadcrumbLinkClass}>
                                    Perfumes
                                </Link>
                            </li>
                            {category ? (
                                <>
                                    <li aria-hidden="true">
                                        <ChevronRight className="size-3.5 text-fg-muted" />
                                    </li>
                                    <li>
                                        <Link
                                            to={categoryPath(category.slug)}
                                            className={breadcrumbLinkClass}
                                        >
                                            {category.name}
                                        </Link>
                                    </li>
                                </>
                            ) : null}
                            <li aria-hidden="true" className="max-sm:hidden">
                                <ChevronRight className="size-3.5 text-fg-muted" />
                            </li>
                            <li
                                aria-current="page"
                                className="truncate font-semibold text-fg max-sm:hidden"
                            >
                                {product.name}
                            </li>
                        </ol>
                    </nav>

                    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] lg:gap-12 xl:gap-16">
                        <div className="lg:sticky lg:top-28 lg:self-start">
                            <ProductGallery product={product} />
                        </div>

                        <div className="space-y-7 lg:space-y-4">
                            <div className="space-y-3 lg:space-y-1.5">
                                {product.brand ? (
                                    <Link
                                        to={brandCatalogPath(product.brand.slug)}
                                        className="inline-flex min-h-8 items-center text-xs font-bold tracking-[0.24em] text-accent uppercase transition hover:text-accent"
                                    >
                                        {product.brand.name}
                                    </Link>
                                ) : null}

                                <h1 className="font-display text-[2.25rem] leading-[1.05] font-semibold text-balance text-fg sm:text-[2.75rem] lg:text-[clamp(1.75rem,2.1vw,2.5rem)]">
                                    {product.name}
                                </h1>

                                {specParts.length > 0 ? (
                                    <p className="text-[15px] text-fg-soft">
                                        {specParts.join(' · ')}
                                    </p>
                                ) : null}
                            </div>

                            <div className="space-y-3 border-y border-line py-5 lg:space-y-2 lg:py-3.5">
                                <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
                                    {/* Desktop: the stock state sits beside the price to save a row. */}
                                    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                                        <PriceTag
                                            price={unitPrice}
                                            compareAtPrice={product.compareAtPrice}
                                            size="lg"
                                        />
                                        <StockState stock={stockLeft} className="max-lg:hidden" />
                                    </div>
                                    <BsApproximation
                                        usd={unitPrice}
                                        className="text-left sm:text-right"
                                    />
                                </div>
                                {isVariablePrice && selectedVariant ? (
                                    <p className="text-xs text-fg-soft">
                                        Precio para {variantDisplayLabel(selectedVariant)}. Varía
                                        según el tamaño que elijas.
                                    </p>
                                ) : null}
                                <StockState stock={stockLeft} className="lg:hidden" />
                            </div>

                            <VariantPicker
                                variants={product.variants}
                                basePrice={product.price}
                                selectedVariantId={selectedVariant?.id}
                                onSelect={setChosenVariantId}
                            />

                            <div className="space-y-3">
                                <div ref={addRowRef} className="flex flex-wrap items-center gap-3">
                                    {stockLeft > 0 ? (
                                        <QuantityStepper
                                            value={safeQuantity}
                                            max={maxQuantity}
                                            disabled={addable === 0}
                                            onChange={setQuantity}
                                            className="h-13 lg:h-12"
                                        />
                                    ) : null}

                                    <AddToCartButton
                                        product={product}
                                        variantId={variantId}
                                        quantity={safeQuantity}
                                        size="lg"
                                        // Phones: the button takes the rest of the row.
                                        className="flex-1 basis-48 px-5 lg:h-12"
                                    />
                                </div>

                                {inCart > 0 && stockLeft > 0 ? (
                                    <p role="status" className="text-sm text-fg-soft">
                                        Ya tienes {inCart} en el carrito
                                        {addable === 0
                                            ? ': no quedan más unidades de este tamaño.'
                                            : ` · puedes agregar ${Math.min(addable, MAX_LINE_QUANTITY)} más.`}
                                    </p>
                                ) : null}
                            </div>

                            <ul className="space-y-2.5 rounded-card border border-line bg-surface p-4 text-sm text-fg-soft sm:p-5 lg:space-y-2 lg:px-5 lg:py-3.5">
                                <li className="flex items-start gap-3">
                                    <Truck
                                        aria-hidden="true"
                                        className="mt-0.5 size-4 shrink-0 text-accent"
                                    />
                                    <span>
                                        {shipping.freeShippingText} · {shipping.productionCopy}
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <ShieldCheck
                                        aria-hidden="true"
                                        className="mt-0.5 size-4 shrink-0 text-accent"
                                    />
                                    Fragancia 100% original y sellada
                                </li>
                                {contact.whatsapp ? (
                                    <li className="flex items-start gap-3">
                                        <SocialIcon
                                            network="WhatsApp"
                                            className="mt-0.5 size-4 shrink-0 text-whatsapp"
                                        />
                                        <span>
                                            ¿Dudas?{' '}
                                            <a
                                                href={whatsappUrl(
                                                    contact.whatsapp,
                                                    whatsappMessage,
                                                )}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="font-bold text-accent underline decoration-accent underline-offset-4 transition hover:decoration-accent"
                                            >
                                                Escríbenos por WhatsApp
                                            </a>
                                        </span>
                                    </li>
                                ) : null}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="grid gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-20">
                    <OlfactoryPyramid
                        notes={product.notes}
                        family={product.olfactoryFamily}
                        className="lg:self-start"
                    />
                    <ProductMeta product={product} />
                </div>

                <RelatedProducts slug={product.slug} />
            </div>

            {/* Outside the spaced container: `space-y` margins would lift the fixed bar. */}
            {stockLeft > 0 ? (
                <StickyAddToCartBar
                    anchorRef={addRowRef}
                    price={unitPrice}
                    compareAtPrice={product.compareAtPrice}
                    title={product.name}
                >
                    <AddToCartButton
                        product={product}
                        variantId={variantId}
                        quantity={safeQuantity}
                        label="Agregar"
                        className="px-4"
                    />
                </StickyAddToCartBar>
            ) : null}
        </>
    )
}
