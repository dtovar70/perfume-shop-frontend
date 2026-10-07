import { HighlightedText } from '@/components/shared/HighlightedText'
import { SocialIcon } from '@/components/shared/SocialIcon'
import { SprayBottleArt } from '@/components/shared/SprayBottleArt'
import { ButtonLink, Sticker } from '@/components/ui'
import { buttonVariants } from '@/components/ui/Button.variants'
import { CONTAINER } from '@/constants/layout.constant'
import { ROUTES } from '@/constants/route.constant'
import { whatsappUrl } from '@/utils/content'
import { useSiteContent } from '@/utils/hooks/useSiteContent'

/**
 * The original closing banner: a big rounded "blob" panel with a sticker, an uppercase headline
 * and two pill buttons. On black it carries a soft cherry glow instead of the pastel gradient.
 */
export function CtaBanner() {
    const { home, contact } = useSiteContent()

    return (
        <section aria-labelledby="cta-heading" className="pt-16 lg:pt-24">
            <div className={CONTAINER}>
                <div className="relative isolate overflow-hidden rounded-blob border border-line bg-surface glow-cherry px-6 py-14 sm:px-12 lg:py-16">
                    <div
                        aria-hidden="true"
                        className="absolute -right-16 -bottom-24 -z-10 size-80 rounded-full bg-cherry-500/15 blur-3xl"
                    />
                    <SprayBottleArt className="absolute right-6 bottom-6 -z-10 h-64 w-auto max-lg:hidden xl:right-10" />

                    <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:pr-40">
                        <div className="max-w-2xl space-y-6">
                            <Sticker tone="blush" rotation="right">
                                {home.ctaBadge}
                            </Sticker>

                            <h2
                                id="cta-heading"
                                className="font-display text-3xl font-bold tracking-tight text-balance text-fg uppercase sm:text-4xl lg:text-5xl"
                            >
                                <HighlightedText text={home.ctaTitle} />
                            </h2>

                            <p className="max-w-md text-fg-soft">{home.ctaDescription}</p>
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
                                    className={buttonVariants({ size: 'lg' })}
                                >
                                    <SocialIcon network="WhatsApp" className="size-4.5" />
                                    {home.ctaPrimary}
                                </a>
                            ) : (
                                <ButtonLink to={ROUTES.contact} size="lg">
                                    {home.ctaPrimary}
                                </ButtonLink>
                            )}
                            <ButtonLink to={ROUTES.about} size="lg" variant="secondary">
                                {home.ctaSecondary}
                            </ButtonLink>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
