import { useEffect, useRef, useState, type RefObject } from 'react'

/** Time each beam spends circling one tile. */
export const BEAM_STEP_MS = 900
/** Both beams circling the meeting tile together, before it dissolves. */
export const BEAM_MEET_MS = 900
/** The meeting tile's border bursting into dust. */
const BURST_MS = 1100
/** Rest before the next round starts from both ends again. */
const REST_MS = 700

export type BeamPhase = 'run' | 'meet' | 'burst' | 'rest'

export interface BeamState {
    phase: BeamPhase
    /** Tile the forward beam (from the first brand) is on, or null. */
    forward: number | null
    /** Tile the backward beam (from the last brand) is on, or null. */
    backward: number | null
    /** The tile where both beams converge. */
    meet: number
    /** Changes on every step so each tile's beam restarts its lap. */
    tick: number
}

const IDLE: BeamState = { phase: 'rest', forward: null, backward: null, meet: -1, tick: 0 }

/** Whether the list is on screen, the tab visible and motion allowed. */
function useBeamsAllowed(target: RefObject<HTMLElement | null>, count: number): boolean {
    const [isAllowed, setIsAllowed] = useState(false)

    useEffect(() => {
        const element = target.current
        if (!element || count < 2) return
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
        let onScreen = false

        const update = () => setIsAllowed(onScreen && !document.hidden && !reduced.matches)
        const observer = new IntersectionObserver(
            ([entry]) => {
                onScreen = Boolean(entry?.isIntersecting)
                update()
            },
            { threshold: 0.25 },
        )
        observer.observe(element)
        document.addEventListener('visibilitychange', update)
        reduced.addEventListener('change', update)
        return () => {
            observer.disconnect()
            document.removeEventListener('visibilitychange', update)
            reduced.removeEventListener('change', update)
            setIsAllowed(false)
        }
    }, [count, target])

    return isAllowed
}

/**
 * Two beams walk the tiles in reading order, one from the first and one from the last, and meet
 * at the middle tile (with an even count the backward beam waits one step, so both arrive
 * together). They circle it, it dissolves, and the round starts over. Runs only while the list is
 * on screen and the tab is visible; with reduced motion it never starts.
 */
export function useBrandBeams(count: number) {
    const listRef = useRef<HTMLUListElement>(null)
    const isRunning = useBeamsAllowed(listRef, count) && count >= 2
    const [state, setState] = useState<BeamState>(IDLE)

    useEffect(() => {
        if (!isRunning) return

        const meet = Math.floor(count / 2)
        const forwardSteps = meet + 1
        const backwardSteps = count - meet
        const backwardDelay = forwardSteps - backwardSteps
        let step = 0
        let tick = 0
        let timer = 0

        const schedule = (next: () => void, ms: number) => {
            timer = window.setTimeout(next, ms)
        }
        const run = () => {
            if (step >= forwardSteps) {
                setState({ phase: 'meet', forward: meet, backward: meet, meet, tick: ++tick })
                schedule(burst, BEAM_MEET_MS)
                return
            }
            const backward = step >= backwardDelay ? count - 1 - (step - backwardDelay) : null
            setState({ phase: 'run', forward: step, backward, meet, tick: ++tick })
            step += 1
            schedule(run, BEAM_STEP_MS)
        }
        const burst = () => {
            setState({ phase: 'burst', forward: null, backward: null, meet, tick: ++tick })
            schedule(rest, BURST_MS)
        }
        const rest = () => {
            setState({ phase: 'rest', forward: null, backward: null, meet, tick: ++tick })
            step = 0
            schedule(run, REST_MS)
        }

        schedule(run, 300)
        return () => window.clearTimeout(timer)
    }, [isRunning, count])

    return { listRef, state: isRunning ? state : IDLE }
}
