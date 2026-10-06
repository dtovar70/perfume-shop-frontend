import type { HTMLAttributes, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/utils/cn'

const badgeVariants = cva(
    'inline-flex items-center gap-1 rounded-full font-semibold tracking-[0.06em] whitespace-nowrap',
    {
        variants: {
            tone: {
                // Tone names are API values (order statuses); only their look is ours.
                blush: 'bg-cherry-tint text-accent-strong ring-1 ring-cherry-500/25',
                sky: 'bg-elevated text-fg-soft ring-1 ring-line',
                mint: 'bg-success/10 text-success ring-1 ring-success/30',
                butter: 'bg-warning/10 text-warning ring-1 ring-warning/30',
                lilac: 'bg-elevated text-accent-strong ring-1 ring-cherry-500/30',
                solid: 'bg-cherry-500 text-on-cherry',
                neutral: 'bg-elevated text-fg-soft ring-1 ring-line',
            },
            size: {
                sm: 'px-2.5 py-0.5 text-[11px]',
                md: 'px-3 py-1 text-xs',
            },
        },
        defaultVariants: {
            tone: 'blush',
            size: 'md',
        },
    },
)

export interface BadgeProps
    extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
    children: ReactNode
}

export function Badge({ tone, size, className, children, ...rest }: BadgeProps) {
    return (
        <span className={cn(badgeVariants({ tone, size }), className)} {...rest}>
            {children}
        </span>
    )
}
