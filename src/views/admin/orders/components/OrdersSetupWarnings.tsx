import { Link } from 'react-router'

import type { AdminOrdersSummary } from '@/@types/order'
import { Alert } from '@/components/ui'
import { ADMIN_ROUTES } from '@/constants/route.constant'
import { RATE_CURRENCY_LABELS } from '@/utils/rateCurrency'

const linkClass = 'font-semibold underline underline-offset-2 hover:text-accent-strong'

/** What keeps the store from taking orders right now, with a link to fix it. */
export function OrdersSetupWarnings({ summary }: { summary: AdminOrdersSummary | undefined }) {
    if (!summary) return null
    return (
        <div className="mb-6 space-y-3">
            {!summary.paymentConfigured ? (
                <Alert>
                    La tienda no puede recibir pedidos: faltan los datos de Pago Móvil. Complétalos
                    en{' '}
                    <Link to={`${ADMIN_ROUTES.content}?seccion=payment`} className={linkClass}>
                        Contenido → Pago Móvil
                    </Link>
                    .
                </Alert>
            ) : null}
            {!summary.exchangeRate.available ? (
                <Alert>
                    La tienda no puede recibir pedidos: no hay una tasa{' '}
                    {RATE_CURRENCY_LABELS[summary.exchangeRate.currency ?? 'USD']} vigente. Revísala
                    en{' '}
                    <Link to={ADMIN_ROUTES.exchangeRate} className={linkClass}>
                        Tasa de cambio
                    </Link>
                    .
                </Alert>
            ) : null}
        </div>
    )
}
