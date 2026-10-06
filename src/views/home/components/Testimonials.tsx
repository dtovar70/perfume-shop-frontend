import { Quote } from 'lucide-react'

import { SectionHeading } from '@/components/shared/SectionHeading'
import { CONTAINER } from '@/constants/layout.constant'
import { cn } from '@/utils/cn'
import { useSiteContent } from '@/utils/hooks/useSiteContent'

/** Real customer reviews edited in Admin > Contenido. With none, the section is not shown. */
export function Testimonials() {
    const { home } = useSiteContent()
    const testimonials = home.testimonials

    if (testimonials.length === 0) return null

    return (
        <section aria-labelledby="testimonials-heading" className="py-16 lg:py-24">
            <div className={cn(CONTAINER, 'space-y-10')}>
                <SectionHeading
                    headingId="testimonials-heading"
                    eyebrow={home.testimonialsEyebrow}
                    title={home.testimonialsTitle}
                    align="center"
                />

                <ul className="-mx-4 flex snap-x snap-mandatory scrollbar-none gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0">
                    {testimonials.map((testimonial, index) => {
                        const details = [testimonial.city, testimonial.product]
                            .filter((part) => part !== '')
                            .join(' · ')
                        return (
                            <li key={index} className="w-[85%] shrink-0 snap-start md:w-auto">
                                <figure className="relative flex h-full flex-col gap-5 rounded-card border border-line bg-white p-6 shadow-soft sm:p-7">
                                    <Quote
                                        aria-hidden="true"
                                        className="size-8 text-gold-300"
                                        strokeWidth={1.25}
                                    />
                                    <blockquote className="flex-1 font-display text-xl leading-snug text-ink italic">
                                        “{testimonial.quote}”
                                    </blockquote>
                                    <figcaption className="border-t border-line pt-4 text-sm">
                                        <p className="font-bold text-ink">{testimonial.name}</p>
                                        {details ? <p className="text-ink-soft">{details}</p> : null}
                                    </figcaption>
                                </figure>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </section>
    )
}
