import { cva } from 'class-variance-authority'

import type { ProductVariant } from '@/@types/product'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/formatCurrency'
import { isVariantSoldOut } from '@/utils/productStock'
import { variantDisplayLabel } from '@/utils/variantLabel'

const optionVariants = cva(
    'relative flex min-h-14 min-w-24 cursor-pointer flex-col items-center justify-center rounded-xl border px-4 py-2 text-center transition duration-200 has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-cherry-500',
    {
        variants: {
            isSelected: {
                true: 'border-cherry-500 bg-elevated text-accent-strong ring-1 ring-cherry-500',
                false: 'border-line bg-surface text-fg hover:border-cherry-500/50',
            },
            isSoldOut: {
                true: 'cursor-not-allowed border-dashed border-line bg-canvas text-fg-muted hover:border-line',
                false: '',
            },
        },
        defaultVariants: { isSelected: false, isSoldOut: false },
    },
)

export interface VariantPickerProps {
    /** Sold-out versions stay visible but disabled, marked "Agotado". */
    variants: ProductVariant[]
    /** The product's base price; each option shows its own final price when they differ. */
    basePrice: number
    selectedVariantId?: string
    onSelect: (variantId: string) => void
}

/** Size picker: one card per bottle size (or version), with its price when prices differ. */
export function VariantPicker({
    variants,
    basePrice,
    selectedVariantId,
    onSelect,
}: VariantPickerProps) {
    // A single version is not a choice.
    if (variants.length < 2) return null
    const showPrices = new Set(variants.map((variant) => variant.priceDelta)).size > 1
    const bySize = variants.every((variant) => variant.volumeMl)

    return (
        <fieldset className="space-y-3">
            <legend className="text-[11px] font-bold tracking-[0.22em] text-accent uppercase">
                {bySize ? 'Tamaño' : 'Presentación'}
            </legend>

            <div className="flex flex-wrap gap-2">
                {variants.map((variant) => {
                    const isSoldOut = isVariantSoldOut(variant)
                    const isSelected = !isSoldOut && variant.id === selectedVariantId
                    return (
                        <label
                            key={variant.id}
                            // tailwind-merge lets the sold-out look override the unselected one.
                            className={cn(optionVariants({ isSelected, isSoldOut }))}
                        >
                            <input
                                type="radio"
                                name="variant"
                                className="sr-only"
                                value={variant.id}
                                checked={isSelected}
                                disabled={isSoldOut}
                                onChange={() => onSelect(variant.id)}
                            />
                            <span className={cn('text-sm font-bold', isSoldOut && 'line-through')}>
                                {variantDisplayLabel(variant)}
                            </span>
                            {isSoldOut ? (
                                <span className="text-[11px] font-semibold text-accent">
                                    Agotado
                                </span>
                            ) : showPrices ? (
                                <span className="text-xs text-fg-soft tabular-nums">
                                    {formatCurrency(basePrice + variant.priceDelta)}
                                </span>
                            ) : null}
                        </label>
                    )
                })}
            </div>
        </fieldset>
    )
}
