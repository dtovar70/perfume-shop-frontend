import { HighlightedText } from '@/components/shared/HighlightedText'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { CONTAINER } from '@/constants/layout.constant'
import { cn } from '@/utils/cn'
import { useSiteContent } from '@/utils/hooks/useSiteContent'
import { ContactFaq } from '@/views/contact/components/ContactFaq'
import { ContactForm } from '@/views/contact/components/ContactForm'
import { ContactInfo } from '@/views/contact/components/ContactInfo'

export function ContactView() {
    const { contactPage } = useSiteContent()

    return (
        <div className="space-y-16 pb-20">
            <section className={cn(CONTAINER, 'relative isolate space-y-6 pt-12 lg:pt-20')}>
                <div
                    aria-hidden="true"
                    className="absolute -top-20 left-1/3 -z-10 size-72 rounded-full bg-cherry-tint opacity-80 blur-3xl"
                />

                <p className="flex items-center gap-3 text-[11px] font-bold tracking-[0.28em] text-accent uppercase sm:text-xs">
                    <span aria-hidden="true" className="h-px w-8 bg-cherry-500" />
                    {contactPage.badge}
                </p>

                <h1 className="max-w-3xl font-display text-[2.6rem] leading-[1.02] font-semibold text-balance text-fg sm:text-5xl lg:text-6xl">
                    <HighlightedText text={contactPage.title} />
                </h1>

                <p className="max-w-xl text-lg text-fg-soft">{contactPage.intro}</p>
            </section>

            <section
                className={cn(
                    CONTAINER,
                    'grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]',
                )}
            >
                <ContactForm />
                <ContactInfo />
            </section>

            <section
                id="preguntas"
                aria-labelledby="faq-heading"
                className={cn(CONTAINER, 'scroll-mt-28 space-y-8')}
            >
                <SectionHeading
                    headingId="faq-heading"
                    eyebrow={contactPage.faqEyebrow}
                    title={contactPage.faqTitle}
                />
                <ContactFaq />
            </section>
        </div>
    )
}
