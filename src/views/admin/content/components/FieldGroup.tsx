import type { ReactNode } from 'react'

import { Card } from '@/components/ui'

export interface FieldGroupProps {
    title: string
    description?: ReactNode
    children: ReactNode
}

/** A titled card of related fields. `@container` lets the fields sit in columns when wide. */
export function FieldGroup({ title, description, children }: FieldGroupProps) {
    return (
        <Card className="@container space-y-5">
            <div className="space-y-1">
                <h3 className="font-display text-xl text-fg">{title}</h3>
                {description ? <p className="text-sm text-fg-soft">{description}</p> : null}
            </div>
            {children}
        </Card>
    )
}

/** Two columns once the card is wide enough. */
export function FieldRow({ children }: { children: ReactNode }) {
    return <div className="grid grid-cols-1 items-start gap-5 @xl:grid-cols-2">{children}</div>
}
