import { Headset, ShieldCheck, Truck, Wallet } from 'lucide-react'

import { CONTAINER } from '@/constants/layout.constant'
import { cn } from '@/utils/cn'
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
        <section aria-label="Por qué comprar en KaiZen" className="py-12 lg:py-16">
            <div className={CONTAINER}>
                <ul className="grid overflow-hidden rounded-card border border-gold-200/70 bg-white sm:grid-cols-2 lg:grid-cols-4">
                    {items.map(({ icon: Icon, title, description }, index) => (
                        <li
                            key={title}
                            className={cn(
                                'flex gap-4 p-6 sm:p-7',
                                index > 0 && 'border-t border-gold-200/70',
                                index === 1 && 'sm:border-t-0 sm:border-l',
                                index === 2 && 'lg:border-t-0 lg:border-l',
                                index === 3 && 'sm:border-l lg:border-t-0',
                            )}
                        >
                            <span
                                aria-hidden="true"
                                className="gradient-blush flex size-12 shrink-0 items-center justify-center rounded-full text-rose-700 ring-1 ring-gold-200"
                            >
                                <Icon className="size-5" strokeWidth={1.6} />
                            </span>
                            <div className="space-y-1">
                                <h3 className="font-display text-xl leading-tight font-semibold text-ink">
                                    {title}
                                </h3>
                                <p className="text-sm leading-relaxed text-ink-soft">{description}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}
