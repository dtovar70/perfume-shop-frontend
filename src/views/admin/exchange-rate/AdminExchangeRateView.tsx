import { useState, type ClipboardEvent, type FormEvent } from 'react'
import { Landmark, RefreshCw } from 'lucide-react'

import type {
    AdminCurrencyRates,
    AdminExchangeRate,
    CurrentExchangeRate,
    ExchangeRateEntry,
    RateCurrency,
    RateSyncResult,
} from '@/@types/exchange-rate'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { Alert, Badge, Button, Card, Input, Skeleton } from '@/components/ui'
import { Tabs } from '@/components/ui/Tabs'
import { DatePicker } from '@/components/ui/DatePicker'
import { FIELD_LABEL_CLASS } from '@/components/ui/field.styles'
import { NOTICE_DISMISS_MS } from '@/constants/ui.constant'
import { getErrorMessage, isApiError } from '@/services/errors'
import { cn } from '@/utils/cn'
import { formatRate } from '@/utils/formatBolivares'
import { formatDateTime, formatDay, todayInCaracas } from '@/utils/formatDate'
import { RATE_CURRENCIES, RATE_CURRENCY_LABELS, RATE_UNITS } from '@/utils/rateCurrency'
import { AdminPageHeader } from '@/views/admin/components/AdminPageHeader'
import {
    useAdminExchangeRate,
    useRefreshRate,
    useSetActiveCurrency,
    useSetManualRate,
} from '@/views/admin/hooks/useAdminExchangeRate'
import { useSession } from '@/views/admin/hooks/useSession'

/**
 * The BCV publishes each rate with the next business day as its "fecha valor" (on a Friday,
 * Monday's), so a manual rate may carry a date a few days ahead of today.
 */
const VALUE_DATE_LOOKAHEAD_DAYS = 7

function latestValueDate(): string {
    const date = new Date(`${todayInCaracas()}T00:00:00Z`)
    date.setUTCDate(date.getUTCDate() + VALUE_DATE_LOOKAHEAD_DAYS)
    return date.toISOString().slice(0, 10)
}

/** Ends a sentence without doubling the period of "12:00 a. m.". */
function withPeriod(text: string): string {
    return text.endsWith('.') ? text : `${text}.`
}

const headerCellClass = 'px-4 py-3 text-left text-xs font-bold tracking-wide text-fg-soft uppercase'
const cellClass = 'px-4 py-3 align-middle'

/** What each choice is, under its name. */
const CURRENCY_HINTS: Record<RateCurrency, string> = {
    USD: 'Tasa oficial del dólar publicada por el BCV.',
    EUR: 'Tasa oficial del euro publicada por el BCV.',
    USDT: 'Se actualiza cada pocos minutos. Es una referencia del mercado P2P, no una tasa oficial.',
}

/** The manual form's labels for each currency. */
const MANUAL_FIELD: Record<RateCurrency, { label: string; hint: string }> = {
    USD: { label: 'Precio del dólar en bolívares', hint: 'Cuántos Bs cuesta 1$ según el BCV.' },
    EUR: { label: 'Precio del euro en bolívares', hint: 'Cuántos Bs cuesta 1€ según el BCV.' },
    USDT: {
        label: 'Precio del USDT en bolívares',
        hint: 'Cuántos Bs cuesta 1 USDT en Binance P2P.',
    },
}

/** "Fecha valor 24/09/2026" for BCV rates; USDT changes intraday, so when it was read. */
function rateDateText(rate: ExchangeRateEntry): string {
    return rate.currency === 'USDT' && !rate.isManual
        ? `Obtenida el ${formatDateTime(rate.fetchedAt)}`
        : `Fecha valor ${formatDay(rate.effectiveDate)}`
}

function rateValueText(currency: RateCurrency, rate: number, effectiveDate?: string): string {
    const value = `${formatRate(rate)} ${RATE_UNITS[currency]}`
    return effectiveDate && currency !== 'USDT' ? `${value} del ${formatDay(effectiveDate)}` : value
}

