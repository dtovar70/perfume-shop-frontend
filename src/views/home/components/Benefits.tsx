import { Headset, ShieldCheck, Truck, Wallet } from 'lucide-react'

import { CONTAINER } from '@/constants/layout.constant'
import { useShippingContent } from '@/utils/hooks/useSiteContent'

/** Four reassurance blocks between the product rails and the testimonials. */
export function Benefits() {
    const { freeShippingText } = useShippingContent()

    const items = [
        {
            icon: Truck,
            title: 'Envíos a todo el país',
            description: `Despachamos a toda Venezuela. ${freeShippingText}.`,
        },
        {
            icon: ShieldCheck,
            title: 'Originalidad garantizada',
            description: 'Fragancias 100% originales, selladas y de proveedores de confianza.',
        },
        {
            icon: Wallet,
            title: 'Pago Móvil y divisas',
            description: 'Paga en bolívares a la tasa BCV del día o en dólares, como prefieras.',
        },
        {
            icon: Headset,
            title: 'Atención personalizada',
            description: 'Te asesoramos por WhatsApp para que elijas el perfume ideal.',
        },
    ]

    return (
        <section aria-label="Por qué comprar en KaiZen" className="pb-16 lg:pb-20">
            <div className={CONTAINER}>
                <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-xl2 border border-line bg-line shadow-soft xl:grid-cols-4">
                    {items.map(({ icon: Icon, title, description }) => (
                        <li
                            key={title}
                            className="flex flex-col gap-3 bg-surface p-4 sm:flex-row sm:gap-4 sm:p-6"
                        >
                            <span
                                aria-hidden="true"
                                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-cherry-tint text-accent-strong ring-1 ring-cherry-500/25"
                            >
                                <Icon className="size-5" strokeWidth={1.6} />
                            </span>
                            <div className="space-y-1">
                                <h3 className="font-display text-base leading-tight font-semibold text-fg">
                                    {title}
                                </h3>
                                <p className="text-xs leading-relaxed text-fg-soft sm:text-sm">
                                    {description}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}
