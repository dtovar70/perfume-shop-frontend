import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'

export interface EmptyStateProps {
    title: string
    description?: string
    icon?: ReactNode
    action?: ReactNode
    className?: string
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center gap-4 rounded-card border border-dashed border-rose-200 bg-rose-50/60 px-6 py-14 text-center',
                className,
            )}
        >
            {icon ? (
                <span
                    aria-hidden="true"
                    className="flex size-14 items-center justify-center rounded-full bg-white text-rose-500 shadow-soft"
                >
                    {icon}
                </span>
            ) : null}

            <div className="max-w-md space-y-2">
                <p className="font-display text-xl text-ink">{title}</p>
                {description ? <p className="text-sm text-ink-soft">{description}</p> : null}
            </div>

            {action}
        </div>
    )
}
