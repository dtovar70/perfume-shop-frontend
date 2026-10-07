import { ShoppingBag } from 'lucide-react'

import { ClearCartButton } from '@/components/shared/ClearCartButton'
import { EmptyState } from '@/components/shared/EmptyState'
import { BsApproximation } from '@/components/shared/BsApproximation'
import { CartWhatsAppButton } from '@/components/shared/CartWhatsAppButton'
import { FreeShippingProgress } from '@/components/shared/FreeShippingProgress'
import { Button, ButtonLink, Card } from '@/components/ui'
import { CONTAINER } from '@/constants/layout.constant'
import { ROUTES } from '@/constants/route.constant'
import { useCartItems, useCartSubtotal } from '@/store/cartStore'
import { CART_STOCK_BLOCKED_MESSAGE } from '@/utils/cartAvailability'
import { cn } from '@/utils/cn'
import { shippingCost } from '@/utils/content'
import { formatCurrency } from '@/utils/formatCurrency'
import { useCartAvailability } from '@/utils/hooks/useCartAvailability'
import { useSiteContent } from '@/utils/hooks/useSiteContent'
import { CartLine } from '@/views/cart/components/CartLine'

export function CartView() {
    const items = useCartItems()
    const subtotal = useCartSubtotal()
    const content = useSiteContent()
    const availability = useCartAvailability(items)
    const shipping = shippingCost(subtotal, content.shipping)
    const total = subtotal + shipping

    return (
        <div className={cn(CONTAINER, 'space-y-8 py-10 lg:py-14')}>
            <header className="space-y-2">
                <p className="text-[11px] font-bold tracking-[0.28em] text-accent uppercase sm:text-xs">
                    Tu selección
                </p>
                <h1 className="font-display text-[2.4rem] leading-none font-semibold text-fg sm:text-5xl">
                    Carrito de <span className="text-accent">compras</span>
                </h1>
            </header>

            {items.length === 0 ? (
                <EmptyState
                    title="Tu carrito está vacío"
                    description="Agrega algunos perfumes para comenzar."
                    icon={<ShoppingBag className="size-6" />}
                    action={<ButtonLink to={ROUTES.catalog}>Explorar perfumes</ButtonLink>}
                />
            ) : (
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3 px-1">
                            <span className="text-sm text-fg-soft">
                                {items.length} {items.length === 1 ? 'producto' : 'productos'} en tu
                                carrito
                            </span>
                            <ClearCartButton itemCount={items.length} />
                        </div>

                        <Card padding="none" className="px-4 sm:px-6">
                            <ul className="divide-y divide-line">
                                {items.map((item) => (
                                    <CartLine
                                        key={item.lineId}
                                        item={item}
                                        stock={availability.lines.get(item.lineId)}
                                    />
                                ))}
                            </ul>
                        </Card>
                    </div>

                    <Card
                        tone="elevated"
                        padding="lg"
                        className="h-fit space-y-5 lg:sticky lg:top-28"
                        aria-label="Resumen del pedido"
                    >
                        <h2 className="font-display text-2xl font-semibold text-fg">Resumen</h2>

                        <FreeShippingProgress subtotal={subtotal} />

                        <dl className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <dt className="text-fg-soft">Subtotal</dt>
                                <dd className="font-semibold text-fg">
                                    {formatCurrency(subtotal)}
                                </dd>
                            </div>
                            <div className="flex items-center justify-between">
                                <dt className="text-fg-soft">Envío</dt>
                                <dd className="font-semibold text-fg">
                                    {shipping === 0 ? 'Gratis' : formatCurrency(shipping)}
                                </dd>
                            </div>
                            <div className="flex items-baseline justify-between border-t border-line pt-3">
                                <dt className="font-bold text-fg">Total</dt>
                                <dd className="text-2xl font-bold text-fg tabular-nums">
                                    {formatCurrency(total)}
                                </dd>
                            </div>
                        </dl>
                        <BsApproximation usd={total} />

                        <div className="grid gap-2">
                            {availability.hasIssues ? (
                                <>
                                    <p role="status" className="text-sm font-semibold text-accent">
                                        {CART_STOCK_BLOCKED_MESSAGE}
                                    </p>
                                    <Button fullWidth size="lg" disabled>
                                        Finalizar compra
                                    </Button>
                                </>
                            ) : (
                                <ButtonLink to={ROUTES.checkout} fullWidth size="lg">
                                    Finalizar compra
                                </ButtonLink>
                            )}
                            <CartWhatsAppButton />
                            <ButtonLink to={ROUTES.catalog} variant="ghost" fullWidth>
                                Seguir comprando
                            </ButtonLink>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
