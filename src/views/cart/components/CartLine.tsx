import { Trash2 } from 'lucide-react'
import { Link } from 'react-router'

import type { CartItem } from '@/@types/cart'
import { CartLineMedia } from '@/components/shared/CartLineMedia'
import { CartLineStockNotice } from '@/components/shared/CartLineStockNotice'
import { QuantityStepper } from '@/components/ui'
import { productPath } from '@/constants/route.constant'
import { MAX_LINE_QUANTITY, useCartActions } from '@/store/cartStore'
import type { LineStock } from '@/utils/cartAvailability'
import { formatCurrency } from '@/utils/formatCurrency'

export interface CartLineProps {
    item: CartItem
    /** Live cap and stock problem of the line; unknown (no cap but the line limit) when absent. */
    stock?: LineStock
}

export function CartLine({ item, stock }: CartLineProps) {
    const { updateQuantity, removeItem } = useCartActions()
    const max = stock?.max ?? MAX_LINE_QUANTITY

    return (
        <li className="flex gap-4 py-5 sm:items-center sm:gap-5">
            <CartLineMedia item={item} size="sm" className="w-20 sm:w-24" />

            <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1 space-y-0.5">
                    {item.brandName ? (
                        <p className="truncate text-[10px] font-bold tracking-[0.2em] text-accent uppercase">
                            {item.brandName}
                        </p>
                    ) : null}
                    <h2 className="font-display text-xl leading-tight font-semibold text-fg">
                        <Link to={productPath(item.slug)} className="rounded-sm hover:text-accent">
                            {item.name}
                        </Link>
                    </h2>
                    <p className="text-sm text-fg-soft">
                        {item.variantLabel} · {formatCurrency(item.unitPrice)} c/u
                    </p>
                    {stock?.issue ? (
                        <CartLineStockNotice
                            issue={stock.issue}
                            onAdjust={(quantity) => updateQuantity(item.lineId, quantity)}
                            className="pt-1"
                        />
                    ) : null}
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-5">
                    <QuantityStepper
                        value={item.quantity}
                        max={Math.max(max, 1)}
                        disabled={max === 0 && item.quantity <= 1}
                        onChange={(quantity) => updateQuantity(item.lineId, quantity, max)}
                    />

                    <p className="text-right font-bold text-fg tabular-nums sm:w-24">
                        {formatCurrency(item.unitPrice * item.quantity)}
                    </p>

                    <button
                        type="button"
                        aria-label={`Quitar ${item.name} del carrito`}
                        onClick={() => removeItem(item.lineId)}
                        className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-full text-fg-soft transition hover:bg-elevated hover:text-accent"
                    >
                        <Trash2 aria-hidden="true" className="size-4" />
                    </button>
                </div>
            </div>
        </li>
    )
}
