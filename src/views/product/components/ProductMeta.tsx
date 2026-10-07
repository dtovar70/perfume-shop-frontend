import { Check } from 'lucide-react'

import type { Product } from '@/@types/product'
import { Accordion, type AccordionItem } from '@/components/shared/Accordion'
import { useShippingContent } from '@/utils/hooks/useSiteContent'

/** Shipping, payment and authenticity answers, filled with the editable shipping data. */
function useProductFaq(): AccordionItem[] {
    const { productionCopy, freeShippingText } = useShippingContent()
    return [
        {
            id: 'shipping',
            question: 'Envíos y tiempos de entrega',
            answer: `${productionCopy}. Enviamos a toda Venezuela con entrega en 24 a 72 horas según la ciudad, o puedes retirar en tienda. ${freeShippingText}.`,
        },
        {
            id: 'payment',
            question: 'Formas de pago',
            answer: 'Pago Móvil en bolívares a la tasa BCV del día, o en divisas. Te confirmamos el pago apenas lo verificamos.',
        },
        {
            id: 'original',
            question: '¿Es original?',
            answer: 'Sí. Todas nuestras fragancias son 100% originales, selladas y de proveedores de confianza.',
        },
    ]
}

export interface ProductMetaProps {
    product: Product
}

export interface ProductSectionProps {
    product: Product
    /** Inside a tab the tab already names the section: the heading is kept for screen readers. */
    hideHeading?: boolean
}

/** The description and the "Por qué te va a encantar" highlights. */
export function ProductDescription({ product, hideHeading = false }: ProductSectionProps) {
    return (
        <div className="space-y-10">
            {product.description ? (
                <section aria-labelledby="description-heading" className="space-y-3">
                    <h2
                        id="description-heading"
                        className={
                            hideHeading ? 'sr-only' : 'font-display text-3xl font-semibold text-fg'
                        }
                    >
                        Descripción
                    </h2>
                    <p className="text-[15px] leading-relaxed whitespace-pre-line text-fg-soft">
                        {product.description}
                    </p>
                </section>
            ) : null}

            {product.highlights.length > 0 ? (
                <section aria-labelledby="highlights-heading" className="space-y-3">
                    <h2
                        id="highlights-heading"
                        className="font-display text-2xl font-semibold text-fg"
                    >
                        Por qué te va a encantar
                    </h2>
                    <ul className="space-y-2.5">
                        {product.highlights.map((highlight) => (
                            <li
                                key={highlight}
                                className="flex items-start gap-3 text-[15px] text-fg"
                            >
                                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-elevated text-accent">
                                    <Check aria-hidden="true" className="size-3" strokeWidth={3} />
                                </span>
                                {highlight}
                            </li>
                        ))}
                    </ul>
                </section>
            ) : null}
        </div>
    )
}

/** Shipping, payment and authenticity questions. */
export function ProductFaq({ hideHeading = false }: { hideHeading?: boolean }) {
    const faqItems = useProductFaq()

    return (
        <section aria-labelledby="faq-heading" className="space-y-3">
            <h2
                id="faq-heading"
                className={hideHeading ? 'sr-only' : 'font-display text-2xl font-semibold text-fg'}
            >
                Preguntas frecuentes
            </h2>
            <Accordion items={faqItems} />
        </section>
    )
}

/** Description, highlights and the FAQ under the product summary (stacked, phones). */
export function ProductMeta({ product }: ProductMetaProps) {
    return (
        <div className="space-y-10">
            <ProductDescription product={product} />
            <ProductFaq />
        </div>
    )
}
