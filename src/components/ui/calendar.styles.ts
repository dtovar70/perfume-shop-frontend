import type { ClassNames } from 'react-day-picker'

/*
 * Brand styling shared by every react-day-picker calendar (DatePicker, DateRangePicker). Kept
 * out of the ui barrel for the same reason as the pickers: it only matters where a calendar is.
 */

const NAV_BUTTON_CLASS =
    'flex size-8 items-center justify-center rounded-full text-fg-soft transition hover:bg-cherry-tint hover:text-accent focus-visible:ring-2 focus-visible:ring-cherry-500 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-30 aria-disabled:pointer-events-none aria-disabled:opacity-30'

/**
 * Month grid, navigation, today dot and disabled days; modes add their own selection look.
 * Today is tinted cherry only while unselected, so a picked today stays dark on cherry. Days are
 * 36px, so two months plus the range presets fit a 600px-tall window.
 */
export const CALENDAR_CLASSES: Partial<ClassNames> = {
    root: 'group/calendar relative',
    // Side by side: the pickers only ask for a second month where it fits.
    months: 'relative flex gap-6',
    month: 'space-y-1',
    month_caption: 'flex h-8 items-center justify-center',
    caption_label: 'font-display text-lg font-semibold text-fg capitalize',
    nav: 'absolute inset-x-0 top-0 z-10 flex h-8 items-center justify-between',
    button_previous: NAV_BUTTON_CLASS,
    button_next: NAV_BUTTON_CLASS,
    month_grid: 'border-collapse',
    weekdays: '',
    weekday: 'h-6 w-9 text-[0.65rem] font-bold text-fg-muted uppercase',
    week: '',
    day: 'p-0 text-center text-sm',
    day_button:
        'relative mx-auto flex size-9 items-center justify-center rounded-full font-semibold text-fg transition-colors hover:bg-cherry-tint hover:text-accent-strong focus-visible:ring-2 focus-visible:ring-cherry-500 focus-visible:ring-offset-1 focus-visible:outline-none',
    today: '[&:not([data-selected])>button]:text-accent [&>button]:after:absolute [&>button]:after:bottom-0.5 [&>button]:after:left-1/2 [&>button]:after:size-1 [&>button]:after:-translate-x-1/2 [&>button]:after:rounded-full [&>button]:after:bg-current',
    selected: '',
    disabled:
        '[&>button]:cursor-not-allowed [&>button]:text-fg-muted/50 [&>button]:hover:bg-transparent [&>button]:hover:text-fg-muted/50',
    outside: 'invisible',
    hidden: 'invisible',
    focused: '',
}

/** A picked day on its own: the solid rose dot (also the ends of a range). */
export const CALENDAR_SELECTED_DAY_CLASS =
    '[&>button]:bg-cherry-500 [&>button]:text-on-cherry [&>button]:shadow-soft [&>button]:hover:bg-cherry-500 [&>button]:hover:text-on-cherry'
