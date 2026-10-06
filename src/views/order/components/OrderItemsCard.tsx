import type { OrderStatus, PublicOrder } from '@/@types/order'
import { ProductThumbnail } from '@/components/shared/ProductThumbnail'
import { WhatsAppInlineLink } from '@/components/shared/WhatsAppInlineLink'
import { Card } from '@/components/ui'
import { DELIVERY_METHOD_LABELS } from '@/constants/order.constant'
import { formatBolivares } from '@/utils/formatBolivares'
import { formatCurrency } from '@/utils/formatCurrency'

/** Past these the order is on its way (or closed): no more delivery notes. */
const FINISHED: readonly OrderStatus[] = ['ENVIADO', 'ENTREGADO', 'CANCELADO', 'EXPIRADO']

/** What was ordered, as frozen when the order was placed, and the totals. */
export function OrderItemsCard({ order }: { order: PublicOrder }) {
    const { totals } = order
    return (
        <Card tone="elevated" padding="lg" className="space-y-5">
            <h2 className="font-display text-2xl font-semibold text-fg">Tu pedido</h2>
            <ul className="space-y-3">
                {order.items.map((item, index) => (
                    <li key={`${item.productSlug}-${index}`} className="flex items-center gap-3">
                        <ProductThumbnail imageUrl={item.imageUrl} className="w-12" />
                        <div className="min-w-0 flex-1">
                            <p className="font-display text-base leading-snug font-semibold break-words text-fg">
                                {item.productName}
                            </p>
                            <p className="text-xs text-fg-soft">
                                {[item.variantLabel, `${item.quantity} u.`]
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
                <div className="flex items-center justify-between gap-3">
                    <dt className="text-fg-soft">Subtotal</dt>
                    <dd className="font-semibold text-fg">{formatCurrency(totals.subtotalUsd)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                    <dt className="text-fg-soft">
                        {DELIVERY_METHOD_LABELS[order.customer.deliveryMethod]}
                    </dt>
                    <dd className="font-semibold text-fg">
                        {totals.shippingUsd === 0 ? 'Gratis' : formatCurrency(totals.shippingUsd)}
                    </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 border-t border-line pt-3">
                    <dt className="font-bold text-fg">Total</dt>
                    <dd className="text-right">
                        <span className="block text-2xl font-bold text-fg tabular-nums">
                            {formatCurrency(totals.totalUsd)}
                        </span>
                        <span className="text-sm font-semibold text-fg-soft">
                            {formatBolivares(totals.totalBs)}
                        </span>
                    </dd>
                </div>
            </dl>
            {FINISHED.includes(order.status) ? null : (
                <p className="border-t border-line pt-4 text-sm text-fg-soft">
                    ¿Tienes alguna duda o un detalle sobre la entrega?{' '}
                    <WhatsAppInlineLink
                        message={`Hola, tengo una consulta sobre mi pedido ${order.code}.`}
                    >
                        Escríbenos por WhatsApp
                    </WhatsAppInlineLink>{' '}
                    con tu código {order.code}.
                </p>
            )}
        </Card>
    )
}
