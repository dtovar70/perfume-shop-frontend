import { useCallback } from 'react'

import { flyToCart, type FlyToCartOptions } from '@/utils/flyToCart'

/**
 * The fly-to-cart effect for a click handler. Call it before `addItem` so the picture is
 * measured where the customer saw it; flights outlive the calling component (a card's "+"
 * turns into a stepper at once) and are cleaned up by `FlyToCartLayer`.
 */
export function useFlyToCart(): (options: FlyToCartOptions) => void {
    return useCallback((options: FlyToCartOptions) => flyToCart(options), [])
}
