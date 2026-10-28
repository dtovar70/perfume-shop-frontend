import { useEffect, useEffectEvent } from 'react'

/** First wait before reopening a stream the browser gave up on; doubles up to the max. */
const RETRY_MIN_MS = 5_000
const RETRY_MAX_MS = 5 * 60_000

export interface EventStreamOptions {
    /** No connection while false (e.g. until the order is known to exist). */
    enabled?: boolean
    /** Sends the cookies to the API's origin (the admin session). */
    withCredentials?: boolean
    /** Stay connected in a hidden tab. By default the stream closes and reopens on return. */
    keepWhenHidden?: boolean
    /**
     * Called once each time the stream opens again after a drop, a retry or a hidden tab:
     * events may have been missed meanwhile, so the caller refetches what it shows.
     */
    onReconnect?: () => void
}

/**
 * Listens to a Server-Sent Events stream of JSON messages. `EventSource` reconnects by itself
 * after a dropped connection; after an error status (429, 5xx…) it gives up, so this hook
 * reopens it later. Heartbeats are SSE comments, which never reach `onMessage`.
 */
export function useEventStream<T>(
    url: string | null,
    onMessage: (data: T) => void,
    {
        enabled = true,
        withCredentials = false,
        keepWhenHidden = false,
        onReconnect,
    }: EventStreamOptions = {},
): void {
    const handleMessage = useEffectEvent(onMessage)
    const handleReconnect = useEffectEvent(() => onReconnect?.())

    useEffect(() => {
        if (!url || !enabled || typeof EventSource === 'undefined') return

        let source: EventSource | null = null
        let retryTimer: number | undefined
        let retryMs = RETRY_MIN_MS
        // The stream was down (or never opened) since the data was loaded: resync on open.
        let missed = false
        const pausesWhenHidden = () => !keepWhenHidden && document.hidden

        const close = () => {
            source?.close()
            source = null
        }

        const open = () => {
            window.clearTimeout(retryTimer)
            retryTimer = undefined
            const current = new EventSource(url, { withCredentials })
            source = current
            current.onopen = () => {
                retryMs = RETRY_MIN_MS
                if (!missed) return
                missed = false
                handleReconnect()
            }
            current.onmessage = (event: MessageEvent<string>) => {
                let data: T
                try {
                    data = JSON.parse(event.data) as T
                } catch {
                    return
                }
                handleMessage(data)
            }
            current.onerror = () => {
                missed = true
                if (current.readyState !== EventSource.CLOSED) return
                close()
                retryTimer = window.setTimeout(open, retryMs)
                retryMs = Math.min(retryMs * 2, RETRY_MAX_MS)
            }
        }

        const onVisibilityChange = () => {
            if (pausesWhenHidden()) {
                window.clearTimeout(retryTimer)
                retryTimer = undefined
                if (source) missed = true
                close()
            } else if (!source && retryTimer === undefined) {
                open()
            }
        }

        if (pausesWhenHidden()) missed = true
        else open()
        document.addEventListener('visibilitychange', onVisibilityChange)

        return () => {
            document.removeEventListener('visibilitychange', onVisibilityChange)
            window.clearTimeout(retryTimer)
            close()
        }
    }, [url, enabled, withCredentials, keepWhenHidden])
}
