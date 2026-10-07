import { useEffect, useRef, useState } from 'react'

import { RangeSlider, type RangeValue } from '@/components/ui/RangeSlider'
import { formatShortMoney } from '@/utils/content'

/** Keyboard and typing settle for this long before the catalog reloads. */
const COMMIT_DELAY_MS = 450

export interface PriceFilterProps {
    /** Cheapest and dearest active product in scope (`GET /products/facets`). */
    priceMin: number
    priceMax: number
    /** The range in the URL; undefined ends are open. */
    minPrice?: number
    maxPrice?: number
    /** Undefined for an end at its bound (no limit on that side). */
    onChange: (minPrice?: number, maxPrice?: number) => void
}

const inputClass =
    'h-11 w-full min-w-0 rounded-xl border border-field-line bg-field pr-3 pl-7 text-sm font-semibold text-fg tabular-nums transition hover:border-field-line-hover focus-visible:border-cherry-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'

/**
 * "Precio": a two-thumb slider over the catalog's price span plus two number fields. What is
 * shown moves live; the URL (and so the request) only changes when a gesture ends — pointer
 * released, typing or keys paused, a field left — never on every pixel of a drag.
 */
export function PriceFilter({
    priceMin,
    priceMax,
    minPrice,
    maxPrice,
    onChange,
}: PriceFilterProps) {
    const floor = Math.floor(priceMin)
    const ceiling = Math.max(Math.ceil(priceMax), floor + 1)
    const fromUrl: RangeValue = [
        Math.min(Math.max(minPrice ?? floor, floor), ceiling),
        Math.max(Math.min(maxPrice ?? ceiling, ceiling), floor),
    ]
    const [range, setRange] = useState<RangeValue>(fromUrl)
    const [drafts, setDrafts] = useState<[string, string]>([String(fromUrl[0]), String(fromUrl[1])])
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

    // The URL (back button, "Limpiar filtros", another category) wins over local edits.
    const [syncedKey, setSyncedKey] = useState(`${fromUrl[0]}-${fromUrl[1]}`)
    const urlKey = `${fromUrl[0]}-${fromUrl[1]}`
    if (urlKey !== syncedKey) {
        setSyncedKey(urlKey)
        setRange(fromUrl)
        setDrafts([String(fromUrl[0]), String(fromUrl[1])])
    }

    useEffect(() => () => clearTimeout(timer.current), [])

    const commitNow = ([low, high]: RangeValue) => {
        clearTimeout(timer.current)
        const nextMin = low <= floor ? undefined : low
        const nextMax = high >= ceiling ? undefined : high
        if (nextMin === minPrice && nextMax === maxPrice) return
        onChange(nextMin, nextMax)
    }

    const commitSoon = (value: RangeValue) => {
        clearTimeout(timer.current)
        timer.current = setTimeout(() => commitNow(value), COMMIT_DELAY_MS)
    }

    const show = (value: RangeValue) => {
        setRange(value)
        setDrafts([String(value[0]), String(value[1])])
    }

    /** A typed end, clamped and kept on its side of the other one. */
    const fromDraft = (index: 0 | 1, raw: string): RangeValue => {
        const parsed = Math.round(Number(raw.replace(',', '.')))
        const [low, high] = range
        if (raw.trim() === '' || !Number.isFinite(parsed)) {
            return index === 0 ? [floor, high] : [low, ceiling]
        }
        return index === 0
            ? [Math.min(Math.max(parsed, floor), high), high]
            : [low, Math.max(Math.min(parsed, ceiling), low)]
    }

    const isSpanless = priceMax <= priceMin
    const labels = ['Precio mínimo', 'Precio máximo'] as const

    return (
        <div className="space-y-3">
            <p className="text-sm font-bold text-fg tabular-nums">
                {formatShortMoney(range[0])} – {formatShortMoney(range[1])}
            </p>

            <RangeSlider
                min={floor}
                max={ceiling}
                value={range}
                onChange={show}
                onCommit={(value) => commitSoon(value)}
                labels={labels}
                formatValue={formatShortMoney}
                disabled={isSpanless}
            />

            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
                {([0, 1] as const).map((index) => (
                    <label
                        key={index}
                        className={index === 0 ? 'col-start-1 space-y-1' : 'col-start-3 space-y-1'}
                    >
                        <span className="block text-xs font-semibold text-fg-soft">
                            {index === 0 ? 'Mín.' : 'Máx.'}
                            <span className="sr-only"> en dólares</span>
                        </span>
                        <span className="relative block">
                            <span
                                aria-hidden="true"
                                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-fg-soft"
                            >
                                $
                            </span>
                            <input
                                type="number"
                                inputMode="numeric"
                                min={floor}
                                max={ceiling}
                                step={1}
                                value={drafts[index]}
                                disabled={isSpanless}
                                aria-label={labels[index]}
                                onChange={(event) => {
                                    const raw = event.target.value
                                    setDrafts((current) =>
                                        index === 0 ? [raw, current[1]] : [current[0], raw],
                                    )
                                    const next = fromDraft(index, raw)
                                    setRange(next)
                                    commitSoon(next)
                                }}
                                onBlur={(event) => {
                                    const next = fromDraft(index, event.target.value)
                                    show(next)
                                    commitNow(next)
                                }}
                                onKeyDown={(event) => {
                                    if (event.key !== 'Enter') return
                                    const next = fromDraft(index, event.currentTarget.value)
                                    show(next)
                                    commitNow(next)
                                }}
                                className={inputClass}
                            />
                        </span>
                    </label>
                ))}
                <span aria-hidden="true" className="col-start-2 row-start-1 pb-3 text-fg-muted">
                    –
                </span>
            </div>
        </div>
    )
}
