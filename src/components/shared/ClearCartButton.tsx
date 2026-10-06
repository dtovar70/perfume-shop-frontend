import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'

import { Button } from '@/components/ui'
import { useCartActions } from '@/store/cartStore'
import { cn } from '@/utils/cn'

/** How long the button stays armed before it falls back to its idle state. */
const CONFIRM_TIMEOUT_MS = 4000

export interface ClearCartButtonProps {
    itemCount: number
    className?: string
}

/**
 * "Vaciar carrito". Emptying cannot be undone, so the button arms itself first and only wipes
 * on a second, explicit confirmation.
 */
export function ClearCartButton({ itemCount, className }: ClearCartButtonProps) {
    const { clear } = useCartActions()
    const [isArmed, setIsArmed] = useState(false)

    useEffect(() => {
        if (!isArmed) return

        const timeout = window.setTimeout(() => setIsArmed(false), CONFIRM_TIMEOUT_MS)
        return () => window.clearTimeout(timeout)
    }, [isArmed])

    if (isArmed) {
        return (
            <div
                role="group"
                aria-label="Confirmar"
                className={cn('flex items-center gap-1.5', className)}
            >
                <span className="text-xs font-semibold text-fg-soft">¿Vaciar todo?</span>
                <Button size="sm" onClick={clear} className="h-9 px-3 text-xs">
                    Sí, vaciar
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsArmed(false)}
                    className="h-9 px-3 text-xs"
                >
                    No
                </Button>
            </div>
        )
    }

    return (
        <button
            type="button"
            aria-label={`Vaciar carrito (${itemCount} ${itemCount === 1 ? 'producto' : 'productos'})`}
            onClick={() => setIsArmed(true)}
            className={cn(
                'inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-fg-soft transition-colors hover:text-accent',
                className,
            )}
        >
            <Trash2 aria-hidden="true" className="size-4" />
            Vaciar carrito
        </button>
    )
}
