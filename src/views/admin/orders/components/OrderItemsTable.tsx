import { Link } from 'react-router'

import type { AdminOrder } from '@/@types/order'
import { Card } from '@/components/ui'
import { adminProductPath } from '@/constants/route.constant'
import { formatBolivares, formatRate } from '@/utils/formatBolivares'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDay } from '@/utils/formatDate'

/** The ordered lines as frozen at checkout, the totals and the BCV rate used. */
export function OrderItemsTable({ order }: { order: AdminOrder }) {
    const { totals } = order
    return (
        <Card padding="md" className="space-y-4">
            <h2 className="font-display text-xl text-ink">Productos</h2>
            <ul className="divide-y divide-line">
                {order.items.map((item) => (
                    <li key={item.id} className="flex items-center gap-3 py-3">
                        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-rose-50">
                            {item.imageUrl ? (
                                <img
                                    src={item.imageUrl}
                                    alt=""
                                    className="size-full object-cover"
                                    loading="lazy"
                                />
                            ) : (
                                <span
                                    aria-hidden="true"
                                    className="font-display text-lg text-rose-400"
                                >
                                    {item.productName.charAt(0)}
                                </span>
                            )}
                        </div>
                        <div className="min-w-0 flex-1 text-sm">
                            {item.productId ? (
                                <Link
                                    to={adminProductPath(item.productId)}
                                    className="font-semibold break-words text-ink hover:text-rose-700"
                                >
                                    {item.productName}
                                </Link>
                            ) : (
                                <p className="font-semibold break-words text-ink">
                                    {item.productName}
                                </p>
                            )}
                            <p className="text-xs text-ink-soft">
                                {[
                                    item.variantLabel,
                                    `${item.quantity} × ${formatCurrency(item.unitPriceUsd)}`,
                                ]
                                    .filter(Boolean)
                                    .join(' · ')}
                            </p>
                        </div>
                        <span className="shrink-0 text-sm font-semibold text-ink">
                            {formatCurrency(item.lineTotalUsd)}
                        </span>
                    </li>
                ))}
            </ul>
            <dl className="space-y-2 border-t border-line pt-4 text-sm">
                <div className="flex justify-between gap-3">
                    <dt className="text-ink-soft">Subtotal</dt>
                    <dd className="font-semibold text-ink">{formatCurrency(totals.subtotalUsd)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                    <dt className="text-ink-soft">Envío</dt>
                    <dd className="font-semibold text-ink">
                        {totals.shippingUsd === 0 ? 'Gratis' : formatCurrency(totals.shippingUsd)}
                    </dd>
                </div>
                <div className="flex justify-between gap-3 border-t border-line pt-2">
                    <dt className="font-display text-base text-ink">Total</dt>
                    <dd className="text-right">
                        <span className="block font-display text-xl text-ink">
                            {formatCurrency(totals.totalUsd)}
                        </span>
                        <span className="font-semibold text-ink">
                            {formatBolivares(totals.totalBs)}
                        </span>
                    </dd>
                </div>
                <p className="text-xs text-ink-soft">
                    Tasa {totals.exchangeRateSourceLabel} del {formatDay(totals.exchangeRateDate)}:{' '}
                    {formatRate(totals.exchangeRate)} Bs/$ (
                    {totals.exchangeRate.toLocaleString('es-VE', { maximumFractionDigits: 4 })})
                </p>
            </dl>
        </Card>
    )
}
