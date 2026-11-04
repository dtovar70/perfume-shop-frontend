/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_NAME: string
    readonly VITE_API_URL: string
    /** KODARY public status endpoint for this store. Optional: when unset the store never blocks. */
    readonly VITE_KODARY_STATUS_URL?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
