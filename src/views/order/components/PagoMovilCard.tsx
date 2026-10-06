import { Smartphone } from 'lucide-react'

import type { PaymentContent } from '@/@types/content'
import type { PublicOrder } from '@/@types/order'
import { CopyButton } from '@/components/shared/CopyButton'
import { formatBolivares, formatRate, formatVeNumber } from '@/utils/formatBolivares'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDay } from '@/utils/formatDate'

interface Row {
    label: string
    display: string
    /** What the copy button puts on the clipboard (bank apps want plain digits). */
    copy: string
}

function rowsFor(pagoMovil: PaymentContent, totalBs: number): Row[] {
    return [
        {
            label: 'Banco',
            display: `${pagoMovil.bankCode} - ${pagoMovil.bankName}`,
            copy: pagoMovil.bankCode,
        },
        { label: 'Teléfono', display: pagoMovil.phone, copy: pagoMovil.phone.replace(/\D/g, '') },
        {
            label: 'Cédula / RIF',
            display: pagoMovil.idNumber,
            copy: pagoMovil.idNumber.replace(/[^\dA-Z]/gi, ''),
        },
        { label: 'Titular', display: pagoMovil.holderName, copy: pagoMovil.holderName },
        { label: 'Monto exacto', display: formatBolivares(totalBs), copy: formatVeNumber(totalBs) },
    ]
}

export interface PagoMovilCardProps {
    order: PublicOrder
    pagoMovil: PaymentContent
}

/** Where and how much to pay, each value one tap away from the clipboard. */
export function PagoMovilCard({ order, pagoMovil }: PagoMovilCardProps) {
    const { totals } = order
    const rows = rowsFor(pagoMovil, totals.totalBs)
    const everything = [
        'Pago Móvil',
        ...rows.map((row) => `${row.label}: ${row.display}`),
        `Concepto: Pedido ${order.code}`,
    ].join('\n')

    return (
        <div className="@container space-y-4 rounded-card border border-line bg-canvas p-5 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-success/10 text-fg">
                        <Smartphone aria-hidden="true" className="size-5" />
                    </span>
                    <p className="font-display text-lg text-fg">Pago Móvil</p>
                </div>
                <CopyButton value={everything} label="Copiar todos los datos">
                    Copiar todo
                </CopyButton>
            </div>

            <dl className="grid grid-cols-1 gap-2.5 @md:grid-cols-2">
                {rows.map((row) => {
                    const isAmount = row.label === 'Monto exacto'
                    return (
                        <div
                            key={row.label}
                            className={
                                isAmount
                                    ? 'flex min-w-0 items-center gap-2 rounded-2xl border border-accent/60 bg-surface px-4 py-3 @md:col-span-2'
                                    : 'flex min-w-0 items-center gap-2 rounded-2xl bg-surface px-4 py-2.5'
                            }
                        >
                            <div className="min-w-0 flex-1">
                                <dt className="text-xs text-fg-soft">{row.label}</dt>
                                <dd
                                    className={
                                        isAmount
                                            ? 'font-display text-2xl break-words text-fg'
                                            : 'font-semibold break-words text-fg'
                                    }
                                >
                                    {row.display}
                                </dd>
                            </div>
                            <CopyButton
                                value={row.copy}
                                label={`Copiar ${row.label.toLowerCase()}`}
                            />
                        </div>
                    )
                })}
            </dl>

            <p className="text-xs text-fg-soft">
                Total {formatCurrency(totals.totalUsd)} · Tasa BCV del{' '}
                {formatDay(totals.exchangeRateDate)}: {formatRate(totals.exchangeRate)} Bs/$. El
                monto en bolívares se mantiene durante todo el plazo de pago.
            </p>
            {pagoMovil.instructions ? (
                <p className="text-sm break-words whitespace-pre-line text-fg-soft">
                    {pagoMovil.instructions}
                </p>
            ) : null}
        </div>
    )
}
