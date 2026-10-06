import type { ReactNode } from 'react'
import { Lock } from 'lucide-react'

export interface ReadOnlyFieldsProps {
    fields: { label: string; value: ReactNode }[]
    /** Why these cannot be edited. */
    explanation: string
}

/** Values the admin can see but not change, each with a lock, and why. */
export function ReadOnlyFields({ fields, explanation }: ReadOnlyFieldsProps) {
    return (
        <div className="space-y-2 rounded-2xl border border-dashed border-line bg-canvas/60 p-4">
            <dl className="grid grid-cols-1 gap-3 @md:grid-cols-3">
                {fields.map((field) => (
                    <div key={field.label} className="min-w-0">
                        <dt className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-fg-soft uppercase">
                            <Lock aria-hidden="true" className="size-3.5" />
                            {field.label}
                        </dt>
                        <dd className="mt-1 text-sm break-words text-fg">{field.value}</dd>
                    </div>
                ))}
            </dl>
            <p className="text-xs text-fg-soft">{explanation}</p>
        </div>
    )
}
