import { HighlightedText } from '@/components/shared/HighlightedText'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { Sticker } from '@/components/ui'
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
                    className="absolute -top-20 left-1/3 -z-10 size-72 rounded-full bg-rose-200 opacity-60 blur-3xl"
                />

                <Sticker tone="sky" rotation="right">
                    {contactPage.badge}
                </Sticker>

                <h1 className="max-w-3xl font-display text-4xl leading-tight tracking-tight text-balance text-ink uppercase sm:text-5xl lg:text-6xl">
                    <HighlightedText text={contactPage.title} />
                </h1>

                <p className="max-w-xl text-lg text-ink-soft">{contactPage.intro}</p>
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

            <section aria-labelledby="faq-heading" className={cn(CONTAINER, 'space-y-8')}>
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