/** One sentence per currency: stored, unchanged or which sources failed. */
function syncMessage(sync: RateSyncResult): { tone: 'success' | 'error' | 'info'; text: string } {
    const lines = RATE_CURRENCIES.flatMap((currency) => {
        const result = sync.currencies[currency]
        if (!result) return []
        const label = RATE_CURRENCY_LABELS[currency]
        if (result.outcome === 'failed') {
            const errors = sync.attempts
                .filter((attempt) => attempt.currency === currency && !attempt.ok)
                .map((attempt) => `${attempt.source} (${attempt.error ?? 'error'})`)
            return [
                `${label}: ninguna fuente respondió${errors.length ? `: ${errors.join(', ')}` : ''}.`,
            ]
        }
        const rate = result.rate ? rateValueText(currency, result.rate, result.effectiveDate) : ''
        return [
            result.outcome === 'stored'
                ? `${label}: nueva tasa guardada, ${rate}.`
                : `${label}: no cambió (${rate}).`,
        ]
    })
    const tone =
        sync.outcome === 'failed'
            ? 'error'
            : Object.values(sync.currencies).some((result) => result.outcome === 'failed')
              ? 'info'
              : sync.outcome === 'stored'
                ? 'success'
                : 'info'
    return { tone, text: lines.join(' ') }
}

/** "cada 2 h" / "cada 10 min". */
function everyText(minutes: number): string {
    return minutes >= 60 ? `cada ${Math.round(minutes / 60)} h` : `cada ${Math.round(minutes)} min`
}

function syncInfo(data: AdminExchangeRate): string {
    const bcv = data.syncs.find((sync) => sync.group === 'bcv')
    const binance = data.syncs.find((sync) => sync.group === 'binance')
    const parts: string[] = []
    if (bcv) {
        parts.push(
            `El dólar y el euro BCV se consultan solos ${everyText(bcv.intervalMinutes)} (primero bcv.org.ve y, si no responde, DolarApi).`,
        )
    }
    if (binance) {
        parts.push(`El USDT se consulta ${everyText(binance.intervalMinutes)} en Binance P2P.`)
    }
    const last = data.syncs
        .map((sync) => sync.lastSync?.at)
        .filter((at): at is string => Boolean(at))
        .sort()
        .at(-1)
    if (last) parts.push(`Última consulta: ${withPeriod(formatDateTime(last))}`)
    return parts.join(' ')
}

/*
 * The manual rate mirrors the API's `ManualRateDto`: more than 0, at most 100.000.000 (the
 * providers' MAX_PLAUSIBLE_RATE) and 4 decimals. The field takes digits and one decimal comma.
 */
const RATE_MAX = 100_000_000
const RATE_MAX_INTEGER_DIGITS = 9
const RATE_MAX_DECIMALS = 4
/** "100000000,0000" */
const RATE_MAX_LENGTH = RATE_MAX_INTEGER_DIGITS + 1 + RATE_MAX_DECIMALS

/** Rates the way the field takes them: no thousands separator, comma, 4 decimals. */
const rateFieldFormatter = new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: RATE_MAX_DECIMALS,
    maximumFractionDigits: RATE_MAX_DECIMALS,
    useGrouping: false,
})

/**
 * Keeps what a rate can hold while typing: digits and one decimal comma (a dot becomes the
 * comma), up to 9 integer digits and 4 decimals. Anything else is dropped. "85x7.0" -> "857,0"
 */
function sanitizeRateInput(value: string): string {
    const [integer = '', ...rest] = value
        .replace(/\./g, ',')
        .replace(/[^\d,]/g, '')
        .split(',')
    const head = integer.slice(0, RATE_MAX_INTEGER_DIGITS)
    return rest.length ? `${head},${rest.join('').slice(0, RATE_MAX_DECIMALS)}` : head
}

/**
 * A pasted rate may come formatted: "857.0058", "Bs 1.234,56", "1,234.56". With both marks the
 * last one is the decimal; a mark repeated alone is a thousands separator.
 */
function normalizePastedRate(text: string): string {
    const kept = text.replace(/[^\d.,]/g, '')
    const lastMark = Math.max(kept.lastIndexOf('.'), kept.lastIndexOf(','))
    if (lastMark === -1) return kept
    const mark = kept.charAt(lastMark)
    const hasBoth = kept.includes('.') && kept.includes(',')
    const repeated = kept.split(mark).length > 2
    if (!hasBoth && repeated) return kept.replace(/[.,]/g, '')
    return `${kept.slice(0, lastMark).replace(/[.,]/g, '')},${kept.slice(lastMark + 1)}`
}

/** "857,0058" -> 857.0058 (the field only ever holds digits and one comma). */
function parseRate(value: string): number {
    return /^\d+(?:,\d{1,4})?$/.test(value) ? Number(value.replace(',', '.')) : Number.NaN
}

