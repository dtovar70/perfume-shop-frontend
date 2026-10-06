import { useEffect, useRef, useState } from 'react'
import { Check, Copy, ExternalLink, Link2, MessageCircle } from 'lucide-react'

import type { AdminOrder } from '@/@types/order'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { OrderStatusBadge } from '@/components/shared/OrderStatusBadge'
import { Alert, Button, Skeleton, Textarea } from '@/components/ui'
import { buttonVariants } from '@/components/ui/Button.variants'
import { NOTICE_DISMISS_MS } from '@/constants/ui.constant'
import { getErrorMessage } from '@/services/errors'
import { cn } from '@/utils/cn'
import { copyText } from '@/utils/clipboard'
import { formatVePhone, whatsappUrl } from '@/utils/content'
import {
    usePrepareWhatsAppMessage,
    useRecordWhatsAppOpened,
} from '@/views/admin/hooks/useAdminOrders'

/** Room for the owner's edits on top of a 1000-character template with its links filled in. */
const MESSAGE_MAX_LENGTH = 2000
const COPIED_MS = 1800

/**
 * "Avisar por WhatsApp": the owner messages the customer from her own WhatsApp (a free wa.me
 * link). The API renders the current status's template with a fresh private link; she can edit
 * the text, open WhatsApp with it (an internal note records it) or copy it.
 */
export function WhatsAppNoticeAction({ order }: { order: AdminOrder }) {
    const [isOpen, setIsOpen] = useState(false)
    const prepare = usePrepareWhatsAppMessage(order.code)
    const opened = useRecordWhatsAppOpened(order.code)
    const [text, setText] = useState('')
    const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')
    const [isRecorded, setIsRecorded] = useState(false)
    const copyTimer = useRef(0)

    useEffect(() => () => window.clearTimeout(copyTimer.current), [])

    const load = () =>
        prepare.mutate(undefined, {
            onSuccess: (message) => setText(message.text),
        })

    const open = () => {
        setIsOpen(true)
        setText('')
        setIsRecorded(false)
        setCopyState('idle')
        opened.reset()
        load()
    }

    const copy = async () => {
        const copied = await copyText(text)
        setCopyState(copied ? 'copied' : 'failed')
        window.clearTimeout(copyTimer.current)
        copyTimer.current = window.setTimeout(() => setCopyState('idle'), COPIED_MS)
    }

    const message = prepare.data
    const ready = message !== undefined && !prepare.isPending
    const trimmed = text.trim()

    return (
        <>
            <Button
                variant="whatsapp"
                size="sm"
                onClick={open}
                leadingIcon={<MessageCircle aria-hidden="true" className="size-4" />}
            >
                Avisar por WhatsApp
            </Button>

            <ConfirmDialog
                isOpen={isOpen}
                size="lg"
                title="Avisar por WhatsApp"
                cancelLabel="Cerrar"
                description={
                    <span className="flex flex-wrap items-center gap-2">
                        Mensaje para el estado
                        <OrderStatusBadge status={order.status} size="sm" />
                        del pedido {order.code}.
                    </span>
                }
                onClose={() => setIsOpen(false)}
                actions={
                    ready ? (
                        <>
                            <Button
                                variant="secondary"
                                onClick={() => void copy()}
                                disabled={!trimmed}
                                leadingIcon={
                                    copyState === 'copied' ? (
                                        <Check aria-hidden="true" className="size-4" />
                                    ) : (
                                        <Copy aria-hidden="true" className="size-4" />
                                    )
                                }
                            >
                                {copyState === 'copied' ? 'Copiado' : 'Copiar mensaje'}
                            </Button>
                            {message.phone ? (
                                <a
                                    href={whatsappUrl(message.phone, trimmed)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-disabled={!trimmed || undefined}
                                    onClick={(event) => {
                                        if (!trimmed) {
                                            event.preventDefault()
                                            return
                                        }
                                        opened.mutate(undefined, {
                                            onSuccess: () => setIsRecorded(true),
                                        })
                                    }}
                                    className={cn(
                                        buttonVariants({ variant: 'whatsapp' }),
                                        !trimmed && 'pointer-events-none opacity-50',
                                    )}
                                >
                                    <MessageCircle aria-hidden="true" className="size-4" />
                                    Abrir WhatsApp
                                    <ExternalLink aria-hidden="true" className="size-3.5" />
                                </a>
                            ) : null}
                        </>
                    ) : (
                        <span />
                    )
                }
            >
                {prepare.isPending ? (
                    <div className="space-y-3" aria-busy="true">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton shape="block" className="h-40" />
                    </div>
                ) : prepare.isError ? (
                    <Alert>
                        <span className="block">{getErrorMessage(prepare.error)}</span>
                        <button
                            type="button"
                            onClick={load}
                            className="mt-1 font-semibold underline underline-offset-2"
                        >
                            Reintentar
                        </button>
                    </Alert>
                ) : message ? (
                    <div className="space-y-4">
                        {message.phone ? (
                            <p className="text-sm text-fg-soft">
                                Se abrirá tu WhatsApp con el mensaje escrito para{' '}
                                <span className="font-semibold text-fg">
                                    {order.customer.fullName}
                                </span>{' '}
                                ({formatVePhone(message.customerPhone)}). Solo tienes que tocar
                                enviar.
                            </p>
                        ) : (
                            <Alert tone="info">
                                El teléfono del cliente ({message.customerPhone}) no es un celular
                                venezolano, así que no podemos abrir WhatsApp con él. Copia el
                                mensaje y envíaselo por otro medio.
                            </Alert>
                        )}
                        <Textarea
                            label="Mensaje"
                            rows={7}
                            maxLength={MESSAGE_MAX_LENGTH}
                            hint="Puedes ajustarlo antes de enviarlo. El texto base se edita en Catálogos → Estados de pedido."
                            value={text}
                            onChange={(event) => setText(event.target.value)}
                        />
                        {message.link ? (
                            <p className="flex items-start gap-2 text-xs text-fg-soft">
                                <Link2 aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                                Incluye un enlace nuevo a la página del pedido. Los enlaces que el
                                cliente ya tenía siguen funcionando.
                            </p>
                        ) : null}
                        {copyState === 'failed' ? (
                            <Alert>
                                No pudimos copiar el mensaje. Selecciónalo y cópialo a mano.
                            </Alert>
                        ) : null}
                        {opened.isError ? (
                            <Alert>
                                WhatsApp se abrió, pero no pudimos dejar la nota en el pedido.{' '}
                                {getErrorMessage(opened.error)}
                            </Alert>
                        ) : null}
                        {isRecorded ? (
                            <Alert
                                tone="success"
                                autoDismissMs={NOTICE_DISMISS_MS}
                                onDismiss={() => setIsRecorded(false)}
                            >
                                Dejamos una nota en el pedido: «Aviso por WhatsApp preparado».
                            </Alert>
                        ) : null}
                    </div>
                ) : null}
            </ConfirmDialog>
        </>
    )
}
