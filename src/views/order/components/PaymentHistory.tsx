import type { OrderPayment, PaymentStatus } from '@/@types/order'
import { Badge, type BadgeProps } from '@/components/ui'
import { formatBolivares } from '@/utils/formatBolivares'
import { formatDateTime, formatDay } from '@/utils/formatDate'

const PAYMENT_LABELS: Record<PaymentStatus, { label: string; tone: BadgeProps['tone'] }> = {
    PENDIENTE: { label: 'En revisión', tone: 'sky' },
    VERIFICADO: { label: 'Confirmado', tone: 'mint' },
    RECHAZADO: { label: 'Rechazado', tone: 'blush' },
}

/** Every proof the customer sent for this order, newest first. */
export function PaymentHistory({ payments }: { payments: OrderPayment[] }) {
    if (payments.length === 0) return null
    return (
        <section className="space-y-3" aria-labelledby="payments-title">
            <h2 id="payments-title" className="font-display text-xl text-ink">
                Pagos enviados
            </h2>
            <ul className="space-y-2">
                {payments.map((payment) => {
                    const status = PAYMENT_LABELS[payment.status]
                    return (
                        <li
                            key={payment.id}
                            className="space-y-1 rounded-2xl border border-line bg-white px-4 py-3 text-sm"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="font-semibold break-all text-ink">
                                    Ref. {payment.reference}
                                </span>
                                <Badge tone={status.tone} size="sm">
                                    {status.label}
                                </Badge>
                            </div>
                            <p className="text-ink-soft">
                                {formatBolivares(payment.amountBs)} · {payment.payerBankName} ·
                                pagado el {formatDay(payment.paidOn)}
                            </p>
                            <p className="text-xs text-ink-soft">
                                Enviado el {formatDateTime(payment.createdAt)}
                                {payment.hasProof ? ' · con captura' : ''}
                            </p>
                            {payment.rejectionReason ? (
                                <p className="text-sm font-medium break-words text-rose-700">
                                    Motivo: {payment.rejectionReason}
                                </p>
                            ) : null}
                        </li>
                    )
                })}
            </ul>
        </section>
    )
}
