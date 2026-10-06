import type { HTMLAttributes, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/utils/cn'

const stickerVariants = cva(
    'inline-flex items-center justify-center rounded-full border border-white/70 font-sans font-bold tracking-[0.08em] uppercase shadow-soft',
    {
        variants: {
            tone: {
                blush: 'gradient-rose text-white',
                sky: 'bg-ink text-ivory',
                butter: 'gradient-gold text-ink',
                mint: 'bg-emerald-700 text-white',
                lilac: 'bg-rose-100 text-rose-800',
            },
            size: {
                sm: 'px-2.5 py-1 text-[10px]',
                md: 'px-3 py-1 text-[11px]',
                lg: 'px-4 py-1.5 text-xs',
            },
            rotation: {
                left: '-rotate-2',
                right: 'rotate-2',
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
