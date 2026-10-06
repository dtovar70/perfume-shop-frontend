import {
    CircleCheck,
    CircleX,
    Clock,
    Hammer,
    PackageCheck,
    PartyPopper,
    SearchCheck,
    Truck,
    Wallet,
    type LucideIcon,
} from 'lucide-react'

import type { OrderStatus, PublicOrder } from '@/@types/order'
import { cn } from '@/utils/cn'
import { useOrderStatusCatalog } from '@/utils/hooks/useOrderStatusCatalog'
import { useFillPlaceholders } from '@/utils/hooks/useSiteContent'

type MessageTone = 'butter' | 'sky' | 'mint' | 'blush' | 'neutral'

const TONE_CLASS: Record<MessageTone, string> = {
    butter: 'border-gold-400/70 bg-gold-100/40',
    sky: 'border-gold-300 bg-gold-50',
    mint: 'border-emerald-500/60 bg-emerald-100/40',
    blush: 'border-rose-300 bg-rose-50',
    neutral: 'border-line bg-white',
}

/**
 * Icon and box color of each status's message. The texts come from the status catalog
 * (`customerTitle` / `customerDescription`, edited in the admin); these stay here because they
 * are part of the page's design, not wording.
 */
const MESSAGE_STYLE: Record<OrderStatus, { icon: LucideIcon; tone: MessageTone }> = {
    PENDIENTE_PAGO: { icon: Wallet, tone: 'butter' },
    PENDIENTE_VERIFICACION: { icon: SearchCheck, tone: 'sky' },
    PAGO_RECHAZADO: { icon: CircleX, tone: 'blush' },
    PAGO_VERIFICADO: { icon: CircleCheck, tone: 'mint' },
    EN_PRODUCCION: { icon: Hammer, tone: 'mint' },
    LISTO_PARA_ENTREGA: { icon: PackageCheck, tone: 'mint' },
    ENVIADO: { icon: Truck, tone: 'sky' },
    ENTREGADO: { icon: PartyPopper, tone: 'mint' },
    CANCELADO: { icon: CircleX, tone: 'neutral' },
    EXPIRADO: { icon: Clock, tone: 'butter' },
}

/**
 * Store pickup changes what "ready" means, so that one message depends on the delivery
 * method rather than on the catalog.
 */
const PICKUP_READY = {
    title: '¡Tu pedido está listo para retirar!',
    body: 'Ya puedes pasar por el taller a buscarlo.',
}

/** Statuses whose latest history note (shipping details, cancellation reason) replaces the body. */
const NOTE_STATUSES: readonly OrderStatus[] = ['ENVIADO', 'CANCELADO']

function lastNote(order: PublicOrder, status: OrderStatus): string | null {
    return order.history.filter((entry) => entry.status === status).at(-1)?.note ?? null
}

export interface StatusMessageProps {
    order: PublicOrder
    /** The payment deadline passed (or the order expired) but a proof can still be sent. */
    late?: boolean
}

/** Friendly explanation of where the order stands and what happens next. */
export function StatusMessage({ order, late = false }: StatusMessageProps) {
    const catalog = useOrderStatusCatalog()
    const fill = useFillPlaceholders()

    // A late payment reads like an expired order: the proof is still welcome.
    const status: OrderStatus = late ? 'EXPIRADO' : order.status
    const info = catalog.status(status)
    const { icon: Icon, tone } = MESSAGE_STYLE[status]
    const isPickupReady =
        status === 'LISTO_PARA_ENTREGA' && order.customer.deliveryMethod === 'pickup'
    const note = !late && NOTE_STATUSES.includes(status) ? lastNote(order, status) : null

    const title = isPickupReady ? PICKUP_READY.title : (info.customerTitle ?? info.customerLabel)
    const body = isPickupReady
        ? PICKUP_READY.body
        : (note ?? (info.customerDescription ? fill(info.customerDescription) : null))

    return (
        <div
            role="status"
            className={cn('flex items-start gap-4 rounded-card border p-5', TONE_CLASS[tone])}
        >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-ink shadow-soft">
                <Icon aria-hidden="true" className="size-5" />
            </span>
            <div className="min-w-0 space-y-1">
                <p className="font-display text-lg text-ink">{title}</p>
                {body ? <p className="text-sm break-words text-ink-soft">{body}</p> : null}
            </div>
        </div>
    )
}
