import { useEffect, useState, type ReactNode } from 'react'

import { RouteFallback } from '@/components/route/RouteFallback'
import { fillPlaceholders, placeholderValues } from '@/utils/content'
import {
    SITE_CONTENT_TIMEOUT_MS,
    useSiteContent,
    useSiteContentQuery,
} from '@/utils/hooks/useSiteContent'
import { setSeoDefaults } from '@/utils/hooks/useSeo'

/**
 * Keeps the site-wide title and meta description in line with the editable content. They are
 * the SEO defaults: a page that sets its own (`useSeo`) wins while it is on screen.
 */
function useDocumentMeta() {
    const content = useSiteContent()
    const { brandName, titleSuffix, metaDescription } = content.general

    useEffect(() => {
        setSeoDefaults({
            title: titleSuffix ? `${brandName} | ${titleSuffix}` : brandName,
            siteName: `${brandName} Perfumería`,
            description: fillPlaceholders(metaDescription, placeholderValues(content)),
        })
    }, [brandName, titleSuffix, metaDescription, content])
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
