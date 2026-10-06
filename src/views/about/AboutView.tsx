import { HighlightedText } from '@/components/shared/HighlightedText'
import { PerfumeArt } from '@/components/shared/PerfumeArt'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { ButtonLink, Sticker } from '@/components/ui'
import { CONTAINER } from '@/constants/layout.constant'
import { ROUTES } from '@/constants/route.constant'
import { cn } from '@/utils/cn'
import { useFillPlaceholders, useSiteContent } from '@/utils/hooks/useSiteContent'
import { StatsRow } from '@/views/about/components/StatsRow'
import { ValuesGrid } from '@/views/about/components/ValuesGrid'

export function AboutView() {
    const { about } = useSiteContent()
    const fill = useFillPlaceholders()

    return (
        <div className="space-y-20 pb-20">
            <section
                className={cn(
                    CONTAINER,
                    'relative isolate grid gap-12 pt-12 lg:grid-cols-2 lg:pt-20',
                )}
            >
                <div
                    aria-hidden="true"
                    className="absolute -top-16 right-0 -z-10 size-80 rounded-full bg-gold-100 opacity-80 blur-3xl"
                />

                <div className="space-y-6">
                    <p className="flex items-center gap-3 text-[11px] font-bold tracking-[0.28em] text-gold-700 uppercase sm:text-xs">
                        <span aria-hidden="true" className="h-px w-8 bg-gold-500" />
                        {about.badge}
                    </p>

                    <h1 className="font-display text-[2.6rem] leading-[1.02] font-semibold text-balance text-ink sm:text-5xl lg:text-6xl">
                        <HighlightedText text={about.title} />
                    </h1>

                    {about.paragraphs.map((paragraph, index) => (
                        <p
                            key={index}
                            className={
                                index === 0
                                    ? 'font-display text-2xl leading-snug text-ink'
                                    : 'leading-relaxed text-ink-soft'
                            }
                        >
                            {fill(paragraph)}
                        </p>
                    ))}

                    <ButtonLink to={ROUTES.contact} size="lg">
                        {about.ctaLabel}
                    </ButtonLink>
                </div>

                <div className="relative mx-auto w-full max-w-sm px-4">
                    <PerfumeArt notes={false} />
                    <Sticker tone="butter" size="lg" className="absolute bottom-6 left-0 shadow-lift">
                        {about.imageBadge}
                    </Sticker>
                </div>
            </section>

            <section aria-labelledby="values-heading" className={cn(CONTAINER, 'space-y-10')}>
                <SectionHeading
                    headingId="values-heading"
                    eyebrow={about.valuesEyebrow}
                    title={about.valuesTitle}
                    description={about.valuesDescription}
                />
                <ValuesGrid values={about.values} />
            </section>

            <section aria-labelledby="stats-heading" className={cn(CONTAINER, 'space-y-10')}>
                <SectionHeading
                    headingId="stats-heading"
                    eyebrow={about.statsEyebrow}
                    title={about.statsTitle}
                    align="center"
                />
                <StatsRow stats={about.stats} />
            </section>
        </div>
    )
}
