import { ArrowRight, Check } from 'lucide-react'
import { motion } from 'motion/react'

import { HighlightedText } from '@/components/shared/HighlightedText'
import { PerfumeArt } from '@/components/shared/PerfumeArt'
import { SocialIcon } from '@/components/shared/SocialIcon'
import { ButtonLink } from '@/components/ui'
import { buttonVariants } from '@/components/ui/Button.variants'
import { CONTAINER } from '@/constants/layout.constant'
import { ROUTES } from '@/constants/route.constant'
import { cn } from '@/utils/cn'
import { whatsappUrl } from '@/utils/content'
import { usePrefersReducedMotion } from '@/utils/hooks/useMediaQuery'
import { useSiteContent } from '@/utils/hooks/useSiteContent'

const WHATSAPP_MESSAGE = 'Hola, quiero asesoría para elegir un perfume.'

export function Hero() {
    const { home, contact } = useSiteContent()
    const prefersReducedMotion = usePrefersReducedMotion()
    const entrance = prefersReducedMotion ? false : { opacity: 0, y: 24 }

    return (
        <section
            aria-labelledby="hero-heading"
            className="gradient-blush relative isolate overflow-hidden"
        >
            {/* Soft decorative shapes; text never sits on top of them at low contrast. */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
                <span className="absolute -top-32 -left-24 size-[28rem] rounded-full bg-rose-200/50 blur-3xl" />
                <span className="absolute -right-20 -bottom-40 size-[32rem] rounded-full bg-gold-200/60 blur-3xl" />
                <span className="absolute top-10 right-[8%] size-40 rounded-full border border-gold-300/50" />
                <span className="absolute bottom-16 left-[45%] size-16 rounded-full border border-rose-300/50" />
            </div>

            <div
                className={cn(
                    CONTAINER,
                    'grid items-center gap-12 py-12 sm:py-16 lg:grid-cols-[1.1fr_1fr] lg:gap-10 lg:py-24',
                )}
            >
                <motion.div
                    initial={entrance}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="space-y-7 text-center lg:text-left"
                >
                    <p className="inline-flex items-center gap-3 text-[11px] font-bold tracking-[0.3em] text-gold-700 uppercase sm:text-xs">
                        <span aria-hidden="true" className="h-px w-8 bg-gold-500" />
                        {home.heroBadge}
                        <span aria-hidden="true" className="h-px w-8 bg-gold-500 lg:hidden" />
                    </p>

                    <h1
                        id="hero-heading"
                        className="font-display text-[2.9rem] leading-[0.98] font-semibold text-balance text-ink sm:text-6xl lg:text-7xl xl:text-[5.25rem]"
                    >
                        <HighlightedText text={home.heroTitle} />
                    </h1>

                    <p className="mx-auto max-w-lg text-base leading-relaxed text-ink-soft sm:text-lg lg:mx-0">
                        {home.heroSubtitle}
                    </p>

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
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
                                {home.heroSecondaryCta}
                            </a>
                        ) : null}
                    </div>

                    {home.heroFeatures.length > 0 ? (
                        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 lg:justify-start">
                            {home.heroFeatures.map((feature, index) => (
                                <li
                                    key={`${index}-${feature}`}
                                    className="flex items-center gap-2 text-sm font-semibold text-ink-soft"
                                >
                                    <Check aria-hidden="true" className="size-4 text-gold-700" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    ) : null}
                </motion.div>

                <motion.div
                    initial={entrance}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.12, ease: 'easeOut' }}
                    className="px-6 sm:px-10"
                >
                    <PerfumeArt />
                </motion.div>
            </div>
        </section>
    )
}
