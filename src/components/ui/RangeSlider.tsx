import { useLayoutEffect, useRef, type KeyboardEvent, type PointerEvent } from 'react'

import { cn } from '@/utils/cn'

export type RangeValue = readonly [number, number]

export interface RangeSliderProps {
    min: number
    max: number
    step?: number
    value: RangeValue
    /** Every move (drag, key), to update what is shown. */
    onChange: (value: RangeValue) => void
    /** When the gesture ends: pointer released, or a key pressed (callers may debounce). */
    onCommit: (value: RangeValue) => void
    /** Accessible names of the two thumbs. */
    labels?: readonly [string, string]
    /** `aria-valuetext` of a thumb, e.g. "$25". */
    formatValue?: (value: number) => string
    disabled?: boolean
    className?: string
}

type Thumb = 0 | 1

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value))
}

/**
 * Two-thumb range slider (WAI-ARIA "slider" pattern, one per thumb). Drag a thumb or press on
 * the track to move the nearest one; keyboard: arrows (one step), Page Up/Down (a tenth of the
 * range), Home/End (to the limit, never past the other thumb). Thumbs are 24px with a 44px
 * touch target.
 */
export function RangeSlider({
    min,
    max,
    step = 1,
    value,
    onChange,
    onCommit,
    labels = ['Mínimo', 'Máximo'],
    formatValue = String,
    disabled = false,
    className,
}: RangeSliderProps) {
    const rootRef = useRef<HTMLDivElement>(null)
    const railRef = useRef<HTMLDivElement>(null)
    const dragging = useRef<Thumb | null>(null)
    /** The value handlers act on: the prop, or a newer one a drag has not re-rendered yet. */
    const latest = useRef<RangeValue>(value)
    useLayoutEffect(() => {
        latest.current = value
    }, [value])

    const span = Math.max(max - min, step)
    const percent = (point: number) => ((clamp(point, min, max) - min) / span) * 100
    const snap = (raw: number) => clamp(min + Math.round((raw - min) / step) * step, min, max)

    const update = (thumb: Thumb, raw: number): RangeValue => {
        const [low, high] = latest.current
        const next: RangeValue =
            thumb === 0 ? [clamp(snap(raw), min, high), high] : [low, clamp(snap(raw), low, max)]
        if (next[0] !== low || next[1] !== high) {
            latest.current = next
            onChange(next)
        }
        return next
    }

    const valueAt = (clientX: number): number => {
        const rect = railRef.current?.getBoundingClientRect()
        if (!rect || rect.width === 0) return min
        return min + ((clientX - rect.left) / rect.width) * span
    }

    const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
        if (disabled || event.button !== 0) return
        const target = valueAt(event.clientX)
        const [low, high] = latest.current
        // Outside the range, the thumb on that side; inside it, the nearer one.
        const thumb: Thumb =
            target <= low ? 0 : target >= high ? 1 : target - low < high - target ? 0 : 1
        dragging.current = thumb
        event.currentTarget.setPointerCapture(event.pointerId)
        update(thumb, target)
        const thumbs = rootRef.current?.querySelectorAll<HTMLElement>('[role="slider"]')
        thumbs?.[thumb]?.focus({ preventScroll: true })
        event.preventDefault()
    }

    const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
        if (dragging.current === null) return
        update(dragging.current, valueAt(event.clientX))
    }

    const endDrag = (event: PointerEvent<HTMLDivElement>) => {
        if (dragging.current === null) return
        dragging.current = null
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId)
        }
        onCommit(latest.current)
    }

    const onKeyDown = (thumb: Thumb) => (event: KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return
        const current = latest.current[thumb]
        const page = Math.max(step, Math.round(span / 10 / step) * step)
        const moves: Record<string, number> = {
            ArrowLeft: current - step,
            ArrowDown: current - step,
            ArrowRight: current + step,
            ArrowUp: current + step,
            PageDown: current - page,
            PageUp: current + page,
            Home: min,
            End: max,
        }
        const target = moves[event.key]
        if (target === undefined) return
        event.preventDefault()
        onCommit(update(thumb, target))
    }

    const [low, high] = value

    return (
        <div ref={rootRef} className={cn('relative h-11 touch-none select-none', className)}>
            {/* The whole 44px-tall band takes presses (thumbs included); the 6px rail sits in
                it with 12px gutters, so a thumb at either end is never cut off. */}
            <div
                aria-hidden="true"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                className={cn(
                    'absolute inset-0',
                    disabled ? 'cursor-not-allowed' : 'cursor-pointer',
                )}
            >
                <div
                    ref={railRef}
                    className="absolute inset-x-3 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-line-strong"
                />
                <div
                    className={cn(
                        'absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full',
                        disabled ? 'bg-fg-muted' : 'bg-cherry-500',
                    )}
                    style={{
                        left: `calc(0.75rem + (100% - 1.5rem) * ${percent(low) / 100})`,
                        right: `calc(0.75rem + (100% - 1.5rem) * ${1 - percent(high) / 100})`,
                    }}
                />
            </div>

            {([0, 1] as const).map((thumb) => {
                const thumbValue = thumb === 0 ? low : high
                return (
                    <div
                        key={thumb}
                        role="slider"
                        tabIndex={disabled ? -1 : 0}
                        aria-label={labels[thumb]}
                        aria-valuemin={thumb === 0 ? min : low}
                        aria-valuemax={thumb === 0 ? high : max}
                        aria-valuenow={thumbValue}
                        aria-valuetext={formatValue(thumbValue)}
                        aria-disabled={disabled || undefined}
                        aria-orientation="horizontal"
                        onKeyDown={onKeyDown(thumb)}
                        style={{
                            left: `calc(0.75rem + (100% - 1.5rem) * ${percent(thumbValue) / 100})`,
                        }}
                        className={cn(
                            // The pseudo-element is the 44px touch target around the 24px thumb.
                            "pointer-events-none absolute top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cherry-500 bg-thumb shadow-thumb transition-shadow after:absolute after:-inset-2.5 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cherry-500",
                            // The upper thumb sits on top when both meet at the low end.
                            thumb === 1 && low === high && high === min ? 'z-0' : 'z-10',
                            disabled && 'border-fg-muted',
                        )}
                    />
                )
            })}
        </div>
    )
}
