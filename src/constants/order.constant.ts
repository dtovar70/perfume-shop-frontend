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

/** While a proof is being checked the order page refreshes itself this often. */
export const ORDER_POLL_MS = 25_000
/** The admin nav badge of orders waiting for verification refreshes this often. */
export const ADMIN_ORDERS_POLL_MS = 30_000
