import { cn } from '@/utils/cn'

export interface SwitchProps {
    checked: boolean
    onChange: (checked: boolean) => void
    /** Accessible name; the visible label (if any) is rendered by the caller. */
    label: string
    disabled?: boolean
    className?: string
}

export function Switch({ checked, onChange, label, disabled = false, className }: SwitchProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={cn(
                'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition duration-200 focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none',
                checked ? 'border-rose-700 bg-rose-700' : 'border-ink/10 bg-line',
                className,
            )}
        >
            <span
                aria-hidden="true"
                className={cn(
                    'inline-block size-5 rounded-full bg-white shadow-[0_2px_6px_rgb(43_31_36/0.2)] transition-transform duration-300 ease-out motion-reduce:transition-none',
                    checked ? 'translate-x-6' : 'translate-x-0.5',
                )}
            />
        </button>
    )
}
