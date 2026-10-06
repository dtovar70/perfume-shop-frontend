import { flushSync } from 'react-dom'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

import { THEME_COLOR, THEME_STORAGE_KEY, type Theme } from '@/constants/theme.constant'

/**
 * Single source of truth for the color theme. The inline script in index.html applies the
 * initial theme before first paint; this store picks it up from `<html data-theme>`, keeps
 * following the OS preference until the visitor chooses, and persists that choice.
 */

const SYSTEM_LIGHT_QUERY = '(prefers-color-scheme: light)'

function isTheme(value: unknown): value is Theme {
    return value === 'light' || value === 'dark'
}

function readStoredTheme(): Theme | null {
    try {
        const value = window.localStorage.getItem(THEME_STORAGE_KEY)
        return isTheme(value) ? value : null
    } catch {
        return null
    }
}

function storeTheme(theme: Theme) {
    try {
        window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
        // Private mode or blocked storage: the choice simply lasts for this visit.
    }
}

function systemTheme(): Theme {
    try {
        return window.matchMedia(SYSTEM_LIGHT_QUERY).matches ? 'light' : 'dark'
    } catch {
        return 'dark'
    }
}

function initialTheme(): Theme {
    if (typeof document === 'undefined') return 'dark'
    const applied = document.documentElement.dataset.theme
    if (isTheme(applied)) return applied
    return readStoredTheme() ?? systemTheme()
}

/** Writes the theme to the DOM: `data-theme`, `color-scheme` and the browser chrome color. */
function applyTheme(theme: Theme) {
    const root = document.documentElement
    root.dataset.theme = theme
    root.style.colorScheme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme])
    document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', theme)
}

/**
 * Applies a theme with every CSS transition paused for one frame, so the page flips at once
 * instead of fading each element at its own speed.
 */
function applyWithoutTransitions(theme: Theme) {
    const root = document.documentElement
    root.setAttribute('data-theme-switching', '')
    applyTheme(theme)
    // Force a style flush while transitions are off, then re-enable them on the next frame.
    void root.offsetHeight
    window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => root.removeAttribute('data-theme-switching'))
    })
}

function prefersReducedMotion() {
    try {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    } catch {
        return true
    }
}

/** Where the circular reveal starts: the center of the control that was clicked. */
export interface ThemeRevealOrigin {
    x: number
    y: number
}

interface ThemeState {
    theme: Theme
    /** True once the visitor picked a theme; until then the OS preference is followed. */
    hasUserChoice: boolean
    setTheme: (theme: Theme, origin?: ThemeRevealOrigin) => void
    toggleTheme: (origin?: ThemeRevealOrigin) => void
}

export const useThemeStore = create<ThemeState>()((set, get) => ({
    theme: initialTheme(),
    hasUserChoice: typeof window !== 'undefined' && readStoredTheme() !== null,

    setTheme: (theme, origin) => {
        storeTheme(theme)
        if (theme === get().theme) {
            set({ hasUserChoice: true })
            return
        }

        const commit = () => {
            flushSync(() => set({ theme, hasUserChoice: true }))
            applyWithoutTransitions(theme)
        }

        // A circle grows from the toggle when the browser supports view transitions.
        if (!origin || prefersReducedMotion() || !document.startViewTransition) {
            commit()
            return
        }

        const transition = document.startViewTransition(commit)
        const radius = Math.hypot(
            Math.max(origin.x, window.innerWidth - origin.x),
            Math.max(origin.y, window.innerHeight - origin.y),
        )
        transition.ready
            .then(() => {
                document.documentElement.animate(
                    {
                        clipPath: [
                            `circle(0px at ${origin.x}px ${origin.y}px)`,
                            `circle(${radius}px at ${origin.x}px ${origin.y}px)`,
                        ],
                    },
                    {
                        duration: 480,
                        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
                        pseudoElement: '::view-transition-new(root)',
                    },
                )
            })
            .catch(() => {
                // The transition was skipped; the theme is already applied.
            })
    },

    toggleTheme: (origin) => get().setTheme(get().theme === 'dark' ? 'light' : 'dark', origin),
}))

/** Follows live OS theme changes until the visitor makes an explicit choice. */
if (typeof window !== 'undefined') {
    applyTheme(useThemeStore.getState().theme)
    try {
        window.matchMedia(SYSTEM_LIGHT_QUERY).addEventListener('change', (event) => {
            if (useThemeStore.getState().hasUserChoice) return
            const theme: Theme = event.matches ? 'light' : 'dark'
            useThemeStore.setState({ theme })
            applyWithoutTransitions(theme)
        })
    } catch {
        // Very old browsers: the initial preference still applies.
    }
}

export function useTheme() {
    return useThemeStore(
        useShallow((state) => ({
            theme: state.theme,
            isDark: state.theme === 'dark',
            setTheme: state.setTheme,
            toggleTheme: state.toggleTheme,
        })),
    )
}

/** The toggle's label names the action, so it always describes the theme it switches to. */
export function themeToggleLabel(isDark: boolean) {
    return isDark ? 'Activar modo claro' : 'Activar modo oscuro'
}
