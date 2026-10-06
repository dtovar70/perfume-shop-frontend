import { BottleArt } from '@/components/shared/BottleArt'
import { cn } from '@/utils/cn'

/**
 * Brand illustration (About, 404): a rounded "blob" card with a soft cherry glow, a large
 * line-art bottle and, optionally, a few floating note tags. Decorative (`aria-hidden`), so it
 * never competes with text for contrast.
 */
const DEFAULT_NOTES = [
    { label: 'Bergamota', className: 'top-[8%] -left-3 sm:-left-8' },
    { label: 'Rosa de Damasco', className: 'top-[44%] -right-3 sm:-right-10' },
    { label: 'Ámbar · Vainilla', className: 'bottom-[8%] -left-3 sm:-left-4' },
]

export interface PerfumeArtProps {
    /** Floating note tags; pass `false` to hide them. */
    notes?: false | readonly { label: string; className: string }[]
    className?: string
}

export function PerfumeArt({ notes = DEFAULT_NOTES, className }: PerfumeArtProps) {
    return (
        <div
            aria-hidden="true"
            className={cn(
                'relative mx-auto aspect-square w-full max-w-[17rem] sm:max-w-md',
                className,
            )}
        >
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-blob border border-line bg-surface glow-cherry shadow-lift">
                <span className="absolute bottom-[12%] left-1/2 h-6 w-1/2 -translate-x-1/2 rounded-full bg-cherry-500/25 blur-xl" />
                <BottleArt className="relative h-[62%] w-auto text-fg/85" strokeWidth={1.1} />
            </div>

            {(notes || []).map((note) => (
                <span
                    key={note.label}
                    className={cn(
                        'absolute flex items-center gap-2 rounded-full border border-line bg-elevated px-3.5 py-2 text-xs font-semibold text-fg shadow-soft',
                        note.className,
                    )}
                >
                    <span className="size-1.5 rounded-full bg-cherry-500" />
                    {note.label}
                </span>
            ))}
        </div>
    )
}
