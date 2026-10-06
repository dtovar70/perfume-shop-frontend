import type { HTMLAttributes, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/utils/cn'

const stickerVariants = cva(
    'inline-flex items-center justify-center rounded-full border border-fg/10 font-display font-semibold shadow-soft',
    {
        variants: {
            tone: {
                blush: 'bg-cherry-500 text-on-cherry',
                sky: 'bg-fg text-canvas',
                butter: 'bg-elevated text-accent-strong',
                mint: 'bg-success text-canvas',
                lilac: 'bg-cherry-tint text-accent-strong',
            },
            size: {
                sm: 'px-2.5 py-1 text-[10px]',
                md: 'px-3 py-1 text-[11px]',
                lg: 'px-4 py-1.5 text-xs',
            },
            rotation: {
                left: '-rotate-6',
                right: 'rotate-6',
                none: 'rotate-0',
            },
        },
        defaultVariants: {
            tone: 'blush',
            size: 'md',
            rotation: 'none',
        },
    },
)

export interface StickerProps
    extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof stickerVariants> {
    children: ReactNode
}

export function Sticker({ tone, size, rotation, className, children, ...rest }: StickerProps) {
    return (
        <span className={cn(stickerVariants({ tone, size, rotation }), className)} {...rest}>
            {children}
        </span>
    )
}
