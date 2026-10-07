import { useEffect, useId } from 'react'

/**
 * Per-page SEO for the single-page storefront: `document.title`, the meta description, the
 * Open Graph / Twitter tags, the canonical link, `robots` and JSON-LD blocks, all set from
 * the page that is on screen and put back to the site defaults when it unmounts.
 *
 * Pages register an override with `useSeo`; the last one mounted wins (overrides form a
 * stack, so nested or overlapping pages restore each other correctly). The defaults come from
 * the editable content (`setSeoDefaults`, called by SiteContentGate) and from index.html.
 */

export type JsonLd = Record<string, unknown>

export interface SeoOptions {
    /** Page title; rendered "<title> | <site title>". Omitted: the site's own title. */
    title?: string
    description?: string
    /** Absolute or root-relative image URL for link previews. */
    image?: string
    /** Root-relative path or absolute URL. Omitted: no canonical link. */
    canonical?: string
    /** One or more schema.org objects, each injected as an `application/ld+json` script. */
    jsonLd?: JsonLd | JsonLd[]
    /** `noindex` pages (personal lists, empty states). */
    noIndex?: boolean
    /** `og:type`: "product" on product pages, "website" otherwise. */
    type?: 'website' | 'product'
}

interface SeoDefaults {
    /** Full default title, e.g. "KaiZen | Perfumería — fragancias originales". */
    title: string
    /** What page titles are suffixed with, e.g. "KaiZen Perfumería". */
    siteName: string
    description: string
    image: string
}

const JSON_LD_ATTRIBUTE = 'data-seo-jsonld'

function readMeta(selector: string): string {
    if (typeof document === 'undefined') return ''
    return document.querySelector(`meta[${selector}]`)?.getAttribute('content') ?? ''
}

const defaults: SeoDefaults = {
    title: typeof document === 'undefined' ? '' : document.title,
    siteName: 'KaiZen Perfumería',
    description: readMeta('name="description"'),
    image: readMeta('property="og:image"') || '/img/og-image.png',
}

const stack: { key: string; options: SeoOptions }[] = []

export function absoluteUrl(pathOrUrl: string): string {
    try {
        return new URL(pathOrUrl, window.location.origin).toString()
    } catch {
        return pathOrUrl
    }
}

/** Sets (or creates) `<meta {attribute}="{name}" content>`; an empty content removes it. */
function setMeta(attribute: 'name' | 'property', name: string, content: string | undefined) {
    let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`)
    if (!content) {
        // Only tags this module added go away; the ones index.html ships are kept.
        if (element?.dataset.seo === '') element.remove()
        return
    }
    if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attribute, name)
        element.dataset.seo = ''
        document.head.append(element)
    }
    element.setAttribute('content', content)
}

function setCanonical(href: string | undefined) {
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!href) {
        link?.remove()
        return
    }
    if (!link) {
        link = document.createElement('link')
        link.rel = 'canonical'
        document.head.append(link)
    }
    link.href = href
}

function setJsonLd(blocks: JsonLd[]) {
    for (const old of document.head.querySelectorAll(`script[${JSON_LD_ATTRIBUTE}]`)) old.remove()
    for (const block of blocks) {
        const script = document.createElement('script')
        script.type = 'application/ld+json'
        script.setAttribute(JSON_LD_ATTRIBUTE, '')
        // `<` escaped so a product text can never close the script element.
        script.textContent = JSON.stringify(block).replace(/</g, '\\u003c')
        document.head.append(script)
    }
}

function apply() {
    if (typeof document === 'undefined') return
    const options = stack.at(-1)?.options ?? {}
    const title = options.title ? `${options.title} | ${defaults.siteName}` : defaults.title
    const description = options.description || defaults.description
    const image = absoluteUrl(options.image || defaults.image)
    const url = options.canonical ? absoluteUrl(options.canonical) : undefined

    document.title = title
    setMeta('name', 'description', description)
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:image', image)
    setMeta('property', 'og:type', options.type ?? 'website')
    setMeta('property', 'og:url', url)
    setMeta('name', 'twitter:title', title)
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image', image)
    setMeta('name', 'robots', options.noIndex ? 'noindex, follow' : undefined)
    setCanonical(url)
    setJsonLd(options.jsonLd ? ([] as JsonLd[]).concat(options.jsonLd) : [])
}

/** The site-wide title and description (from the editable content); re-applies them. */
export function setSeoDefaults(values: Partial<SeoDefaults>): void {
    Object.assign(defaults, values)
    apply()
}

/**
 * SEO of the page on screen. Pass a stable-ish object: it is compared by its JSON, so a new
 * object with the same contents does not touch the DOM again.
 */
export function useSeo(options: SeoOptions): void {
    const key = useId()
    const serialized = JSON.stringify(options)

    useEffect(() => {
        const entry = { key, options: JSON.parse(serialized) as SeoOptions }
        stack.push(entry)
        apply()
        return () => {
            const index = stack.findIndex((candidate) => candidate.key === key)
            if (index !== -1) stack.splice(index, 1)
            apply()
        }
    }, [key, serialized])
}
