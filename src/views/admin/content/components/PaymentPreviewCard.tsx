import { Smartphone } from 'lucide-react'

import type { PaymentContent } from '@/@types/content'
import { cn } from '@/utils/cn'

export interface PaymentPreviewCardProps {
    payment: PaymentContent
}

/** How the customer will see the Pago Móvil details at checkout. */
export function PaymentPreviewCard({ payment }: PaymentPreviewCardProps) {
    const bank =
        payment.bankCode && payment.bankName ? `${payment.bankCode} - ${payment.bankName}` : ''
    const rows = [
        { label: 'Banco', value: bank },
        { label: 'Teléfono', value: payment.phone },
        { label: 'Cédula / RIF', value: payment.idNumber },
        { label: 'Titular', value: payment.holderName },
    ]

    return (
        <div className="space-y-1.5">
            <p className="text-xs font-semibold text-fg-soft">Así lo verá el cliente</p>
            <div className="space-y-4 rounded-card border border-line bg-canvas p-5 shadow-soft">
                <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-success/10 text-fg">
                        <Smartphone aria-hidden="true" className="size-5" />
                    </span>
                    <div className="min-w-0">
                        <p className="font-display text-lg text-fg">Pago Móvil</p>
                        <p className="text-xs text-fg-soft">
                            Paga el total y envíanos la referencia.
                        </p>
                    </div>
                </div>
                <dl className="grid grid-cols-1 gap-3 @md:grid-cols-2">
                    {rows.map((row) => (
                        <div key={row.label} className="min-w-0 rounded-2xl bg-surface px-4 py-2.5">
                            <dt className="text-xs text-fg-soft">{row.label}</dt>
                            <dd
                                className={cn(
                                    'font-semibold break-words',
                                    row.value ? 'text-fg' : 'text-fg-muted italic',
                                )}
                            >
                                {row.value || 'Sin completar'}
                            </dd>
                        </div>
                    ))}
                </dl>
                {payment.instructions ? (
                    <p className="text-sm break-words whitespace-pre-line text-fg-soft">
                        {payment.instructions}
                    </p>
                ) : null}
            </div>
        </div>
    )
}
