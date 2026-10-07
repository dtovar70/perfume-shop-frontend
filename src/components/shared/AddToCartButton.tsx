import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { Check, ShoppingBag } from 'lucide-react'

import type { Product } from '@/@types/product'
import { Button, type ButtonProps } from '@/components/ui'
import { useCartActions, useCartItems } from '@/store/cartStore'
import { useCartDrawer } from '@/store/uiStore'
import { cartUnitsOf } from '@/utils/cartAvailability'
import { useFlyToCart } from '@/utils/hooks/useFlyToCart'
import { stockOf } from '@/utils/productStock'

const CONFIRMATION_MS = 1600

export interface AddToCartButtonProps extends Pick<
    ButtonProps,
    'size' | 'variant' | 'fullWidth' | 'className'
> {
    product: Product
    /** "" for a product without variants. */
    variantId: string
    quantity?: number
    label?: string
    /** Blocks adding for a reason of the caller. */
    disabled?: boolean
}

export function AddToCartButton({
    product,
    variantId,
    quantity = 1,
    label = 'Agregar al carrito',
    disabled = false,
    ...buttonProps
}: AddToCartButtonProps) {
    const { addItem } = useCartActions()
    const cartItems = useCartItems()
    const { open } = useCartDrawer()
    const flyToCart = useFlyToCart()
    const [isConfirming, setIsConfirming] = useState(false)
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

    useEffect(() => () => clearTimeout(timeoutRef.current), [])

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
        // Measured before the cart changes; the drawer waits for the landing, otherwise it
        // would cover the flight.
        flyToCart({
            trigger: event.currentTarget,
            productId: product.id,
            productName: product.name,
            onLand: open,
        })
        addItem(product, variantId, quantity)
        setIsConfirming(true)
        clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => setIsConfirming(false), CONFIRMATION_MS)
    }

    const variant = product.variants.find((candidate) => candidate.id === variantId)
    const stock = stockOf(product, variant)
    const isSoldOut = stock <= 0
    // Every unit left is already in the cart.
    const isAllInCart = !isSoldOut && cartUnitsOf(cartItems, product.id, variantId) >= stock

    return (
        <Button
            onClick={handleClick}
            disabled={disabled || isSoldOut || (isAllInCart && !isConfirming)}
            leadingIcon={
                isConfirming ? (
                    <Check aria-hidden="true" className="size-4" />
                ) : (
                    <ShoppingBag aria-hidden="true" className="size-4" />
                )
            }
            {...buttonProps}
        >
            {isSoldOut
                ? 'Agotado'
                : isConfirming
                  ? '¡Agregado!'
                  : isAllInCart
                    ? 'Ya está todo en tu carrito'
                    : label}
        </Button>
    )
}
