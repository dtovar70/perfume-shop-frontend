import { Mail, MessageCircle, Phone } from 'lucide-react'

import type { AdminOrder } from '@/@types/order'
import { Card } from '@/components/ui'
import { DELIVERY_METHOD_LABELS } from '@/constants/order.constant'
import { phoneHref, whatsappUrl } from '@/utils/content'

const linkClass =
    'inline-flex h-9 items-center gap-1.5 rounded-full border border-ink/10 bg-white px-3 text-sm font-semibold text-ink transition hover:border-ink/20'

/** Who ordered and where it goes, with one-tap contact links. */
export function OrderCustomerCard({ order }: { order: AdminOrder }) {
    const { customer } = order
    return (
        <Card padding="md" className="space-y-4">
            <h2 className="font-display text-xl text-ink">Cliente</h2>
            <div className="min-w-0 space-y-1 text-sm">
                <p className="font-semibold break-words text-ink">{customer.fullName}</p>
                <p className="break-all text-ink-soft">{customer.email}</p>
                <p className="text-ink-soft">{customer.phone}</p>
            </div>
            <div className="flex flex-wrap gap-2">
                <a
                    href={whatsappUrl(customer.phone)}
                    target="_blank"
                    rel="noreferrer"
                    className={linkClass}
                >
                    <MessageCircle aria-hidden="true" className="size-4" />
                    WhatsApp
                </a>
                <a href={phoneHref(customer.phone)} className={linkClass}>
                    <Phone aria-hidden="true" className="size-4" />
                    Llamar
                </a>
                <a
                    href={`mailto:${customer.email}?subject=Pedido ${order.code}`}
                    className={linkClass}
                >
                    <Mail aria-hidden="true" className="size-4" />
                    Correo
                </a>
            </div>
            <dl className="space-y-2 border-t border-line pt-4 text-sm">
                <div>
                    <dt className="text-xs text-ink-soft">Entrega</dt>
                    <dd className="font-semibold text-ink">
                        {DELIVERY_METHOD_LABELS[customer.deliveryMethod]}
                    </dd>
                </div>
                <div>
                    <dt className="text-xs text-ink-soft">Ciudad y dirección</dt>
                    <dd className="break-words text-ink">
                        {customer.city} · {customer.address}
                    </dd>
                </div>
                {customer.notes ? (
                    <div>
                        <dt className="text-xs text-ink-soft">Notas del cliente</dt>
                        <dd className="break-words whitespace-pre-line text-ink">
                            {customer.notes}
                        </dd>
                    </div>
                ) : null}
            </dl>
        </Card>
    )
}
