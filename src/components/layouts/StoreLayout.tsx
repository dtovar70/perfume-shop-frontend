import { Outlet } from 'react-router'

import { AnnouncementBar } from '@/components/layouts/AnnouncementBar'
import { CartDrawer } from '@/components/layouts/CartDrawer'
import { Footer } from '@/components/layouts/Footer'
import { Header } from '@/components/layouts/Header'
import { MobileMenu } from '@/components/layouts/MobileMenu'
import { ScrollToTop } from '@/components/route/ScrollToTop'
import { useFillPlaceholders, useSiteContent } from '@/utils/hooks/useSiteContent'

export function StoreLayout() {
    const { announcements } = useSiteContent()
    const fill = useFillPlaceholders()
    const messages = announcements.messages.map((message) => fill(message))

    return (
        <div className="flex min-h-screen flex-col overflow-x-clip">
            <ScrollToTop />
            <AnnouncementBar items={messages} />
            <Header />

            <main className="flex-1">
                <Outlet />
            </main>

            <Footer />

            <CartDrawer />
            <MobileMenu />
        </div>
    )
}
