import { Fragment } from 'react'

import { cn } from '@/utils/cn'
import { splitHighlights } from '@/utils/content'

export interface HighlightedTextProps {
    /** Words between asterisks are highlighted: "Tus *favoritos*". */
    text: string
    className?: string
}

/** Sets the *marked* words in rose italic, the brand's signature headline accent. */
export function HighlightedText({ text, className }: HighlightedTextProps) {
    return splitHighlights(text).map((segment, index) =>
        segment.highlighted ? (
            <span key={index} className={cn('text-rose-700 italic', className)}>
                {segment.text}
            </span>
        ) : (
            <Fragment key={index}>{segment.text}</Fragment>
        ),
    )
}
