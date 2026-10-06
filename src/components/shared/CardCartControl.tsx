import { Minus, Plus } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

import type { Product, ProductVariant } from '@/@types/product'
import { MAX_LINE_QUANTITY, useCartActions, useCartItems } from '@/store/cartStore'
import { cn } from '@/utils/cn'
import { useFlyToCart } from '@/utils/hooks/useFlyToCart'
import { stockOf } from '@/utils/productStock'

/** The visible control is compact; this pseudo-element grows each hit area to >= 44px. */
const HIT_AREA = "after:absolute after:-inset-1.5 after:content-['']"

export interface CardCartControlProps {
    product: Product
    /** Omitted for a product without variants. */
    variant?: ProductVariant
    className?: string
}

/**
 * The card's cart control: a round "+" (40px) that adds the default version, which turns into a
 * compact −/qty/+ stepper bound to that cart line once it is in the cart.
 */
export function CardCartControl({ product, variant, className }: CardCartControlProps) {
    const items = useCartItems()
    const { addItem, updateQuantity } = useCartActions()
    const reduceMotion = useReducedMotion()
    const flyToCart = useFlyToCart()
    const variantId = variant?.id ?? ''
    const line = items.find((item) => item.productId === product.id && item.variantId === variantId)
    const max = Math.min(stockOf(product, variant), MAX_LINE_QUANTITY)
    const transition = { duration: reduceMotion ? 0 : 0.22, ease: 'easeOut' } as const

    return (
        <div className={cn('relative z-10', className)}>
            <AnimatePresence mode="popLayout" initial={false}>
                {line ? (
                    <motion.div
                        key="stepper"
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={transition}
                        className="flex h-9 w-24 items-center justify-between rounded-full bg-cherry-500 text-on-cherry shadow-glow"
                    >
                        <button
                            type="button"
                            onClick={() => updateQuantity(line.lineId, line.quantity - 1)}
                            aria-label={
                                line.quantity === 1
                                    ? `Quitar ${product.name} del carrito`
                                    : `Quitar una unidad de ${product.name}`
                            }
                            className={cn(
                                'relative flex size-9 items-center justify-center rounded-full transition hover:bg-on-cherry/15',
                                HIT_AREA,
                            )}
                        >
                            <Minus aria-hidden="true" className="size-3.5" />
                        </button>
                        <output
                            aria-live="polite"
                            aria-label={`${line.quantity} en el carrito`}
                            className="min-w-4 text-center text-sm font-bold tabular-nums"
                        >
                            {line.quantity}
                        </output>
                        <button
                            type="button"
                            onClick={(event) => {
                                flyToCart({
                                    trigger: event.currentTarget,
                                    productId: product.id,
                                    productName: product.name,
                                })
                                updateQuantity(line.lineId, line.quantity + 1, max)
                            }}
                            disabled={line.quantity >= max}
                            aria-label={`Agregar una unidad de ${product.name}`}
                            className={cn(
                                'relative flex size-9 items-center justify-center rounded-full transition hover:bg-on-cherry/15 disabled:opacity-40',
                                HIT_AREA,
                            )}
                        >
                            <Plus aria-hidden="true" className="size-3.5" />
                        </button>
                    </motion.div>
                ) : (
                    <motion.button
                        key="add"
                        type="button"
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={transition}
                        onClick={(event) => {
                            flyToCart({
                                trigger: event.currentTarget,
                                productId: product.id,
                                productName: product.name,
                            })
                            addItem(product, variantId, 1)
                        }}
                        aria-label={`Agregar ${product.name} al carrito`}
                        className={cn(
                            'relative flex size-10 items-center justify-center rounded-full border border-line-strong bg-surface text-fg shadow-soft transition-colors duration-300 group-hover:border-transparent group-hover:bg-cherry-500 group-hover:text-on-cherry hover:bg-cherry-600',
                            HIT_AREA,
                        )}
                    >
                        <Plus aria-hidden="true" className="size-4.5" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    )
}
