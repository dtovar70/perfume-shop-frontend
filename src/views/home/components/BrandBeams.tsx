import type { CSSProperties } from 'react'

import { BEAM_MEET_MS, BEAM_STEP_MS, type BeamState } from '@/views/home/hooks/useBrandBeams'

const SPECK_COUNT = 56

/** Deterministic pseudo-random in [0, 1), so renders stay pure. */
function noise(index: number, salt: number): number {
    const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453
    return value - Math.floor(value)
}

/** Dust specks spread along the tile's border (top, right, bottom, left), each drifting outward. */
const SPECKS = Array.from({ length: SPECK_COUNT }, (_, index) => {
    const along = (index / SPECK_COUNT) * 4
    const side = Math.floor(along)
    const offset = (along - side) * 100
    const position: [number, number] =
        side === 0
            ? [offset, 0]
            : side === 1
              ? [100, offset]
              : side === 2
                ? [100 - offset, 100]
                : [0, 100 - offset]
    const outward: [number, number] =
        side === 0 ? [0, -1] : side === 1 ? [1, 0] : side === 2 ? [0, 1] : [-1, 0]
    const drift = 18 + noise(index, 1) * 38
    return {
        left: position[0],
        top: position[1],
        dx: outward[0] * drift + (noise(index, 2) - 0.5) * 34,
        dy: outward[1] * drift + (noise(index, 3) - 0.5) * 34 - 14,
        size: 2.5 + noise(index, 4) * 4,
        delay: noise(index, 5) * 0.45,
    }
})

export interface BrandBeamOverlayProps {
    index: number
    state: BeamState
}

/** One rounded outline matching the tile (`rounded-card`), stroked by the CSS classes given. */
function TileOutline({ className, style }: { className: string; style?: CSSProperties }) {
    return (
        <svg className="absolute inset-0 size-full overflow-visible" style={style}>
            <rect
                x="1"
                y="1"
                rx="23"
                pathLength={100}
                className={className}
                style={{ width: 'calc(100% - 2px)', height: 'calc(100% - 2px)' }}
            />
        </svg>
    )
}

/**
 * Decorative overlay for one brand tile: the beams lapping its border (a bright head with a
 * soft tail), the glow when both meet on it, and its border turning to dust. Styles and
 * keyframes live in index.css.
 */
export function BrandBeamOverlay({ index, state }: BrandBeamOverlayProps) {
    const isMeet = state.phase === 'meet' && state.meet === index
    const isBurst = state.phase === 'burst' && state.meet === index
    const hasForward = state.forward === index
    const hasBackward = state.backward === index

    if (!hasForward && !hasBackward && !isBurst) return null

    const lap = { '--beam-ms': `${isMeet ? BEAM_MEET_MS : BEAM_STEP_MS}ms` } as CSSProperties

    return (
        <span aria-hidden="true" className="brand-beams pointer-events-none absolute inset-0">
            {hasForward ? (
                <span key={`f-${state.tick}`} className="brand-beam-lap" style={lap}>
                    <TileOutline className="brand-beam-tail" />
                    <TileOutline className="brand-beam-head" />
                </span>
            ) : null}
            {hasBackward ? (
                <span
                    key={`b-${state.tick}`}
                    className="brand-beam-lap brand-beam-reverse"
                    style={lap}
                >
                    <TileOutline className="brand-beam-tail" />
                    <TileOutline className="brand-beam-head" />
                </span>
            ) : null}
            {isMeet ? <TileOutline key={`g-${state.tick}`} className="brand-beam-glow" /> : null}
            {isBurst ? (
                <span key={`d-${state.tick}`} className="absolute inset-0">
                    <TileOutline className="brand-beam-fade" />
                    {SPECKS.map((speck, speckIndex) => (
                        <span
                            key={speckIndex}
                            className="brand-dust"
                            style={
                                {
                                    left: `${speck.left}%`,
                                    top: `${speck.top}%`,
                                    width: `${speck.size}px`,
                                    height: `${speck.size}px`,
                                    '--dust-x': `${speck.dx}px`,
                                    '--dust-y': `${speck.dy}px`,
                                    animationDelay: `${speck.delay}s`,
                                } as CSSProperties
                            }
                        />
                    ))}
                </span>
            ) : null}
        </span>
    )
}
