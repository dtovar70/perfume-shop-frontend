/**
 * Cloudinary delivery transformations for public product photos: the right size and format
 * (`f_auto` → WebP/AVIF where supported) instead of the full-size upload, which matters a lot on
 * mobile data. Anything that is not a public `res.cloudinary.com/<cloud>/image/upload/` URL
 * (signed or private deliveries, API previews, blobs) is returned untouched.
 */
const UPLOAD_SEGMENT = '/image/upload/'

function isTransformable(url: string): boolean {
    try {
        const parsed = new URL(url)
        return (
            parsed.hostname === 'res.cloudinary.com' &&
            parsed.pathname.includes(UPLOAD_SEGMENT) &&
            // Signed URLs carry `s--<signature>--`; changing the path would break them.
            !/\/s--[^/]+--\//.test(parsed.pathname)
        )
    } catch {
        return false
    }
}

/** `url` resized to at most `width` CSS pixels' worth of image, in the best format. */
export function cldUrl(url: string, width: number): string {
    if (!isTransformable(url)) return url
    const transform = `f_auto,q_auto,c_limit,w_${Math.round(width)}`
    return url.replace(UPLOAD_SEGMENT, `${UPLOAD_SEGMENT}${transform}/`)
}

/** A `srcSet` with one candidate per width, or `undefined` when the URL cannot be resized. */
export function cldSrcSet(url: string, widths: readonly number[]): string | undefined {
    if (!isTransformable(url)) return undefined
    return widths.map((width) => `${cldUrl(url, width)} ${width}w`).join(', ')
}

const VIDEO_UPLOAD_SEGMENT = '/video/upload/'

/**
 * A still of a public Cloudinary video (its first frame, as an optimized image), or null for any
 * other URL. Used as the poster when the admin did not upload one.
 */
export function cldVideoPoster(url: string, width = 1200): string | null {
    try {
        const parsed = new URL(url)
        if (parsed.hostname !== 'res.cloudinary.com') return null
        if (!parsed.pathname.includes(VIDEO_UPLOAD_SEGMENT)) return null
        if (/\/s--[^/]+--\//.test(parsed.pathname)) return null
    } catch {
        return null
    }
    const transform = `so_0,f_auto,q_auto,c_limit,w_${Math.round(width)}`
    return url
        .replace(VIDEO_UPLOAD_SEGMENT, `${VIDEO_UPLOAD_SEGMENT}${transform}/`)
        .replace(/\.(mp4|webm)(\?.*)?$/i, '.jpg')
}
