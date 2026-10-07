import { useId, useState } from 'react'
import { BellRing, Lock, RotateCcw } from 'lucide-react'
import { Link, useSearchParams } from 'react-router'

import type { AdminOutboxMessage, OutboxStatus } from '@/@types/outbox'
import type { BadgeTone } from '@/@types/catalog'
import { EmptyState } from '@/components/shared/EmptyState'
import { Alert, Badge, Button, Card, Skeleton, Spinner } from '@/components/ui'
import { NOTICE_DISMISS_MS } from '@/constants/ui.constant'
import { adminOrderPath } from '@/constants/route.constant'
import { getErrorMessage } from '@/services/errors'
import { cn } from '@/utils/cn'
import { formatDateTime } from '@/utils/formatDate'
import { CatalogPagination } from '@/views/catalog/components/CatalogPagination'
import { AdminPageHeader } from '@/views/admin/components/AdminPageHeader'
import { useAdminOutbox, useRetryOutboxMessage } from '@/views/admin/hooks/useAdminOutbox'
import { useSession } from '@/views/admin/hooks/useSession'

const TITLE = 'Avisos'
const PAGE_SIZE = 20
const SKELETON_ROWS = 5
/** Errors longer than this start collapsed to two lines, with "Ver todo". */
const LONG_ERROR = 90

/** `?estado=` values, in the order of the filter. Fallidos is the page's reason to exist. */
const FILTERS = [
    { id: 'fallidos', label: 'Fallidos', status: 'failed' },
    { id: 'pendientes', label: 'Pendientes', status: 'pending' },
    { id: 'enviados', label: 'Enviados', status: 'sent' },
    { id: 'todos', label: 'Todos', status: undefined },
] as const satisfies readonly { id: string; label: string; status?: OutboxStatus }[]

type FilterId = (typeof FILTERS)[number]['id']

const STATUS_LABEL: Record<OutboxStatus, { label: string; tone: BadgeTone }> = {
    failed: { label: 'Fallido', tone: 'blush' },
    pending: { label: 'Pendiente', tone: 'butter' },
    processing: { label: 'Enviando', tone: 'lilac' },
    sent: { label: 'Enviado', tone: 'mint' },
}

/** Handler types (backend `OutboxHandler.type`) in plain Spanish. */
const TYPE_LABELS: Record<string, string> = {
    'email.order_received': 'Correo al cliente: pedido recibido',
    'telegram.order_created': 'Telegram: nuevo pedido',
    'telegram.payment_submitted': 'Telegram: pago por verificar',
    'telegram.payment_resolved': 'Telegram: pago resuelto',
}

function typeLabel(type: string): string {
    if (TYPE_LABELS[type]) return TYPE_LABELS[type]
    const [channel] = type.split('.')
    if (channel === 'email') return `Correo (${type})`
    if (channel === 'telegram') return `Telegram (${type})`
    return type
}

function orderCodeOf(message: AdminOutboxMessage): string | null {
    const code = message.payload.code
    return typeof code === 'string' && code !== '' ? code : null
}

function canRetry(message: AdminOutboxMessage): boolean {
    return message.status === 'failed' || message.status === 'pending'
}

function nextAttemptText(message: AdminOutboxMessage): string {
    if (message.status === 'sent' || message.status === 'failed') return '—'
    return formatDateTime(message.nextAttemptAt)
}

const headerCellClass =
    'px-3 py-3 text-left text-xs font-bold tracking-wide text-fg-soft uppercase first:pl-4'
const cellClass = 'px-3 py-3 align-top first:pl-4'
const actionsCellClass = 'sticky right-0 bg-surface px-3 transition group-hover:bg-elevated'

function StatusBadge({ status }: { status: OutboxStatus }) {
    const { label, tone } = STATUS_LABEL[status]
    return (
        <Badge tone={tone} size="sm">
            {label}
        </Badge>
    )
}

function OrderLink({ message }: { message: AdminOutboxMessage }) {
    const code = orderCodeOf(message)
    if (!code) return <span className="text-fg-soft">—</span>
    return (
        <Link
            to={adminOrderPath(code)}
            className="font-display text-base text-fg underline-offset-4 hover:text-accent hover:underline"
        >
            {code}
        </Link>
    )
}

