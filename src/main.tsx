import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { App } from '@/App'
import { createQueryClient } from '@/configs/query.config'
// Side effect: syncs <html data-theme> and starts following the OS theme before first render.
import '@/store/themeStore'
import '@/index.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
    throw new Error('No se encontró el elemento #root en index.html')
}

const queryClient = createQueryClient()

createRoot(rootElement).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <App />
            {import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} /> : null}
        </QueryClientProvider>
    </StrictMode>,
)
