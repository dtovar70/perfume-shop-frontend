import { useId, useState, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'

import {
    FIELD_BASE_CLASS,
    FIELD_ERROR_CLASS,
    FIELD_HINT_CLASS,
    FIELD_LABEL_CLASS,
    FIELD_MESSAGE_ERROR_CLASS,
} from '@/components/ui/field.styles'
import { OptionalMark } from '@/components/ui/OptionalMark'
import { cn } from '@/utils/cn'

export interface TagInputProps {
    label: string
    value: string[]
    onChange: (value: string[]) => void
    placeholder?: string
    hint?: string
    error?: string
    optional?: boolean
    /** Most tags allowed; the field stops accepting new ones at the limit. */
    max?: number
    disabled?: boolean
}

/**
 * A list of short values typed one by one (olfactory notes): Enter or comma adds the text as a
 * chip, Backspace on an empty field removes the last one, and each chip has its own ×.
 * Duplicates (case-insensitive) are ignored.
 */
export function TagInput({
    label,
    value,
    onChange,
    placeholder,
    hint,
    error,
    optional = false,
    max,
    disabled = false,
}: TagInputProps) {
    const [draft, setDraft] = useState('')
    const inputId = useId()
    const hintId = useId()
    const errorId = useId()
    const isFull = max !== undefined && value.length >= max

    const commit = (raw: string) => {
        const parts = raw
            .split(',')
            .map((part) => part.trim().replace(/\s+/g, ' '))
            .filter(Boolean)
        if (parts.length === 0) return
        const next = [...value]
        for (const part of parts) {
            if (max !== undefined && next.length >= max) break
            if (next.some((item) => item.toLowerCase() === part.toLowerCase())) continue
            next.push(part)
        }
        onChange(next)
        setDraft('')
    }

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault()
            commit(draft)
        } else if (event.key === 'Backspace' && draft === '' && value.length > 0) {
            onChange(value.slice(0, -1))
        }
    }

    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={inputId} className={FIELD_LABEL_CLASS}>
                {label}
                {optional ? <OptionalMark /> : null}
            </label>
            <div
                className={cn(
                    FIELD_BASE_CLASS,
                    'flex min-h-11 flex-wrap items-center gap-1.5 rounded-xl px-2 py-1.5 focus-within:border-gold-500 focus-within:ring-4 focus-within:ring-gold-200/60',
                    error && FIELD_ERROR_CLASS,
                    disabled && 'opacity-60',
                )}
            >
                {value.map((tag) => (
                    <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full bg-gold-50 py-1 pr-1 pl-3 text-sm font-semibold text-ink ring-1 ring-gold-200"
                    >
                        {tag}
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={() => onChange(value.filter((item) => item !== tag))}
                            aria-label={`Quitar ${tag}`}
                            className="relative flex size-6 items-center justify-center rounded-full text-ink-soft transition after:absolute after:-inset-2.5 after:content-[''] hover:bg-rose-100 hover:text-rose-700"
                        >
                            <X aria-hidden="true" className="size-3.5" />
                        </button>
                    </span>
                ))}
                <input
                    id={inputId}
                    type="text"
                    value={draft}
                    disabled={disabled || isFull}
                    placeholder={isFull ? 'Límite alcanzado' : placeholder}
                    onChange={(event) => {
                        const next = event.target.value
                        if (next.includes(',')) commit(next)
                        else setDraft(next)
                    }}
                    onKeyDown={onKeyDown}
                    onBlur={() => commit(draft)}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : hint ? hintId : undefined}
                    className="min-w-32 flex-1 bg-transparent px-2 py-1 text-base outline-none placeholder:text-ink-soft/70 focus-visible:outline-none"
                />
            </div>
            {error ? (
                <p id={errorId} role="alert" className={FIELD_MESSAGE_ERROR_CLASS}>
                    {error}
                </p>
            ) : hint ? (
                <p id={hintId} className={FIELD_HINT_CLASS}>
                    {hint}
                </p>
            ) : null}
        </div>
    )
}