/** "Tasa que usa el negocio": one card per currency with its current rate. */
function ActiveCurrencyChoice({
    data,
    canChange,
    onPick,
}: {
    data: AdminExchangeRate
    canChange: boolean
    onPick: (currency: RateCurrency) => void
}) {
    return (
        <Card padding="md" className="space-y-4">
            <div className="space-y-1">
                <h2 className="font-display text-xl text-fg">Tasa que usa el negocio</h2>
                <p className="text-sm text-fg-soft">
                    Los precios siguen en dólares: la tienda los convierte a bolívares con la tasa
                    elegida. Puedes cambiarla cuando quieras; los pedidos ya creados mantienen la
                    suya.
                </p>
            </div>
            <fieldset disabled={!canChange}>
                <legend className="sr-only">Tasa que usa el negocio</legend>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    {data.rates.map((entry) => {
                        const isActive = entry.currency === data.activeCurrency
                        return (
                            <label
                                key={entry.currency}
                                className={cn(
                                    'flex items-start gap-3 rounded-2xl border bg-surface px-4 py-3 transition',
                                    isActive ? 'border-accent/60 bg-cherry-tint/40' : 'border-line',
                                    canChange &&
                                        !isActive &&
                                        'cursor-pointer hover:border-cherry-500/30',
                                )}
                            >
                                <input
                                    type="radio"
                                    name="activeCurrency"
                                    value={entry.currency}
                                    checked={isActive}
                                    onChange={() => onPick(entry.currency)}
                                    className="mt-1 size-4 shrink-0 accent-cherry-500"
                                />
                                <span className="min-w-0 space-y-1">
                                    <span className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-semibold text-fg">
                                            {entry.label}
                                        </span>
                                        {isActive ? (
                                            <Badge tone="mint" size="sm">
                                                En uso
                                            </Badge>
                                        ) : null}
                                    </span>
                                    {entry.current ? (
                                        <>
                                            <span className="block font-display text-2xl text-fg tabular-nums">
                                                {formatRate(entry.current.rate)}{' '}
                                                <span className="text-sm text-fg-soft">
                                                    {RATE_UNITS[entry.currency]}
                                                </span>
                                            </span>
                                            <span className="block text-xs text-fg-soft">
                                                {rateDateText(entry.current)}
                                                {entry.current.isManual ? ' · manual' : ''}
                                            </span>
                                            {entry.current.isStale ? (
                                                <Badge tone="butter" size="sm">
                                                    Vencida
                                                </Badge>
                                            ) : null}
                                        </>
                                    ) : (
                                        <span className="block text-xs font-semibold text-warning">
                                            Todavía sin tasa guardada
                                        </span>
                                    )}
                                    <span className="block text-xs text-fg-soft">
                                        {CURRENCY_HINTS[entry.currency]}
                                    </span>
                                </span>
                            </label>
                        )
                    })}
                </div>
            </fieldset>
            <p className="text-xs text-fg-soft">
                {canChange
                    ? data.activeCurrencyUpdatedAt
                        ? `Elegida el ${formatDateTime(data.activeCurrencyUpdatedAt)}${data.activeCurrencyUpdatedBy ? ` por ${data.activeCurrencyUpdatedBy.name}` : ''}.`
                        : 'Por defecto la tienda usa el dólar BCV.'
                    : 'Solo un administrador puede cambiar la tasa que usa el negocio.'}
            </p>
        </Card>
    )
}

