/**
 * Hex mirror of the `@theme` tokens in `index.css`. Inline SVG artwork (the bottle placeholder,
 * the loader) and `<meta name="theme-color">` need literal values, which utility classes cannot
 * provide. Keep both files in sync.
 */
export const PALETTE = {
    rose50: '#FDF6F7',
    rose100: '#FAE9EC',
    rose200: '#F4D3D9',
    rose300: '#EBB3BE',
    rose400: '#DD8C9C',
    rose500: '#C96B7E',
    rose600: '#B05468',
    rose700: '#8F4254',
    rose800: '#6E3442',
    rose900: '#4A2530',
    gold50: '#FBF7EF',
    gold100: '#F7EFE1',
    gold200: '#EEDCBC',
    gold300: '#E2C494',
    gold400: '#D4AB6D',
    gold500: '#C4954F',
    gold600: '#A77B3B',
    gold700: '#84602F',
    gold800: '#654A26',
    gold900: '#4A361C',
    ivory: '#FFFAF7',
    ink: '#2B1F24',
    inkSoft: '#6D5A61',
    line: '#EFE3E5',
    noir: '#1C1417',
} as const

export type PaletteKey = keyof typeof PALETTE

/** Mirror of the `--gradient-*` custom properties in `index.css`. */
export const GRADIENTS = {
    blush: 'linear-gradient(135deg, #fae9ec 0%, #fbf3ef 50%, #f7efe1 100%)',
    gold: 'linear-gradient(135deg, #ecd6ae 0%, #d9b479 45%, #c4954f 100%)',
    rose: 'linear-gradient(135deg, #b05468 0%, #8f4254 60%, #7a3949 100%)',
} as const
