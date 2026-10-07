import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

/**
 * The API serves `/sitemap.xml` at its root (outside `/api`). On build, the `Sitemap:` line of
 * robots.txt is rewritten to `<origin of VITE_API_URL>/sitemap.xml`, so the deployed file always
 * names the real host without a hand-edited placeholder.
 */
function robotsSitemap(): Plugin {
    let apiUrl = ''
    let robotsPath = ''
    return {
        name: 'kaizen-robots-sitemap',
        apply: 'build',
        configResolved(config) {
            apiUrl = config.env.VITE_API_URL ?? ''
            robotsPath = resolve(config.root, config.build.outDir, 'robots.txt')
        },
        closeBundle() {
            if (!apiUrl || !existsSync(robotsPath)) {
                this.warn('VITE_API_URL is not set: robots.txt keeps its development sitemap URL.')
                return
            }
            const base = apiUrl.replace(/\/+$/, '').replace(/\/api$/, '')
            const robots = readFileSync(robotsPath, 'utf8').replace(
                /^Sitemap:.*$/m,
                `Sitemap: ${base}/sitemap.xml`,
            )
            writeFileSync(robotsPath, robots)
        },
    }
}

export default defineConfig({
    plugins: [react(), tailwindcss(), robotsSitemap()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    server: {
        port: 5173,
    },
})
