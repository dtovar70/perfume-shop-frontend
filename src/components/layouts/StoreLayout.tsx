import { Outlet } from 'react-router'

import { CartDrawer } from '@/components/layouts/CartDrawer'
import { Footer } from '@/components/layouts/Footer'
import { Header } from '@/components/layouts/Header'
import { MobileMenu } from '@/components/layouts/MobileMenu'
import { WhatsAppFab } from '@/components/layouts/WhatsAppFab'
import { ScrollToTop } from '@/components/route/ScrollToTop'
import { FlyToCartLayer } from '@/components/shared/FlyToCartLayer'

export function StoreLayout() {
    return (
        <div className="flex min-h-screen flex-col overflow-x-clip">
            <ScrollToTop />
            <Header />

            <main className="flex-1">
                <Outlet />
            </main>

            <Footer />

            <WhatsAppFab />
            <CartDrawer />
            <MobileMenu />
            <FlyToCartLayer />
        </div>
    )
}
