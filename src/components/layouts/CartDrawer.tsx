import { ShoppingBag, Trash2 } from 'lucide-react'
import { Link } from 'react-router'

import { CartLineMedia } from '@/components/shared/CartLineMedia'
import { CartLineStockNotice } from '@/components/shared/CartLineStockNotice'
import { CheckoutCta } from '@/components/shared/CheckoutCta'
import { ClearCartButton } from '@/components/shared/ClearCartButton'
import { FreeShippingProgress } from '@/components/shared/FreeShippingProgress'
import { ButtonLink, Drawer, QuantityStepper } from '@/components/ui'
import { productPath, ROUTES } from '@/constants/route.constant'
import {
    MAX_LINE_QUANTITY,
    useCartActions,
    useCartCount,
    useCartItems,
    useCartSubtotal,
} from '@/store/cartStore'
import { useCartDrawer } from '@/store/uiStore'
import { CART_STOCK_BLOCKED_MESSAGE } from '@/utils/cartAvailability'
import { formatCurrency } from '@/utils/formatCurrency'
import { useCartAvailability } from '@/utils/hooks/useCartAvailability'

export function CartDrawer() {
    const { isOpen, close } = useCartDrawer()
    const items = useCartItems()
    const count = useCartCount()
    const subtotal = useCartSubtotal()
    const { updateQuantity, removeItem } = useCartActions()
    const availability = useCartAvailability(items, isOpen)

    return (
        <Drawer
            isOpen={isOpen}
            onClose={close}
            title="Carrito de compras"
            size="sm"
            closeStyle="back"
            footer={
                items.length > 0 ? (
                    <div className="space-y-3">
                        <FreeShippingProgress subtotal={subtotal} />
                        {availability.hasIssues ? (
                            <p role="status" className="text-xs font-semibold text-rose-700">
                                {CART_STOCK_BLOCKED_MESSAGE}
                            </p>
                        ) : null}
                        <CheckoutCta
                            to={ROUTES.checkout}
                            label="Finalizar compra"
                            count={count}
                            total={subtotal}
                            disabled={availability.hasIssues}
                            onClick={close}
                        />
                        <Link
                            to={ROUTES.cart}
                            onClick={close}
                            className="flex min-h-11 items-center justify-center text-sm font-semibold text-ink-soft underline-offset-4 transition hover:text-rose-700 hover:underline"
                        >
                            Ver el carrito completo
                        </Link>
                    </div>
                ) : null
            }
        >
            {items.length === 0 ? (
                <div className="flex min-h-full flex-col items-center justify-center gap-4 py-10 text-center">
                    <span
                        aria-hidden="true"
                        className="gradient-blush flex size-20 items-center justify-center rounded-full text-rose-700 ring-1 ring-gold-200"
                    >
                        <ShoppingBag className="size-8" strokeWidth={1.4} />
                    </span>
                    <p className="font-display text-2xl font-semibold">Tu carrito está vacío</p>
                    <p className="max-w-xs text-sm text-ink-soft">
                        Agrega algunos perfumes para comenzar.
                    </p>
                    <ButtonLink to={ROUTES.catalog} onClick={close}>
                        Explorar perfumes
                    </ButtonLink>
                </div>
            ) : (
                <>
                    <div className="-mt-2 flex items-center justify-between gap-3">
                        <span className="text-sm text-ink-soft">
                            {count} {count === 1 ? 'artículo' : 'artículos'}
                        </span>
                        <ClearCartButton itemCount={items.length} className="-mr-2" />
                    </div>

                    <ul className="divide-y divide-line">
                        {items.map((item) => {
                            const stock = availability.lines.get(item.lineId)
                            const max = stock?.max ?? MAX_LINE_QUANTITY
                            return (
                                <li key={item.lineId} className="flex gap-3 py-4">
                                    <CartLineMedia item={item} size="sm" />

                                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                                        {item.brandName ? (
                                            <p className="truncate text-[10px] font-bold tracking-[0.2em] text-gold-700 uppercase">
                                                {item.brandName}
                                            </p>
                                        ) : null}
                                        <Link
                                            to={productPath(item.slug)}
                                            onClick={close}
                                            className="font-display text-lg leading-tight font-semibold text-ink transition hover:text-rose-700"
                                        >
                                            {item.name}
                                        </Link>
                                        <p className="text-xs text-ink-soft">{item.variantLabel}</p>

                                        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
                                            <QuantityStepper
                                                value={item.quantity}
                                                max={Math.max(max, 1)}
                                                disabled={max === 0 && item.quantity <= 1}
                                                onChange={(quantity) =>
                                                    updateQuantity(item.lineId, quantity, max)
                                                }
                                            />
                                            <span className="text-sm font-bold text-ink tabular-nums">
                                                {formatCurrency(item.unitPrice * item.quantity)}
                                            </span>
                                        </div>
                                        {stock?.issue ? (
                                            <CartLineStockNotice
                                                issue={stock.issue}
                                                onAdjust={(quantity) =>
                                                    updateQuantity(item.lineId, quantity)
                                                }
                                            />
                                        ) : null}
                                    </div>

                                    <button
                                        type="button"
                                        aria-label={`Quitar ${item.name} del carrito`}
                                        onClick={() => removeItem(item.lineId)}
                                        className="-mt-2 -mr-2 flex size-11 shrink-0 items-center justify-center self-start rounded-full text-ink-soft transition hover:bg-rose-50 hover:text-rose-700"
                                    >
                                        <Trash2 aria-hidden="true" className="size-4" />
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                </>
            )}
        </Drawer>
    )
}
