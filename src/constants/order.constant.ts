import type { OrderStatus } from '@/@types/order'

/** The happy path the customer's timeline shows, in order. */
export const ORDER_PROGRESS: readonly OrderStatus[] = [
    'PENDIENTE_PAGO',
    'PENDIENTE_VERIFICACION',
    'PAGO_VERIFICADO',
    'EN_PRODUCCION',
    'LISTO_PARA_ENTREGA',
    'ENVIADO',
    'ENTREGADO',
]

export const DELIVERY_METHOD_LABELS = {
    delivery: 'Envío a domicilio',
    pickup: 'Retiro en tienda',
} as const

/**
 * While a proof is being checked the order page refreshes itself this often. Only a fallback:
 * changes arrive at once over the order's live stream (`useOrderEvents`).
 */
export const ORDER_POLL_MS = 120_000
/**
 * The admin order list and nav badge refresh this often. Only a fallback: new orders and
 * payments arrive at once over the admin live stream (`AdminLiveUpdates`).
 */
export const ADMIN_ORDERS_POLL_MS = 120_000
