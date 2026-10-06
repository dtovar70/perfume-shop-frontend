/**
 * Shared shell for the text-entry fields (Input, Textarea, Select).
 *
 * The focus treatment is deliberately one element: the hairline border turns gold and a soft
 * champagne halo hugs it. A coloured border *plus* an offset ring reads as two stacked outlines.
 */
export const FIELD_BASE_CLASS =
    'w-full border border-line bg-white text-base text-ink shadow-[0_1px_0_rgb(43_31_36/0.02)] transition placeholder:text-ink-soft/70 hover:border-rose-200 focus-visible:border-gold-500 focus-visible:ring-4 focus-visible:outline-none focus-visible:ring-gold-200/60 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60'

/** Field label; `OptionalMark` sits inline after the text when a field can be left empty. */
export const FIELD_LABEL_CLASS = 'text-sm font-semibold text-ink'

/** One helper style for every field: small, muted, directly under the control. */
export const FIELD_HINT_CLASS = 'text-xs leading-snug text-ink-soft'

/** Validation message under a field; replaces the hint while it is shown. */
export const FIELD_MESSAGE_ERROR_CLASS = 'text-sm font-medium text-rose-700'

/** Invalid fields keep the halo but swap both layers to rose. */
export const FIELD_ERROR_CLASS = 'border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-200'
