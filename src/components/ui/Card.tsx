import type { HTMLAttributes, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/utils/cn'

const cardVariants = cva('rounded-card border transition duration-300', {
    variants: {
        tone: {
            surface: 'border-line bg-surface',
            elevated: 'border-line bg-elevated',
            cherry: 'border-cherry-500/25 bg-cherry-tint',
        },
        elevation: {
            none: '',
            soft: 'shadow-soft',
            lift: 'shadow-lift',
        },
        interactive: {
            true: 'hover:-translate-y-1 hover:border-cherry-500/30 hover:shadow-lift motion-reduce:transform-none motion-reduce:transition-none',
            false: '',
        },
        padding: {
            none: '',
            sm: 'p-4',
            md: 'p-6',
            lg: 'p-8',
        },
    },
    defaultVariants: {
        tone: 'surface',
        elevation: 'soft',
        interactive: false,
        padding: 'md',
    },
})

export interface CardProps
    extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
    children: ReactNode
}

export function Card({
    tone,
    elevation,
    interactive,
    padding,
    className,
    children,
    ...rest
}: CardProps) {
    return (
        <div
            className={cn(cardVariants({ tone, elevation, interactive, padding }), className)}
            {...rest}
        >
            {children}
        </div>
    )
}