/** The last error, two lines at most until expanded. */
function ErrorText({ error }: { error: string | null }) {
    const [isExpanded, setIsExpanded] = useState(false)
    const id = useId()
    if (!error) return <span className="text-fg-soft">—</span>
    const isLong = error.length > LONG_ERROR

    return (
        <div className="space-y-1">
            <p
                id={id}
                className={cn(
                    'font-mono text-xs leading-relaxed break-words text-fg',
                    isLong && !isExpanded && 'line-clamp-2',
                )}
            >
                {error}
            </p>
            {isLong ? (
                <button
                    type="button"
                    aria-expanded={isExpanded}
                    aria-controls={id}
                    onClick={() => setIsExpanded((value) => !value)}
                    className="inline-flex min-h-8 items-center text-xs font-bold text-accent underline-offset-4 hover:underline pointer-coarse:min-h-11"
                >
                    {isExpanded ? 'Ver menos' : 'Ver todo'}
                </button>
            ) : null}
        </div>
    )
}

interface RetryButtonProps {
    message: AdminOutboxMessage
    isRetrying: boolean
    disabled: boolean
    onRetry: (message: AdminOutboxMessage) => void
}

function RetryButton({ message, isRetrying, disabled, onRetry }: RetryButtonProps) {
    if (!canRetry(message)) return null
    return (
        <Button
            variant="soft"
            size="sm"
            isLoading={isRetrying}
            disabled={disabled}
            leadingIcon={<RotateCcw aria-hidden="true" className="size-3.5" />}
            onClick={() => onRetry(message)}
            aria-label={`Reintentar: ${typeLabel(message.type)}${orderCodeOf(message) ? ` del pedido ${orderCodeOf(message)}` : ''}`}
        >
            Reintentar
        </Button>
    )
}

interface Toast {
    id: number
    tone: 'success' | 'error'
    text: string
}

/**
 * "Avisos" (ADMIN only): notifications to customers and staff (emails, Telegram) the worker
 * could not deliver, or is still trying to; "Reintentar" schedules one again right away.
 */