/** The active currency's rate in detail: exact value, source, freshness. */
function CurrentRateCard({ data }: { data: AdminExchangeRate }) {
    const current: CurrentExchangeRate | null = data.current
    const currency = data.activeCurrency
    return (
        <Card padding="md" className="space-y-3">
            <h2 className="font-display text-xl text-fg">
                Tasa vigente · {RATE_CURRENCY_LABELS[currency]}
            </h2>
            {current ? (
                <>
                    <p className="font-display text-4xl text-fg">
                        {formatRate(current.rate)}{' '}
                        <span className="text-lg text-fg-soft">{RATE_UNITS[currency]}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-fg-soft">
                        <Badge tone={current.isManual ? 'butter' : 'sky'} size="sm">
                            {current.sourceLabel}
                        </Badge>
                        <span>{rateDateText(current)}</span>
                    </div>
                    <p className="text-sm text-fg-soft">
                        Exacta:{' '}
                        {current.rate.toLocaleString('es-VE', {
                            maximumFractionDigits: 4,
                        })}{' '}
                        · obtenida el {formatDateTime(current.fetchedAt)}
                        {current.createdBy ? ` por ${current.createdBy.name}` : ''}
                    </p>
                    {current.isStale ? (
                        <Alert>
                            Esta tasa venció el {withPeriod(formatDateTime(current.usableUntil))} La
                            tienda no acepta pedidos hasta que haya una más reciente.
                        </Alert>
                    ) : (
                        <p className="text-xs text-fg-soft">
                            Se reemplaza sola cuando su fuente publique una nueva. Si no llega
                            ninguna, los pedidos se pausan el{' '}
                            {withPeriod(formatDateTime(current.usableUntil))}
                        </p>
                    )}
                </>
            ) : (
                <Alert>
                    Todavía no hay ninguna tasa {RATE_CURRENCY_LABELS[currency]} guardada: la tienda
                    no puede recibir pedidos. Usa “Actualizar ahora”, fija una tasa manual o elige
                    otra tasa.
                </Alert>
            )}
            <p className="text-xs text-fg-soft">{syncInfo(data)}</p>
        </Card>
    )
}

