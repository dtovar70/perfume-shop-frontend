import { type ComponentPropsWithRef, type ReactNode } from 'react'

import { cn } from '@/utils/cn'

export interface HeaderIconButtonProps extends Omit<ComponentPropsWithRef<'button'>, 'children'> {
    /** Accessible name — the control shows an icon only. */
    label: string
    icon: ReactNode
    /** Overlay pinned to the corner, e.g. the cart count badge. */
    badge?: ReactNode
}

/** A 44px round icon button for the header bar. */
export function HeaderIconButton({
    label,
    icon,
    badge,
    className,
    ...rest
}: HeaderIconButtonProps) {
    return (
        <button
            type="button"
            aria-label={label}
            className={cn(
                'group relative flex size-11 shrink-0 items-center justify-center rounded-full border border-transparent text-fg transition-colors duration-200 hover:bg-elevated hover:text-accent-strong focus-visible:text-accent-strong aria-expanded:border-line aria-expanded:bg-elevated',
                className,
            )}
            {...rest}
        >
            {/* Hover ring: a cherry stroke that draws itself around the circle, starting at the top. */}
            <svg
                aria-hidden="true"
                viewBox="0 0 44 44"
                className="pointer-events-none absolute -inset-px -rotate-90"
            >
                <circle
                    cx="22"
                    cy="22"
                    r="21"
                    fill="none"
                    pathLength={100}
                    strokeDasharray="102"
                    className="stroke-cherry-500 [stroke-width:1.5] opacity-0 transition-[stroke-dashoffset,opacity] duration-500 ease-out [stroke-dashoffset:102] group-hover:opacity-100 group-hover:[stroke-dashoffset:0] group-focus-visible:opacity-100 group-focus-visible:[stroke-dashoffset:0] motion-reduce:transition-none"
                />
            </svg>
            {icon}
            {badge}
        </button>
    )
}
