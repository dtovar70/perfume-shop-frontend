import type { ReactNode } from 'react'
import { MessageCircle } from 'lucide-react'

import { cn } from '@/utils/cn'
import { whatsappUrl } from '@/utils/content'
import { useSiteContent } from '@/utils/hooks/useSiteContent'

export interface WhatsAppNoticeProps {
    title: string
    children: ReactNode
    className?: string
    /** Pre-filled chat message, e.g. with the order code. */
    message?: string
}

/**
 * Friendly dead end with a way out: when the checkout cannot run (no BCV rate, no Pago Móvil
 * details), or an order cannot move on by itself, the customer can still reach us on WhatsApp.
 */
export function WhatsAppNotice({ title, children, className, message }: WhatsAppNoticeProps) {
    const { contact } = useSiteContent()

    return (
        <div
            role="status"
            className={cn(
                'space-y-3 rounded-card border border-cherry-500/50 bg-elevated/50 p-5 text-fg',
                className,
            )}
        >
            <p className="font-display text-lg">{title}</p>
            <div className="text-sm text-fg-soft">{children}</div>
            {contact.whatsapp ? (
                <a
                    href={whatsappUrl(contact.whatsapp, message)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 items-center gap-2 rounded-full bg-fg px-5 text-sm font-semibold text-canvas transition hover:bg-fg/85 focus-visible:ring-2 focus-visible:ring-cherry-500 focus-visible:ring-offset-2"
                >
                    <MessageCircle aria-hidden="true" className="size-4" />
                    Escríbenos por WhatsApp
                </a>
            ) : null}
        </div>
    )
}
