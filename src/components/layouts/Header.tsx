import { useState } from 'react'
import { cva } from 'class-variance-authority'
import { Menu, Package, Search, ShoppingBag, X } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { NavLink, useNavigate } from 'react-router'

import { BrandLogo } from '@/components/layouts/BrandLogo'
import { HeaderIconButton } from '@/components/layouts/HeaderIconButton'
import { PerfumesMenu } from '@/components/layouts/PerfumesMenu'
import { SearchField } from '@/components/layouts/SearchField'
import { Tooltip } from '@/components/ui'
import { CONTAINER } from '@/constants/layout.constant'
import { ROUTES } from '@/constants/route.constant'
import { useCartCount } from '@/store/cartStore'
import { useCartDrawer, useMobileMenu } from '@/store/uiStore'
import { cn } from '@/utils/cn'
import { useNavLinks } from '@/utils/hooks/useNavLinks'

/** Text links with a gold hairline that draws in under the active/hovered one. */
const navLinkVariants = cva(
    "relative px-3 py-2 text-[13px] font-bold tracking-[0.14em] whitespace-nowrap uppercase transition-colors duration-200 after:absolute after:inset-x-3 after:bottom-0.5 after:h-px after:origin-left after:bg-gold-500 after:transition-transform after:duration-300 after:content-[''] hover:text-rose-700 hover:after:scale-x-100 data-active:text-rose-700 data-active:after:scale-x-100",
    {
        variants: {
            isActive: {
                true: 'text-rose-700 after:scale-x-100',
                false: 'text-ink after:scale-x-0',
            },
        },
        defaultVariants: { isActive: false },
    },
)

export function Header() {
    const cartCount = useCartCount()
    const cartDrawer = useCartDrawer()
    const mobileMenu = useMobileMenu()
    const navigate = useNavigate()
    const { before, after } = useNavLinks()
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const reduceMotion = useReducedMotion()

    const renderLink = (link: { label: string; to: string }) => (
        <NavLink
            key={link.to}
            to={link.to}
            end
            className={({ isActive }) => navLinkVariants({ isActive })}
        >
            {link.label}
        </NavLink>
    )

    const cartBadge =
        cartCount > 0 ? (
            <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-700 px-1 text-[10px] font-bold text-white tabular-nums ring-2 ring-ivory">
                {cartCount > 99 ? '99+' : cartCount}
            </span>
        ) : null

    return (
        <header className="sticky top-0 z-40 border-b border-line/80 bg-ivory/85 backdrop-blur-md supports-[backdrop-filter]:bg-ivory/75">
            <div
                className={cn(
                    CONTAINER,
                    'grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-2 lg:flex lg:h-20 lg:gap-6',
                )}
            >
                {/* Phones: menu on the left, logo centered, search + cart on the right. */}
                <div className="flex items-center lg:hidden">
                    <HeaderIconButton
                        onClick={mobileMenu.toggle}
                        aria-expanded={mobileMenu.isOpen}
                        label="Abrir el menú"
                        icon={<Menu aria-hidden="true" className="size-5" />}
                        className="-ml-2.5"
                    />
                </div>

                <BrandLogo className="items-center lg:items-start" />

                <nav
                    aria-label="Navegación principal"
                    className="hidden flex-1 items-center justify-center gap-1 lg:flex"
                >
                    {before.map(renderLink)}
                    <PerfumesMenu triggerClassName={navLinkVariants({ isActive: false })} />
                    {after.map(renderLink)}
                </nav>

                <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                    <SearchField className="hidden w-60 xl:block" />

                    <HeaderIconButton
                        onClick={() => setIsSearchOpen((open) => !open)}
                        aria-expanded={isSearchOpen}
                        aria-controls="header-search"
                        label={isSearchOpen ? 'Cerrar la búsqueda' : 'Buscar perfumes'}
                        icon={
                            isSearchOpen ? (
                                <X aria-hidden="true" className="size-5" />
                            ) : (
                                <Search aria-hidden="true" className="size-5" />
                            )
                        }
                        className="xl:hidden"
                    />

                    {/* Phones reach it from the menu drawer, keeping the bar to two buttons. */}
                    <Tooltip label="Mis pedidos" className="hidden sm:inline-flex">
                        <HeaderIconButton
                            onClick={() => navigate(ROUTES.myOrders)}
                            label="Mis pedidos"
                            icon={<Package aria-hidden="true" className="size-5" />}
                        />
                    </Tooltip>

                    <HeaderIconButton
                        onClick={cartDrawer.toggle}
                        label={`Abrir el carrito (${cartCount} artículos)`}
                        icon={<ShoppingBag aria-hidden="true" className="size-5" />}
                        badge={cartBadge}
                        className="-mr-2.5 sm:mr-0"
                    />
                </div>
            </div>

            <AnimatePresence initial={false}>
                {isSearchOpen ? (
                    <motion.div
                        id="header-search"
                        initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        animate={reduceMotion ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                        exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="overflow-hidden border-t border-line/80 xl:hidden"
                    >
                        <div className={cn(CONTAINER, 'py-3')}>
                            <SearchField autoFocus onSubmitted={() => setIsSearchOpen(false)} />
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </header>
    )
}
