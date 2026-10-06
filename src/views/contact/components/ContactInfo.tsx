import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import type { ReactNode } from 'react'

import { Card } from '@/components/ui'
import { formatVePhone, phoneHref } from '@/utils/content'
import { useSiteContent } from '@/utils/hooks/useSiteContent'

interface ContactChannel {
    id: string
    icon: ReactNode
    label: string
    value: string
    href?: string
}

export function ContactInfo() {
    const { contact } = useSiteContent()
    const channels: ContactChannel[] = [
        {
            id: 'email',
            icon: <Mail aria-hidden="true" className="size-5" />,
            label: 'Correo',
            value: contact.email,
            href: `mailto:${contact.email}`,
        },
        {
            id: 'phone',
            icon: <Phone aria-hidden="true" className="size-5" />,
            label: 'Teléfono / WhatsApp',
            value: formatVePhone(contact.phone),
            href: phoneHref(contact.phone),
        },
        {
            id: 'address',
            icon: <MapPin aria-hidden="true" className="size-5" />,
            label: 'Ubicación',
            value: contact.city,
        },
        {
            id: 'schedule',
            icon: <Clock aria-hidden="true" className="size-5" />,
            label: 'Horario',
            value: contact.schedule,
        },
    ]

    return (
        <ul className="grid gap-4">
            {channels.map((channel) => (
                <li key={channel.id} className="h-full">
                    <Card tone="elevated" className="flex h-full items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-elevated text-accent">
                            {channel.icon}
                        </span>
                        <div className="min-w-0 space-y-0.5">
                            <p className="font-display text-sm text-fg">{channel.label}</p>
                            {channel.href ? (
                                <a
                                    href={channel.href}
                                    className="text-sm text-fg-soft transition hover:text-accent"
                                >
                                    {channel.value}
                                </a>
                            ) : (
                                <p className="text-sm text-fg-soft">{channel.value}</p>
                            )}
                        </div>
                    </Card>
                </li>
            ))}
        </ul>
    )
}