export function AdminOutboxView() {
    const { data: session } = useSession()
    const isAdmin = session?.role === 'ADMIN'
    const [searchParams, setSearchParams] = useSearchParams()
    const rawFilter = searchParams.get('estado')
    const filter = FILTERS.find((candidate) => candidate.id === rawFilter) ?? FILTERS[0]
    const page = Math.max(1, Number(searchParams.get('page')) || 1)
    const outbox = useAdminOutbox(
        { status: filter.status, page, pageSize: PAGE_SIZE },
        { enabled: isAdmin },
    )
    const retry = useRetryOutboxMessage()
    const [toast, setToast] = useState<Toast | null>(null)

    if (session && !isAdmin) {
        return (
            <>
                <AdminPageHeader title={TITLE} />
                <EmptyState
                    title="Solo un administrador puede ver los avisos"
                    description="Pide a un administrador que revise los correos y mensajes que no se pudieron enviar."
                    icon={<Lock className="size-6" />}
                />
            </>
        )
    }

    const selectFilter = (id: FilterId) =>
        setSearchParams(
            (current) => {
                const next = new URLSearchParams(current)
                if (id === FILTERS[0].id) next.delete('estado')
                else next.set('estado', id)
                next.delete('page')
                return next
            },
            { replace: true },
        )

    const goToPage = (nextPage: number) =>
        setSearchParams((current) => {
            const next = new URLSearchParams(current)
            if (nextPage > 1) next.set('page', String(nextPage))
            else next.delete('page')
            return next
        })

    const onRetry = (message: AdminOutboxMessage) => {
        const code = orderCodeOf(message)
        retry.mutate(message.id, {
            onSuccess: () =>
                setToast({
                    id: Date.now(),
                    tone: 'success',
                    text: `Listo: reintentaremos «${typeLabel(message.type)}»${code ? ` del pedido ${code}` : ''} en unos segundos.`,
                }),
            onError: (error) =>
                setToast({ id: Date.now(), tone: 'error', text: getErrorMessage(error) }),
        })
    }

    const items = outbox.data?.items ?? []
    const retryingId = retry.isPending ? retry.variables : undefined
    const emptyCopy: Record<FilterId, { title: string; description: string }> = {
        fallidos: {
            title: 'No hay avisos fallidos',
            description: 'Todos los correos y mensajes de Telegram se entregaron. ¡Todo en orden!',
        },
        pendientes: {
            title: 'Nada en cola',
            description: 'No hay avisos esperando un nuevo intento.',
        },
        enviados: {
            title: 'Aún no hay avisos enviados',
            description: 'Aquí verás los correos y mensajes entregados.',
        },
        todos: {
            title: 'Aún no hay avisos',
            description: 'Cada pedido nuevo genera sus correos y mensajes de Telegram.',
        },
    }

    return (
        <>
            <AdminPageHeader
                title={TITLE}
                description="Correos y mensajes de Telegram de los pedidos. Si uno falla, revisa el error y reinténtalo."
            />

            <div className="mb-6 flex flex-wrap items-center gap-3">
                <div role="group" aria-label="Filtrar por estado" className="flex flex-wrap gap-2">
                    {FILTERS.map((option) => {
                        const isActive = option.id === filter.id
                        return (
                            <button
                                key={option.id}
                                type="button"
                                aria-pressed={isActive}
                                onClick={() => selectFilter(option.id)}
                                className={cn(
                                    'inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-semibold transition pointer-coarse:min-h-11',
                                    isActive
                                        ? 'border-cherry-500 bg-cherry-500 text-on-cherry'
                                        : 'border-line bg-surface text-fg-soft hover:border-cherry-500/50 hover:text-fg',
                                )}
                            >
                                {option.label}
                            </button>
                        )
                    })}
                </div>
                <div className="ml-auto flex items-center gap-3">
                    {outbox.isFetching && !outbox.isPending ? (
                        <Spinner size="sm" className="text-accent" label="Actualizando la lista" />
                    ) : null}
                    {outbox.data ? (
                        <span className="text-sm text-fg-soft" aria-live="polite">
                            {outbox.data.total} {outbox.data.total === 1 ? 'aviso' : 'avisos'}
                        </span>
                    ) : null}
                </div>
            </div>

            {outbox.isPending ? (
                <Card padding="none" className="divide-y divide-line overflow-hidden">
                    {Array.from({ length: SKELETON_ROWS }, (_, index) => (
                        <div key={index} className="flex items-center gap-4 p-4">
                            <div className="flex-1 space-y-2">
                                <Skeleton className="w-1/3" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                            <Skeleton className="h-8 w-28" />
                        </div>
                    ))}
                </Card>
            ) : outbox.isError ? (
                <EmptyState
                    title="No pudimos cargar los avisos"
                    description={getErrorMessage(outbox.error)}
                    icon={<BellRing className="size-6" />}
                    action={
                        <Button variant="secondary" onClick={() => void outbox.refetch()}>
                            Reintentar
                        </Button>
                    }
                />
            ) : items.length === 0 ? (
                <EmptyState
                    title={emptyCopy[filter.id].title}
                    description={emptyCopy[filter.id].description}
                    icon={<BellRing className="size-6" />}
                />
            ) : (
                <div className="@container space-y-6">
                    <Card padding="none" className="hidden overflow-hidden @4xl:block">
                        <div className="overflow-x-auto">
                            {/* "Creado" rides under the type, so the last error gets the room. */}
                            <table className="w-full min-w-[56rem] table-fixed text-sm">
                                <colgroup>
                                    <col className="w-64" />
                                    <col className="w-32" />
                                    <col className="w-24" />
                                    <col className="w-44" />
                                    <col />
                                    <col className="w-36" />
                                </colgroup>
                                <thead className="border-b border-line bg-elevated/60">
                                    <tr>
                                        <th scope="col" className={headerCellClass}>
                                            Tipo
                                        </th>
                                        <th scope="col" className={headerCellClass}>
                                            Pedido
                                        </th>
                                        <th scope="col" className={`${headerCellClass} text-right`}>
                                            Intentos
                                        </th>
                                        <th scope="col" className={headerCellClass}>
                                            Próximo intento
                                        </th>
                                        <th scope="col" className={headerCellClass}>
                                            Último error
                                        </th>
                                        <th
                                            scope="col"
                                            className={cn(
                                                headerCellClass,
                                                actionsCellClass,
                                                'bg-elevated',
                                            )}
                                        >
                                            <span className="sr-only">Acciones</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-line">
                                    {items.map((message) => (
                                        <tr
                                            key={message.id}
                                            className="group transition hover:bg-elevated"
                                        >
                                            <td className={cellClass}>
                                                <p className="font-semibold text-fg">
                                                    {typeLabel(message.type)}
                                                </p>
                                                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                                                    <StatusBadge status={message.status} />
                                                    <span className="text-xs text-fg-soft">
                                                        Creado {formatDateTime(message.createdAt)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className={cellClass}>
                                                <OrderLink message={message} />
                                            </td>
                                            <td className={`${cellClass} text-right tabular-nums`}>
                                                {message.attempts}
                                            </td>
                                            <td className={`${cellClass} text-fg-soft`}>
                                                {nextAttemptText(message)}
                                            </td>
                                            <td className={cellClass}>
                                                <ErrorText error={message.lastError} />
                                            </td>
                                            <td className={`${cellClass} ${actionsCellClass}`}>
                                                <RetryButton
                                                    message={message}
                                                    isRetrying={retryingId === message.id}
                                                    disabled={retry.isPending}
                                                    onRetry={onRetry}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <ul className="grid grid-cols-1 gap-3 @xl:grid-cols-2 @4xl:hidden">
                        {items.map((message) => (
                            <li key={message.id}>
                                <Card padding="sm" className="flex h-full flex-col gap-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 space-y-1">
                                            <p className="font-semibold text-fg">
                                                {typeLabel(message.type)}
                                            </p>
                                            <StatusBadge status={message.status} />
                                        </div>
                                        <OrderLink message={message} />
                                    </div>
                                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                        <div>
                                            <dt className="text-xs text-fg-soft">Intentos</dt>
                                            <dd className="font-semibold text-fg tabular-nums">
                                                {message.attempts}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs text-fg-soft">
                                                Próximo intento
                                            </dt>
                                            <dd className="text-fg">{nextAttemptText(message)}</dd>
                                        </div>
                                        <div className="col-span-2">
                                            <dt className="text-xs text-fg-soft">Creado</dt>
                                            <dd className="text-fg">
                                                {formatDateTime(message.createdAt)}
                                            </dd>
                                        </div>
                                    </dl>
                                    {message.lastError ? (
                                        <div className="rounded-xl border border-line bg-elevated/60 p-3">
                                            <p className="mb-1 text-xs text-fg-soft">
                                                Último error
                                            </p>
                                            <ErrorText error={message.lastError} />
                                        </div>
                                    ) : null}
                                    {canRetry(message) ? (
                                        <div className="mt-auto flex justify-end border-t border-line pt-3">
                                            <RetryButton
                                                message={message}
                                                isRetrying={retryingId === message.id}
                                                disabled={retry.isPending}
                                                onRetry={onRetry}
                                            />
                                        </div>
                                    ) : null}
                                </Card>
                            </li>
                        ))}
                    </ul>

                    <CatalogPagination
                        page={outbox.data?.page ?? 1}
                        totalPages={outbox.data?.totalPages ?? 1}
                        onPageChange={goToPage}
                    />
                </div>
            )}

            {/* Toast: bottom right on desktop, full width above the bottom edge on phones. */}
            <div className="pointer-events-none fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 flex justify-end sm:inset-x-auto sm:right-6 sm:bottom-6">
                {toast ? (
                    <Alert
                        key={toast.id}
                        tone={toast.tone}
                        autoDismissMs={NOTICE_DISMISS_MS}
                        onDismiss={() => setToast(null)}
                        className="pointer-events-auto w-full max-w-sm bg-surface shadow-lift sm:w-96"
                    >
                        {toast.text}
                    </Alert>
                ) : null}
            </div>
        </>
    )
}
