import { ArrowRight } from 'lucide-react'

import { HighlightedText } from '@/components/shared/HighlightedText'
import { SocialIcon } from '@/components/shared/SocialIcon'
import { ButtonLink } from '@/components/ui'
import { buttonVariants } from '@/components/ui/Button.variants'
import { CONTAINER } from '@/constants/layout.constant'
import { ROUTES } from '@/constants/route.constant'
import { cn } from '@/utils/cn'
import { whatsappUrl } from '@/utils/content'
import { useSiteContent } from '@/utils/hooks/useSiteContent'

/** Closing banner on a deep rose scene: advice by WhatsApp, or the About page. */
export function CtaBanner() {
    const { home, contact } = useSiteContent()

    return (
        <section aria-labelledby="cta-heading" className="pt-8 pb-4">
            <div className={CONTAINER}>
                <div className="relative isolate overflow-hidden rounded-card bg-[radial-gradient(120%_120%_at_85%_0%,#b05468_0%,#6e3442_45%,#2b1f24_100%)] px-6 py-14 text-ivory sm:px-12 lg:py-20">
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
                        <span className="absolute -right-20 -bottom-24 size-80 rounded-full border border-gold-300/30" />
                        <span className="absolute -right-6 -bottom-10 size-52 rounded-full border border-gold-300/20" />
                        <span className="absolute -top-24 left-1/3 size-72 rounded-full bg-gold-400/15 blur-3xl" />
                    </div>

                    <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl space-y-5">
                            <p className="text-[11px] font-bold tracking-[0.28em] text-gold-200 uppercase sm:text-xs">
                                {home.ctaBadge}
                            </p>
                            <h2
                                id="cta-heading"
                                className="font-display text-4xl leading-[1.05] font-semibold text-balance sm:text-5xl"
                            >
                                <HighlightedText text={home.ctaTitle} className="text-gold-200" />
                            </h2>
                            <p className="max-w-md text-ivory/80">{home.ctaDescription}</p>
                        </div>

                        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                            {contact.whatsapp ? (
                                <a
                                    href={whatsappUrl(
                                        contact.whatsapp,
                                        'Hola, quiero una recomendación de perfume.',
                                    )}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={buttonVariants({ variant: 'gold', size: 'lg' })}
                                >
                                    <SocialIcon network="WhatsApp" className="size-4.5" />
                                    {home.ctaPrimary}
                                </a>
                            ) : (
                                <ButtonLink to={ROUTES.contact} size="lg" variant="gold">
                                    {home.ctaPrimary}
                                </ButtonLink>
                            )}
                            <ButtonLink
                                to={ROUTES.about}
                                size="lg"
                                variant="secondary"
                                className={cn('border-ivory/60 text-ivory hover:bg-ivory hover:text-ink')}
                                trailingIcon={<ArrowRight aria-hidden="true" className="size-4" />}
                            >
                                {home.ctaSecondary}
                            </ButtonLink>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
