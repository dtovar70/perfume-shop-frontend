import type { AboutValue } from '@/@types/content'
import { Card } from '@/components/ui'
import { ABOUT_VALUE_ICON_COMPONENTS } from '@/views/about/components/valueIcons'

export interface ValuesGridProps {
    values: AboutValue[]
}

export function ValuesGrid({ values }: ValuesGridProps) {
    return (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => {
                // Unknown icons (an older payload) fall back to the first one.
                const Icon =
                    ABOUT_VALUE_ICON_COMPONENTS[value.icon] ?? ABOUT_VALUE_ICON_COMPONENTS.palette
                return (
                    <li key={index} className="h-full">
                        <Card className="flex h-full flex-col gap-3">
                            <span className="flex size-12 items-center justify-center rounded-full bg-elevated text-accent ring-1 ring-cherry-500/30">
                                <Icon aria-hidden="true" className="size-5" />
                            </span>
                            <h3 className="font-display text-2xl font-semibold text-fg">
                                {value.title}
                            </h3>
                            <p className="text-sm text-fg-soft">{value.description}</p>
                        </Card>
                    </li>
                )
            })}
        </ul>
    )
}
