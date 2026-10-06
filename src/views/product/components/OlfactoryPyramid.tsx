import type { OlfactoryNotes } from '@/@types/product'
import { cn } from '@/utils/cn'

const TIERS = [
    {
        key: 'top',
        label: 'Salida',
        hint: 'Lo primero que percibes, los primeros minutos.',
        width: 'lg:w-[64%]',
    },
    {
        key: 'heart',
        label: 'Corazón',
        hint: 'El alma del perfume, cuando se asienta en la piel.',
        width: 'lg:w-[82%]',
    },
    {
        key: 'base',
        label: 'Fondo',
        hint: 'La estela que perdura durante horas.',
        width: 'lg:w-full',
    },
] as const satisfies readonly { key: keyof OlfactoryNotes; label: string; hint: string; width: string }[]

export interface OlfactoryPyramidProps {
    notes: OlfactoryNotes
    family: string | null
    className?: string
}

/** "Pirámide olfativa": the three tiers widen from top to base, each with its notes as chips. */
export function OlfactoryPyramid({ notes, family, className }: OlfactoryPyramidProps) {
    const tiers = TIERS.filter((tier) => notes[tier.key].length > 0)
    if (tiers.length === 0 && !family) return null

    return (
        <section
            aria-labelledby="pyramid-heading"
            className={cn(
                'gradient-blush relative overflow-hidden rounded-card border border-gold-200/70 p-6 sm:p-8',
                className,
            )}
        >
            <span
                aria-hidden="true"
                className="absolute -top-16 -right-16 size-56 rounded-full border border-gold-300/40"
            />
            <div className="relative space-y-1">
                <p className="text-[11px] font-bold tracking-[0.28em] text-gold-700 uppercase">
                    Notas olfativas
                </p>
                <h2 id="pyramid-heading" className="font-display text-3xl font-semibold text-ink">
                    Pirámide <span className="text-rose-700 italic">olfativa</span>
                </h2>
                {family ? (
                    <p className="pt-1 text-sm text-ink-soft">
                        Familia: <span className="font-bold text-ink">{family}</span>
                    </p>
                ) : null}
            </div>

            {tiers.length > 0 ? (
                <ol className="relative mt-6 flex flex-col items-center gap-3">
                    {tiers.map((tier) => (
                        <li
                            key={tier.key}
                            className={cn(
                                'w-full rounded-2xl border border-white/80 bg-white/75 p-4 text-left shadow-soft backdrop-blur-sm sm:p-5',
                                tier.width,
                            )}
                        >
                            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                                <h3 className="font-display text-xl font-semibold text-rose-800">
                                    {tier.label}
                                </h3>
                                <p className="text-xs text-ink-soft">{tier.hint}</p>
                            </div>
                            <ul className="mt-3 flex flex-wrap gap-1.5">
                                {notes[tier.key].map((note) => (
                                    <li
                                        key={note}
                                        className="rounded-full border border-gold-200 bg-gold-50 px-3 py-1 text-sm font-semibold text-ink"
                                    >
                                        {note}
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ol>
            ) : null}
        </section>
    )
}
