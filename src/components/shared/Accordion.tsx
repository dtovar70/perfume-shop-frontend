import { ChevronDown } from 'lucide-react'

import { cn } from '@/utils/cn'

export interface AccordionItem {
    id: string
    question: string
    answer: string
}

export interface AccordionProps {
    items: AccordionItem[]
    className?: string
}

export function Accordion({ items, className }: AccordionProps) {
    return (
        <div
            className={cn(
                'divide-y divide-line overflow-hidden rounded-card border border-line bg-surface',
                className,
            )}
        >
            {items.map((item) => (
                <details key={item.id} className="group px-5 py-4 open:bg-elevated/50">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-fg">
                        {item.question}
                        <ChevronDown
                            aria-hidden="true"
                            className="size-5 shrink-0 text-accent transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
                        />
                    </summary>
                    <p className="pt-3 text-sm leading-relaxed text-fg-soft">{item.answer}</p>
                </details>
            ))}
        </div>
    )
}
