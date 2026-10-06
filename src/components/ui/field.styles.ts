/**
 * Shared shell for the text-entry fields (Input, Textarea, Select).
 *
 * The focus treatment is deliberately one element: the border turns cherry and a soft halo
 * hugs it. A coloured border *plus* an offset ring reads as two stacked outlines.
 */
export const FIELD_BASE_CLASS =
    'w-full border border-field-line bg-field text-base text-fg transition placeholder:text-fg-muted hover:border-field-line-hover focus-visible:border-cherry-500 focus-visible:ring-4 focus-visible:ring-cherry-500/20 focus-visible:ring-offset-0 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60'

/** Field label; `OptionalMark` sits inline after the text when a field can be left empty. */
export const FIELD_LABEL_CLASS = 'text-sm font-semibold text-fg'

/** One helper style for every field: small, muted, directly under the control. */
export const FIELD_HINT_CLASS = 'text-xs leading-snug text-fg-soft'

/** Validation message under a field; replaces the hint while it is shown. */
export const FIELD_MESSAGE_ERROR_CLASS = 'text-sm font-medium text-danger'

/** Invalid fields keep the halo but swap both layers to the danger red. */
export const FIELD_ERROR_CLASS =
    'border-danger/70 focus-visible:border-danger focus-visible:ring-danger/20'
