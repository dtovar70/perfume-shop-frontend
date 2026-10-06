import { Link } from 'react-router'

import type { AdminOrdersSummary } from '@/@types/order'
import { Alert } from '@/components/ui'
import { ADMIN_ROUTES } from '@/constants/route.constant'

const linkClass = 'font-semibold underline underline-offset-2 hover:text-rose-900'

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
                    La tienda no puede recibir pedidos: no hay una tasa BCV vigente. Revísala en{' '}
                    <Link to={ADMIN_ROUTES.exchangeRate} className={linkClass}>
                        Tasa BCV
                    </Link>
                    .
                </Alert>
            ) : null}
        </div>
    )
}
