import { useId } from 'react'

import { BADGE_TONES, type BadgeTone } from '@/@types/catalog'
import { Badge } from '@/components/ui'
import { FIELD_LABEL_CLASS } from '@/components/ui/field.styles'
import { cn } from '@/utils/cn'

const TONE_LABELS: Record<BadgeTone, string> = {
    blush: 'Rosa',
    sky: 'Celeste',
    mint: 'Menta',
    butter: 'Amarillo',
    lilac: 'Lila',
    solid: 'Rosa intenso',
    neutral: 'Gris',
}

export interface ToneFieldProps {
    value: BadgeTone
    onChange: (tone: BadgeTone) => void
    /** Text of the swatches, so each one previews the real badge. */
    sample: string
}

/** The badge colors as a radio group, each swatch drawn as the badge it produces. */
export function ToneField({ value, onChange, sample }: ToneFieldProps) {
    const name = useId()
    return (
        <fieldset className="space-y-2">
            <legend className={FIELD_LABEL_CLASS}>Color de la etiqueta</legend>
            <div className="flex flex-wrap gap-2">
                {BADGE_TONES.map((tone) => (
                    <label
                        key={tone}
                        className={cn(
                            'flex cursor-pointer flex-col items-center gap-1 rounded-2xl border p-2 transition has-focus-visible:ring-2 has-focus-visible:ring-gold-500',
                            tone === value
                                ? 'border-rose-400 bg-rose-50'
                                : 'border-line hover:border-rose-200',
                        )}
                    >
                        <input
                            type="radio"
                            name={name}
                            value={tone}
                            checked={tone === value}
                            onChange={() => onChange(tone)}
                            className="sr-only"
                        />
                        <Badge tone={tone} size="sm" className="max-w-40 truncate">
                            {sample || TONE_LABELS[tone]}
                        </Badge>
                        <span className="text-xs text-ink-soft">{TONE_LABELS[tone]}</span>
                    </label>
                ))}
            </div>
        </fieldset>
    )
}
