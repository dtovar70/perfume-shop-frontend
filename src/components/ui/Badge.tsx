import type { HTMLAttributes, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/utils/cn'

const badgeVariants = cva(
    'inline-flex items-center gap-1 rounded-full font-semibold tracking-[0.06em] whitespace-nowrap',
    {
        variants: {
            tone: {
                // Tone names are API values (order statuses); only their look is ours.
                blush: 'bg-rose-100 text-rose-800',
                sky: 'bg-stone-100 text-stone-700',
                mint: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/70',
                butter: 'bg-gold-100 text-gold-800',
                lilac: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
                solid: 'gradient-rose text-white',
                neutral: 'bg-line/70 text-ink-soft',
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
