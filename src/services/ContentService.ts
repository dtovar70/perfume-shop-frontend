import type { AdminContent, AdminContentSection } from '@/@types/admin'
import type { ContentSection, HeroMediaType, SiteContent } from '@/@types/content'
import { apiClient } from '@/services/ApiClient'

const ADMIN_CONTENT = '/admin/content'

/** An uploaded hero file; saving the home section with its URL publishes it. */
export interface HeroMediaUpload {
    url: string
    publicId: string
    type: HeroMediaType
    /** The `poster` image sent along, if any. */
    posterUrl: string | null
}

function sectionPath(section: ContentSection, suffix = ''): string {
    return `${ADMIN_CONTENT}/${encodeURIComponent(section)}${suffix}`
}

/** Editable site content: public read, admin read/replace/reset. */
export const ContentService = {
    /** Every section, stored values merged over the defaults by the API. */
    getContent: (signal?: AbortSignal) => apiClient.get<SiteContent>('/content', { signal }),

    getAdminContent: () => apiClient.get<AdminContent>(ADMIN_CONTENT),
    /** Replaces the whole section; returns it as saved. */
    updateSection: <K extends ContentSection>(section: K, value: SiteContent[K]) =>
        apiClient.put<AdminContentSection<K>>(sectionPath(section), value),
    /**
     * Uploads the hero's image or video (`file`) and, optionally, a still `poster` image.
     * Nothing changes on the storefront until the home section is saved with the returned URL.
     */
    uploadHeroMedia: (
        file: File,
        options: { poster?: File; onProgress?: (fraction: number) => void } = {},
    ) => {
        const form = new FormData()
        form.append('file', file)
        if (options.poster) form.append('poster', options.poster)
        return apiClient.upload<HeroMediaUpload>(
            `${ADMIN_CONTENT}/hero-media`,
            form,
            options.onProgress ?? (() => undefined),
        )
    },
    /** ADMIN only: drops the stored value so the built-in texts are shown again. */
    resetSection: <K extends ContentSection>(section: K) =>
        apiClient.post<AdminContentSection<K>>(sectionPath(section, '/reset')),
} as const
