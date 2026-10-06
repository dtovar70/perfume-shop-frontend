import { ArrowRight, Check, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'

import { HighlightedText } from '@/components/shared/HighlightedText'
import { SocialIcon } from '@/components/shared/SocialIcon'
import { ButtonLink, Sticker } from '@/components/ui'
import { buttonVariants } from '@/components/ui/Button.variants'
import { CONTAINER } from '@/constants/layout.constant'
import { ROUTES } from '@/constants/route.constant'
import { cn } from '@/utils/cn'
import { whatsappUrl } from '@/utils/content'
import { usePrefersReducedMotion } from '@/utils/hooks/useMediaQuery'
import { useSiteContent } from '@/utils/hooks/useSiteContent'
import { HeroShowcase } from '@/views/home/components/HeroShowcase'

const WHATSAPP_MESSAGE = 'Hola, quiero asesoría para elegir un perfume.'

/**
 * The original store's hero, on black: copy on the left; on the right a large rounded "blob"
 * card with the admin's hero photo or video (or the featured products), two smaller cards
 * tucked into its corners and two tilted stickers (see `HeroShowcase`).
 */
export function Hero() {
    const { home, contact } = useSiteContent()
    const prefersReducedMotion = usePrefersReducedMotion()
    const entrance = prefersReducedMotion ? false : { opacity: 0, y: 24 }

    return (
        <section
            aria-labelledby="hero-heading"
            className="relative isolate overflow-hidden pt-10 pb-16 sm:pt-16 lg:pt-20 lg:pb-24"
        >
            <div
                aria-hidden="true"
                className="absolute -top-32 -left-32 -z-10 size-[26rem] rounded-full bg-cherry-500/15 blur-3xl"
            />
            <div
                aria-hidden="true"
                className="absolute top-40 -right-24 -z-10 size-[28rem] rounded-full bg-cherry-500/10 blur-3xl"
            />

            <div className={cn(CONTAINER, 'grid items-center gap-14 lg:grid-cols-2 lg:gap-10')}>
                <motion.div
                    initial={entrance}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="space-y-7"
                >
                    {home.heroBadge && (
                        <Sticker tone="butter" rotation="right" className="inline-flex gap-1.5">
                            <Sparkles aria-hidden="true" className="size-4" />
                            {home.heroBadge}
                        </Sticker>
                    )}

                    <h1
                        id="hero-heading"
                        className="font-display text-[2.75rem] leading-[0.95] font-bold tracking-tight text-balance text-fg uppercase sm:text-6xl lg:text-7xl"
                    >
                        <HighlightedText text={home.heroTitle} />
                    </h1>

                    <p className="max-w-lg text-lg leading-relaxed text-fg-soft">
                        {home.heroSubtitle}
                    </p>

                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                        <ButtonLink
                            to={ROUTES.catalog}
                            size="lg"
                            trailingIcon={<ArrowRight aria-hidden="true" className="size-4" />}
                        >
                            {home.heroPrimaryCta}
                        </ButtonLink>
                        {contact.whatsapp ? (
                            <a
                                href={whatsappUrl(contact.whatsapp, WHATSAPP_MESSAGE)}
                                target="_blank"
                                rel="noreferrer"
                                className={buttonVariants({ variant: 'secondary', size: 'lg' })}
                            >
                                <SocialIcon network="WhatsApp" className="size-4.5" />
                                Pedir por WhatsApp
                            </a>
                        ) : (
                            <ButtonLink to={ROUTES.contact} size="lg" variant="secondary">
                                {home.heroSecondaryCta}
                            </ButtonLink>
                        )}
                    </div>

                    {home.heroFeatures.length > 0 ? (
                        <ul className="flex flex-wrap gap-x-6 gap-y-2">
                            {home.heroFeatures.map((feature, index) => (
                                <li
                                    key={`${index}-${feature}`}
                                    className="flex items-center gap-2 text-sm font-semibold text-fg-soft"
                                >
                                    <span className="flex size-5 items-center justify-center rounded-full bg-cherry-tint text-accent-strong ring-1 ring-cherry-500/30">
                                        <Check aria-hidden="true" className="size-3" />
                                    </span>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    ) : null}
                </motion.div>

                <motion.div
                    initial={entrance}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                >
                    <HeroShowcase />
                </motion.div>
            </div>
        </section>
    )
}
