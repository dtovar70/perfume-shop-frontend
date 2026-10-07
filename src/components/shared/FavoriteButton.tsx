import { useState } from 'react'
import { Heart } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'

import type { Product } from '@/@types/product'
import { useFavoritesStore, useIsFavorite } from '@/store/favoritesStore'
import { cn } from '@/utils/cn'

/** The visible control may be compact; this pseudo-element grows the hit area to >= 44px. */
const HIT_AREA = "after:absolute after:-inset-1.5 after:content-[''] sm:after:-inset-1"
/** Module-level so re-renders never hand motion a "new" target (which would replay it). */
const POP = { scale: [0.6, 1.28, 1] }
const POP_TRANSITION = { duration: 0.38, ease: [0.34, 1.56, 0.64, 1] } as const

export interface FavoriteButtonProps {
    product: Product
    /**
     * `overlay`: a small round button over a photo (cards, quick view);
     * `inline`: a 48px outlined button beside other actions (product page).
     */
    appearance?: 'overlay' | 'inline'
    className?: string
}

/**
 * Heart toggle for the favorites list. Pops when it fills (no motion with reduced motion);
 * `aria-pressed` carries the state and the label says what pressing it will do.
 */
export function FavoriteButton({
    product,
    appearance = 'overlay',
    className,
}: FavoriteButtonProps) {
    const isFavorite = useIsFavorite(product.id)
    const toggle = useFavoritesStore((state) => state.toggle)
    const reduceMotion = useReducedMotion()
    // Bumped on each "add", so the pop replays only when the heart fills.
    const [popKey, setPopKey] = useState(0)

    const label = isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'

    return (
        <button
            type="button"
            aria-pressed={isFavorite}
            aria-label={`${label}: ${product.name}`}
            title={label}
            onClick={() => {
                if (!isFavorite) setPopKey((key) => key + 1)
                toggle(product)
            }}
            className={cn(
                'relative z-10 flex shrink-0 items-center justify-center rounded-full transition-colors duration-200',
                appearance === 'overlay'
                    ? cn(
                          'size-8 border border-line bg-surface/90 shadow-soft backdrop-blur-sm hover:border-cherry-500/50 sm:size-9',
                          HIT_AREA,
                      )
                    : 'size-12 border border-line-strong bg-transparent hover:border-cherry-500/60 hover:bg-cherry-tint',
                isFavorite ? 'text-cherry-500' : 'text-fg-soft hover:text-accent',
                className,
            )}
        >
            <motion.span
                key={popKey}
                className="relative flex"
                // Remounted by `popKey`: the first render stays still, each new key pops.
                initial={popKey > 0 ? undefined : false}
                animate={popKey > 0 && !reduceMotion ? POP : undefined}
                transition={POP_TRANSITION}
            >
                <Heart
                    aria-hidden="true"
                    className={cn(appearance === 'overlay' ? 'size-4' : 'size-5')}
                    fill={isFavorite ? 'currentColor' : 'none'}
                    strokeWidth={2}
                />
                {popKey > 0 && isFavorite && !reduceMotion ? (
                    <motion.span
                        key={`ring-${popKey}`}
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 rounded-full border-2 border-cherry-500"
                        initial={{ scale: 0.6, opacity: 0.7 }}
                        animate={{ scale: 2.1, opacity: 0 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                ) : null}
            </motion.span>
        </button>
    )
}
