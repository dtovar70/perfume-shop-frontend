import { cn } from '@/utils/cn'

/** At or below this many units the product reads "Últimas unidades". */
export const LOW_STOCK_THRESHOLD = 3

export interface StockStateProps {
    stock: number
    className?: string
}

/** "Disponible" (green), "Últimas unidades" (gold) or "Agotado" (rose), with a dot. */
export function StockState({ stock, className }: StockStateProps) {
    const state =
        stock <= 0
            ? { label: 'Agotado', dot: 'bg-rose-600', text: 'text-rose-800' }
            : stock <= LOW_STOCK_THRESHOLD
              ? { label: 'Últimas unidades', dot: 'bg-gold-500', text: 'text-gold-800' }
              : { label: 'Disponible', dot: 'bg-emerald-600', text: 'text-emerald-800' }

    return (
        <p className={cn('inline-flex items-center gap-2 text-sm font-bold', state.text, className)}>
            <span className="relative flex size-2.5">
                {stock > 0 ? (
                    <span
                        aria-hidden="true"
                        className={cn(
                            'absolute inset-0 animate-ping rounded-full opacity-40 motion-reduce:animate-none',
                            state.dot,
                        )}
                    />
                ) : null}
                <span aria-hidden="true" className={cn('relative size-2.5 rounded-full', state.dot)} />
            </span>
            {state.label}
        </p>
    )
}
