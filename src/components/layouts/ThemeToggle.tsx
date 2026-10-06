import { type MouseEvent } from 'react'
import { Moon, Sun } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

import { HeaderIconButton } from '@/components/layouts/HeaderIconButton'
import { themeToggleLabel, useTheme } from '@/store/themeStore'

export interface ThemeToggleProps {
    className?: string
}

/**
 * Sun/moon switch between the dark and light themes, on the header's 44px round button (same
 * cherry hover ring). Dark mode shows the sun (the way out), light mode the moon; the icons
 * cross-fade with a turn and a scale, or just fade with reduced motion.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
    const { isDark, toggleTheme } = useTheme()
    const reduceMotion = useReducedMotion()

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
        const rect = event.currentTarget.getBoundingClientRect()
        toggleTheme({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
    }

    const hidden = reduceMotion ? { opacity: 0 } : { opacity: 0, rotate: -90, scale: 0.4 }
    const shown = reduceMotion ? { opacity: 1 } : { opacity: 1, rotate: 0, scale: 1 }
    const leaving = reduceMotion ? { opacity: 0 } : { opacity: 0, rotate: 90, scale: 0.4 }

    return (
        <HeaderIconButton
            onClick={handleClick}
            label={themeToggleLabel(isDark)}
            className={className}
            icon={
                <span className="relative grid size-5 place-items-center">
                    <AnimatePresence initial={false} mode="popLayout">
                        <motion.span
                            key={isDark ? 'sun' : 'moon'}
                            initial={hidden}
                            animate={shown}
                            exit={leaving}
                            transition={{ duration: reduceMotion ? 0.12 : 0.35, ease: 'easeOut' }}
                            className="absolute inset-0 grid place-items-center"
                        >
                            {isDark ? (
                                <Sun aria-hidden="true" className="size-5" />
                            ) : (
                                <Moon aria-hidden="true" className="size-5" />
                            )}
                        </motion.span>
                    </AnimatePresence>
                </span>
            }
        />
    )
}
