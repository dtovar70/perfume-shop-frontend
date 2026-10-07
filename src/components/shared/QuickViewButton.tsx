import { Eye } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

import type { Product } from '@/@types/product'
import { useQuickView } from '@/store/uiStore'
import { cn } from '@/utils/cn'
import { productDetailQueryOptions } from '@/views/product/hooks/useProduct'

/** The visible control is 32px (36px from `sm`); the pseudo-element makes the hit area 44px. */
const HIT_AREA = "after:absolute after:-inset-1.5 after:content-[''] sm:after:-inset-1"

export interface QuickViewButtonProps {
    product: Product
    className?: string
}

/**
 * "Vista rápida": opens the product in a dialog without leaving the list. A sibling of the
 * card's stretched link (never nested in it), like the cart "+".
 */
export function QuickViewButton({ product, className }: QuickViewButtonProps) {
    const { open } = useQuickView()
    const queryClient = useQueryClient()

    return (
        <button
            type="button"
            aria-haspopup="dialog"
            aria-label={`Vista rápida: ${product.name}`}
            title="Vista rápida"
            onClick={() => {
                // Lists and the detail share one product shape: the card's copy paints the dialog
                // at once, marked stale (`updatedAt: 0`) so the dialog refreshes it on open.
                const { queryKey } = productDetailQueryOptions(product.slug)
                if (!queryClient.getQueryData(queryKey)) {
                    queryClient.setQueryData(queryKey, product, { updatedAt: 0 })
                }
                open(product.slug)
            }}
            className={cn(
                'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-line bg-surface/90 text-fg-soft shadow-soft backdrop-blur-sm transition duration-200 hover:border-cherry-500/50 hover:text-accent sm:size-9',
                HIT_AREA,
                className,
            )}
        >
            <Eye aria-hidden="true" className="size-4" />
        </button>
    )
}