function HistoryTable({ entry }: { entry: AdminCurrencyRates }) {
    if (entry.history.length === 0) {
        return <p className="px-4 pb-4 text-sm text-fg-soft">Sin registros todavía.</p>
    }
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] text-sm">
                <thead className="border-y border-line bg-elevated/60">
                    <tr>
                        <th scope="col" className={headerCellClass}>
                            Fecha valor
                        </th>
                        <th scope="col" className={`${headerCellClass} text-right`}>
                            Tasa ({RATE_UNITS[entry.currency]})
                        </th>
                        <th scope="col" className={headerCellClass}>
                            Fuente
                        </th>
                        <th scope="col" className={headerCellClass}>
                            Obtenida
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-line">
                    {entry.history.map((rate, index) => (
                        <tr key={rate.id} className={cn(index === 0 && 'bg-success/10')}>
                            <td className={cellClass}>{formatDay(rate.effectiveDate)}</td>
                            <td className={`${cellClass} text-right font-semibold tabular-nums`}>
                                {rate.rate.toLocaleString('es-VE', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 4,
                                })}
                            </td>
                            <td className={cellClass}>
                                {rate.sourceLabel}
                                {rate.createdBy ? ` · ${rate.createdBy.name}` : ''}
                            </td>
                            <td className={`${cellClass} text-fg-soft`}>
                                {formatDateTime(rate.fetchedAt)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export function AdminExchangeRateView() {
    const { data, isPending, isError, error, refetch } = useAdminExchangeRate()
    const { data: session } = useSession()
    const isAdmin = session?.role === 'ADMIN'
    const refresh = useRefreshRate()
    const setManual = useSetManualRate()
    const setActive = useSetActiveCurrency()
    const [pendingCurrency, setPendingCurrency] = useState<RateCurrency | null>(null)
    /** The manual form's currency; follows the active one until the admin picks another. */
    const [manualChoice, setManualChoice] = useState<RateCurrency | null>(null)
    const [rateInput, setRateInput] = useState('')
    const [dateInput, setDateInput] = useState(todayInCaracas())
    const [rateError, setRateError] = useState<string | undefined>()
    const [notice, setNotice] = useState<{
        tone: 'success' | 'error' | 'info'
        text: string
    } | null>(null)

    const manualCurrency = manualChoice ?? data?.activeCurrency ?? 'USD'
    const manualCurrent = data?.rates.find((entry) => entry.currency === manualCurrency)?.current
    const currentRateText = manualCurrent
        ? rateFieldFormatter.format(manualCurrent.rate)
        : undefined
    const rateExample = currentRateText ?? '36,5000'
    const pending = data?.rates.find((entry) => entry.currency === pendingCurrency)

    /* Pasting replaces the selection with the normalized rate, e.g. "857.0058" -> "857,0058". */
    const pasteRate = (event: ClipboardEvent<HTMLInputElement>) => {
        event.preventDefault()
        const input = event.currentTarget
        const start = input.selectionStart ?? input.value.length
        const end = input.selectionEnd ?? start
        const pasted = normalizePastedRate(event.clipboardData.getData('text'))
        setRateInput(
            sanitizeRateInput(input.value.slice(0, start) + pasted + input.value.slice(end)),
        )
    }

    const submitManual = (event: FormEvent) => {
        event.preventDefault()
        const rate = parseRate(rateInput)
        if (!(rate > 0)) {
            setRateError(
                `Escribe un precio mayor que 0, con hasta 4 decimales (por ejemplo ${rateExample}).`,
            )
            return
        }
        if (rate > RATE_MAX) {
            setRateError('El precio no puede pasar de 100.000.000 Bs.')
            return
        }
        setRateError(undefined)
        setManual.mutate(
            { currency: manualCurrency, rate, effectiveDate: dateInput || undefined },
            {
                onSuccess: (result) => {
                    setRateInput('')
                    setNotice({
                        tone: 'success',
                        text:
                            manualCurrency === result.activeCurrency
                                ? `Tasa manual ${RATE_CURRENCY_LABELS[manualCurrency]} guardada. Ya se usa en la tienda.`
                                : `Tasa manual ${RATE_CURRENCY_LABELS[manualCurrency]} guardada. La tienda la usará si eliges esa tasa.`,
                    })
                },
                onError: (mutationError) => {
                    const detail = isApiError(mutationError)
                        ? mutationError.details[0]?.errors[0]
                        : undefined
                    setRateError(detail ?? getErrorMessage(mutationError))
                },
            },
        )
    }

    const confirmCurrency = () => {
        if (!pendingCurrency) return
        const currency = pendingCurrency
        setActive.mutate(currency, {
            onSuccess: () => {
                setPendingCurrency(null)
                setNotice({
                    tone: 'success',
                    text: `Listo: la tienda ahora convierte los precios con la tasa ${RATE_CURRENCY_LABELS[currency]}.`,
                })
            },
        })
    }

    const runRefresh = () => {
        refresh.mutate(undefined, {
            onSuccess: (result) => setNotice(syncMessage(result.sync)),
            onError: (refreshError) =>
                setNotice({ tone: 'error', text: getErrorMessage(refreshError) }),
        })
    }

    return (
        <>
            <AdminPageHeader
                title="Tasa de cambio"
                description="La tienda convierte los precios en dólares a bolívares con la tasa que elijas: dólar BCV, euro BCV o USDT Binance."
                actions={
                    <Button
                        variant="secondary"
                        onClick={runRefresh}
                        isLoading={refresh.isPending}
                        leadingIcon={<RefreshCw aria-hidden="true" className="size-4" />}
                    >
                        Actualizar ahora
                    </Button>
                }
            />

            {notice ? (
                <Alert
                    tone={notice.tone}
                    className="mb-6"
                    onDismiss={() => setNotice(null)}
                    autoDismissMs={notice.tone === 'error' ? undefined : NOTICE_DISMISS_MS}
                >
                    {notice.text}
                </Alert>
            ) : null}

            {isPending ? (
                <div className="space-y-6">
                    <Skeleton shape="block" className="h-40" />
                    <Skeleton shape="block" className="h-64" />
                </div>
            ) : isError ? (
                <EmptyState
                    title="No pudimos cargar la tasa"
                    description={getErrorMessage(error)}
                    icon={<Landmark className="size-6" />}
                    action={
                        <Button variant="secondary" onClick={() => void refetch()}>
                            Reintentar
                        </Button>
                    }
                />
            ) : (
                <div className="space-y-6">
                    <ActiveCurrencyChoice
                        data={data}
                        canChange={isAdmin}
                        onPick={(currency) => {
                            setActive.reset()
                            setPendingCurrency(currency)
                        }}
                    />

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <CurrentRateCard data={data} />

                        <Card padding="md" className="space-y-3">
                            <h2 className="font-display text-xl text-fg">Tasa manual</h2>
                            <p className="text-sm text-fg-soft">
                                Úsala si una fuente no responde. Se aplica de inmediato y se
                                mantiene hasta que su fuente publique una tasa distinta, que la
                                reemplaza sola (en USDT puede pasar en minutos).
                            </p>
                            {isAdmin ? (
                                <form
                                    onSubmit={submitManual}
                                    noValidate
                                    className="@container space-y-4"
                                >
                                    <fieldset className="space-y-2">
                                        <legend className={cn(FIELD_LABEL_CLASS, 'mb-2')}>
                                            Tasa
                                        </legend>
                                        <div className="flex flex-wrap gap-2">
                                            {RATE_CURRENCIES.map((currency) => (
                                                <label
                                                    key={currency}
                                                    className={cn(
                                                        'flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition',
                                                        manualCurrency === currency
                                                            ? 'border-accent/60 bg-cherry-tint/40 text-fg'
                                                            : 'border-line text-fg-soft hover:border-cherry-500/30',
                                                    )}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="manualCurrency"
                                                        value={currency}
                                                        checked={manualCurrency === currency}
                                                        onChange={() => {
                                                            setManualChoice(currency)
                                                            setRateError(undefined)
                                                        }}
                                                        className="size-4 accent-cherry-500"
                                                    />
                                                    {RATE_CURRENCY_LABELS[currency]}
                                                </label>
                                            ))}
                                        </div>
                                    </fieldset>
                                    {/* Side by side only on a wide card, so "25 sep 2026" never
                                        truncates; tops aligned, so hints of different lengths
                                        never push one field down. */}
                                    <div className="grid grid-cols-1 items-start gap-x-4 gap-y-3 @lg:grid-cols-2">
                                        <Input
                                            label={MANUAL_FIELD[manualCurrency].label}
                                            hint={MANUAL_FIELD[manualCurrency].hint}
                                            inputMode="decimal"
                                            autoComplete="off"
                                            maxLength={RATE_MAX_LENGTH}
                                            placeholder={
                                                currentRateText
                                                    ? `Actual: ${currentRateText}`
                                                    : '0,0000'
                                            }
                                            value={rateInput}
                                            error={rateError}
                                            onChange={(event) =>
                                                setRateInput(sanitizeRateInput(event.target.value))
                                            }
                                            onPaste={pasteRate}
                                        />
                                        <DatePicker
                                            label="Fecha valor"
                                            max={latestValueDate()}
                                            hint={
                                                manualCurrency === 'USDT'
                                                    ? 'El día en que vale la tasa (normalmente hoy).'
                                                    : 'El BCV publica la tasa con la fecha del próximo día hábil.'
                                            }
                                            value={dateInput}
                                            onChange={setDateInput}
                                        />
                                    </div>
                                    <Button type="submit" isLoading={setManual.isPending}>
                                        Guardar tasa manual
                                    </Button>
                                </form>
                            ) : (
                                <p className="text-sm font-semibold text-fg-soft">
                                    Solo un administrador puede fijar una tasa manual.
                                </p>
                            )}
                        </Card>
                    </div>

                    <Card padding="none" className="overflow-hidden">
                        <h2 className="px-4 pt-4 pb-2 font-display text-xl text-fg">
                            Últimas tasas
                        </h2>
                        <Tabs
                            label="Últimas tasas por moneda"
                            className="px-0"
                            items={data.rates.map((entry) => ({
                                id: entry.currency,
                                label: entry.label,
                                content: <HistoryTable entry={entry} />,
                            }))}
                        />
                    </Card>
                </div>
            )}

            <ConfirmDialog
                isOpen={pendingCurrency !== null}
                title={
                    pending ? `¿Usar la tasa ${pending.label}?` : '¿Cambiar la tasa del negocio?'
                }
                description={
                    pending ? (
                        <>
                            Desde ahora los precios en dólares se convierten a bolívares con{' '}
                            {pending.current ? (
                                <strong className="font-semibold text-fg">
                                    {formatRate(pending.current.rate)}{' '}
                                    {RATE_UNITS[pending.currency]}
                                </strong>
                            ) : (
                                'esta tasa'
                            )}
                            , en la tienda y en los pedidos nuevos. Los pedidos ya creados mantienen
                            su tasa.
                        </>
                    ) : undefined
                }
                confirmLabel={pending ? `Usar ${pending.label}` : 'Cambiar'}
                confirmVariant="primary"
                isLoading={setActive.isPending}
                error={setActive.isError ? getErrorMessage(setActive.error) : undefined}
                onConfirm={confirmCurrency}
                onClose={() => setPendingCurrency(null)}
            >
                {pending && (!pending.current || pending.current.isStale) ? (
                    <Alert>
                        Esta tasa no está vigente: la tienda no podrá recibir pedidos hasta que haya
                        una. Usa “Actualizar ahora” o fija una tasa manual.
                    </Alert>
                ) : null}
            </ConfirmDialog>
        </>
    )
}
