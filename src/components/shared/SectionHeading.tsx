import type { ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { HighlightedText } from '@/components/shared/HighlightedText'
import { cn } from '@/utils/cn'

const headingVariants = cva('font-display leading-[1.05] font-semibold text-balance text-ink', {
    variants: {
        level: {
            h1: 'text-[2.6rem] sm:text-5xl lg:text-6xl',
            h2: 'text-[2.1rem] sm:text-[2.6rem] lg:text-5xl',
            h3: 'text-2xl sm:text-3xl',
        },
    },
    defaultVariants: {
        level: 'h2',
    },
})

export interface SectionHeadingProps extends VariantProps<typeof headingVariants> {
    /** Words between asterisks are set in rose italic: "Tus *favoritos*". */
    title: string
    /** Applied to the heading element so a section can reference it with aria-labelledby. */
    headingId?: string
    eyebrow?: string
    description?: string
    align?: 'left' | 'center'
    action?: ReactNode
    className?: string
}

export function SectionHeading({
    title,
    headingId,
    eyebrow,
    description,
    align = 'left',
    level = 'h2',
    action,
    className,
}: SectionHeadingProps) {
    const Heading = level ?? 'h2'

    return (
        <div
            className={cn(
                'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
                align === 'center' && 'sm:flex-col sm:items-center sm:text-center',
                className,
            )}
        >
            <div className={cn('max-w-2xl space-y-3', align === 'center' && 'mx-auto')}>
                {eyebrow ? (
                    <p
                        className={cn(
                            'flex items-center gap-3 text-[11px] font-bold tracking-[0.28em] text-gold-700 uppercase sm:text-xs',
                            align === 'center' && 'sm:justify-center',
                        )}
                    >
                        <span aria-hidden="true" className="h-px w-8 bg-gold-400" />
                        {eyebrow}
                        {align === 'center' ? (
                            <span aria-hidden="true" className="h-px w-8 bg-gold-400 max-sm:hidden" />
                        ) : null}
                    </p>
                ) : null}

                <Heading id={headingId} className={headingVariants({ level })}>
                    <HighlightedText text={title} />
                </Heading>

                {description ? (
                    <p className="text-[15px] leading-relaxed text-ink-soft sm:text-base">
                        {description}
                    </p>
                ) : null}
            </div>

            {action ? <div className="shrink-0">{action}</div> : null}
        </div>
    )
}
