/**
 * Hex mirror of the `--theme-*` palettes in `index.css`, one per theme. Styling never reads
 * these (utility classes and `var(--theme-*)` follow `data-theme` on their own); they exist for
 * places that need a literal value, such as `<meta name="theme-color">`. Keep both files in sync.
 */
export const THEMES = ['dark', 'light'] as const

export type Theme = (typeof THEMES)[number]

/** localStorage key for the visitor's explicit choice (also read by the script in index.html). */
export const THEME_STORAGE_KEY = 'kaizen-theme'

export const PALETTES = {
    dark: {
        canvas: '#0B0B0D',
        surface: '#141417',
        elevated: '#1C1C21',
        line: '#2A2A31',
        lineStrong: '#3A3A43',
        fg: '#F5F5F7',
        fgSoft: '#A1A1AA',
        fgMuted: '#8B8B94',
        accent: '#FF6FA0',
        accentStrong: '#FF9CBF',
        cherry500: '#D6336C',
        cherry600: '#C42A60',
        onCherry: '#FFFFFF',
        success: '#34D399',
        warning: '#FBBF24',
        danger: '#F87171',
    },
    light: {
        canvas: '#FAFAFA',
        surface: '#FFFFFF',
        elevated: '#F4F4F5',
        line: '#E4E4E7',
        lineStrong: '#D4D4D8',
        fg: '#18181B',
        fgSoft: '#52525B',
        fgMuted: '#6B6B75',
        accent: '#C42A60',
        accentStrong: '#A3214F',
        cherry500: '#D6336C',
        cherry600: '#C42A60',
        onCherry: '#FFFFFF',
        success: '#047857',
        warning: '#9A4A06',
        danger: '#B91C1C',
    },
} as const satisfies Record<Theme, Record<string, string>>

export type PaletteKey = keyof (typeof PALETTES)['dark']

/** Browser chrome color per theme: the page canvas, so the address bar blends in. */
export const THEME_COLOR: Record<Theme, string> = {
    dark: PALETTES.dark.canvas,
    light: PALETTES.light.canvas,
}
