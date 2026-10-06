import { SectionHeading } from '@/components/shared/SectionHeading'
import { Card } from '@/components/ui'
import { CONTAINER } from '@/constants/layout.constant'
import { cn } from '@/utils/cn'
import { useSiteContent } from '@/utils/hooks/useSiteContent'

/** "Cómo comprar": the steps edited in Admin > Contenido > Inicio, as numbered cards. */
export function HowItWorks() {
    const { home } = useSiteContent()

    if (home.steps.length === 0) return null

    return (
        <section
            aria-labelledby="how-heading"
            className="border-y border-line bg-surface py-16 lg:py-24"
        >
            <div className={cn(CONTAINER, 'space-y-10')}>
                <SectionHeading
                    headingId="how-heading"
                    eyebrow={home.stepsEyebrow}
                    title={home.stepsTitle}
                    align="center"
                    description={home.stepsDescription}
                />

                <ol className="grid gap-5 md:grid-cols-3 md:gap-6">
                    {home.steps.map((step, index) => (
                        <li key={index} className="h-full">
                            <Card tone="elevated" className="flex h-full flex-col gap-3">
                                <span className="flex size-12 items-center justify-center rounded-full bg-cherry-500 font-display text-xl font-bold text-on-cherry shadow-glow">
                                    {index + 1}
                                </span>
                                <h3 className="font-display text-xl text-fg">{step.title}</h3>
                                <p className="text-sm leading-relaxed text-fg-soft">
                                    {step.description}
                                </p>
                            </Card>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    )
}
