import { useEffect, useState, type ReactNode } from 'react'

import { RouteFallback } from '@/components/route/RouteFallback'
import { fillPlaceholders, placeholderValues } from '@/utils/content'
import {
    SITE_CONTENT_TIMEOUT_MS,
    useSiteContent,
    useSiteContentQuery,
} from '@/utils/hooks/useSiteContent'

/** Keeps `document.title` and the meta description in line with the editable content. */
function useDocumentMeta() {
    const content = useSiteContent()
    const { brandName, titleSuffix, metaDescription } = content.general

    useEffect(() => {
        document.title = titleSuffix ? `${brandName} | ${titleSuffix}` : brandName
    }, [brandName, titleSuffix])

    useEffect(() => {
        const description = fillPlaceholders(metaDescription, placeholderValues(content))
        document.querySelector('meta[name="description"]')?.setAttribute('content', description)
    }, [content, metaDescription])
}

export interface SiteContentGateProps {
    children: ReactNode
}

/**
 * Holds the first render behind the global loader until the site content arrives, so visitors
 * never see the built-in texts flash before the edited ones. If the API fails or takes longer
 * than `SITE_CONTENT_TIMEOUT_MS`, the app renders with the defaults (and picks up the content
 * if it arrives later).
 */
export function SiteContentGate({ children }: SiteContentGateProps) {
    const { status } = useSiteContentQuery()
    const [hasTimedOut, setHasTimedOut] = useState(false)
    useDocumentMeta()

    useEffect(() => {
        const timeout = window.setTimeout(() => setHasTimedOut(true), SITE_CONTENT_TIMEOUT_MS)
        return () => window.clearTimeout(timeout)
    }, [])

    if (status === 'pending' && !hasTimedOut) return <RouteFallback />
    return children
}
