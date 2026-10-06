import type { ReactNode } from 'react'

export interface AdminPageHeaderProps {
    title: string
    description?: ReactNode
    /** Primary action(s), right-aligned on wide screens. */
    actions?: ReactNode
    /** Small line above the title, e.g. a back link. */
    eyebrow?: ReactNode
}

export function AdminPageHeader({ title, description, actions, eyebrow }: AdminPageHeaderProps) {
    return (
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0 space-y-2">
                {eyebrow}
                <h1 className="font-display text-3xl tracking-tight text-fg sm:text-4xl">
                    {title}
                </h1>
                {description ? <p className="text-fg-soft">{description}</p> : null}
            </div>
            {actions ? <div className="flex shrink-0 flex-wrap gap-3">{actions}</div> : null}
        </header>
    )
}
