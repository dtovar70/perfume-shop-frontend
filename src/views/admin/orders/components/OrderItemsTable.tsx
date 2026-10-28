import { Link } from 'react-router'

import type { AdminOrder } from '@/@types/order'
import { ProductThumbnail } from '@/components/shared/ProductThumbnail'
import { Card } from '@/components/ui'
import { adminProductPath } from '@/constants/route.constant'
import { formatBolivares, formatRate } from '@/utils/formatBolivares'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDay } from '@/utils/formatDate'
import { RATE_NAMES, RATE_UNITS } from '@/utils/rateCurrency'

/** The ordered lines as frozen at checkout, the totals and the rate used (dollar, euro, USDT). */
export function OrderItemsTable({ order }: { order: AdminOrder }) {
    const { totals } = order
    const currency = totals.exchangeRateCurrency ?? 'USD'
    return (
        <Card padding="md" className="space-y-4">
            <h2 className="font-display text-xl text-fg">Productos</h2>
            <ul className="divide-y divide-line">
                {order.items.map((item) => (
                    <li key={item.id} className="flex items-center gap-3 py-3">
                        <ProductThumbnail imageUrl={item.imageUrl} className="w-12" />
                        <div className="min-w-0 flex-1 text-sm">
                            {item.productId ? (
                                <Link
                                    to={adminProductPath(item.productId)}
                                    className="font-semibold break-words text-fg hover:text-accent"
                                >
                                    {item.productName}
                                </Link>
                            ) : (
                                <p className="font-semibold break-words text-fg">
                                    {item.productName}
                                </p>
                            )}
                            <p className="text-xs text-fg-soft">
                                {[
                                    item.variantLabel,
                                    `${item.quantity} × ${formatCurrency(item.unitPriceUsd)}`,
                                ]
                                    .filter(Boolean)
                                    .join(' · ')}
                            </p>
                        </div>
                        <span className="shrink-0 text-sm font-semibold text-fg">
                            {formatCurrency(item.lineTotalUsd)}
                        </span>
                    </li>
                ))}
            </ul>
            <dl className="space-y-2 border-t border-line pt-4 text-sm">
                <div className="flex justify-between gap-3">
                    <dt className="text-fg-soft">Subtotal</dt>
                    <dd className="font-semibold text-fg">{formatCurrency(totals.subtotalUsd)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                    <dt className="text-fg-soft">Envío</dt>
                    <dd className="font-semibold text-fg">
                        {totals.shippingUsd === 0 ? 'Gratis' : formatCurrency(totals.shippingUsd)}
                    </dd>
                </div>
                <div className="flex justify-between gap-3 border-t border-line pt-2">
                    <dt className="font-display text-base text-fg">Total</dt>
                    <dd className="text-right">
                        <span className="block font-display text-xl text-fg">
                            {formatCurrency(totals.totalUsd)}
                        </span>
                        <span className="font-semibold text-fg">
                            {formatBolivares(totals.totalBs)}
                        </span>
                    </dd>
                </div>
                <p className="text-xs text-fg-soft">
                    {/* "Tasa BCV (bcv.org.ve) del …" for dollar orders, as always. */}
                    {currency === 'USD'
                        ? `Tasa ${totals.exchangeRateSourceLabel}`
                        : `${RATE_NAMES[currency]} · ${totals.exchangeRateSourceLabel}`}{' '}
                    del {formatDay(totals.exchangeRateDate)}: {formatRate(totals.exchangeRate)}{' '}
                    {RATE_UNITS[currency]} (
                    {totals.exchangeRate.toLocaleString('es-VE', { maximumFractionDigits: 4 })})
                </p>
            </dl>
        </Card>
    )
}
