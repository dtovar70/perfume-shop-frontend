import { useEffect, useRef, useState } from 'react'
import { cva } from 'class-variance-authority'
import { Heart, Menu, Package, Search, ShoppingBag, X } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { NavLink, useNavigate } from 'react-router'

import { BrandLogo } from '@/components/layouts/BrandLogo'
import { HeaderIconButton } from '@/components/layouts/HeaderIconButton'
import { PerfumesMenu } from '@/components/layouts/PerfumesMenu'
import { SearchField } from '@/components/layouts/SearchField'
import { ThemeToggle } from '@/components/layouts/ThemeToggle'
import { Tooltip } from '@/components/ui'
import { CONTAINER } from '@/constants/layout.constant'
import { ROUTES } from '@/constants/route.constant'
import { useCartCount } from '@/store/cartStore'
import { useFavoritesCount } from '@/store/favoritesStore'
import { themeToggleLabel, useTheme } from '@/store/themeStore'
import { useCartDrawer, useCartPulse, useMobileMenu } from '@/store/uiStore'
import { cn } from '@/utils/cn'
import { prefersReducedMotion } from '@/utils/flyToCart'
import { useNavLinks } from '@/utils/hooks/useNavLinks'

/** Pill links, as in the original store: the active one sits on a cherry tint. */
const navLinkVariants = cva(
    'rounded-full px-3.5 py-2 text-sm font-semibold whitespace-nowrap transition duration-200',
    {
        variants: {
            isActive: {
                true: 'bg-cherry-tint text-accent-strong',
                false: 'text-fg-soft hover:bg-elevated hover:text-fg data-active:bg-cherry-tint data-active:text-accent-strong',
            },
        },
        defaultVariants: { isActive: false },
    },
)

/** The cart button's landing feedback: icon bounce, badge pop and a cherry ripple. */
function useCartLanding() {
    const cartPulse = useCartPulse()
    const iconRef = useRef<HTMLSpanElement>(null)
    const badgeRef = useRef<HTMLSpanElement>(null)
    const rippleRef = useRef<HTMLSpanElement>(null)

    useEffect(() => {
        if (cartPulse === 0) return
        const animations: Animation[] = []
        const play = (
            element: HTMLElement | null,
            keyframes: Keyframe[],
            options: KeyframeAnimationOptions,
        ) => {
            if (element && typeof element.animate === 'function') {
                animations.push(element.animate(keyframes, options))
            }
        }

        if (prefersReducedMotion()) {
            // Only a subtle pop of the count.
            play(
                badgeRef.current,
                [
                    { transform: 'scale(1)' },
                    { transform: 'scale(1.15)' },
                    { transform: 'scale(1)' },
                ],
                { duration: 200, easing: 'ease-out' },
            )
            return () => animations.forEach((animation) => animation.cancel())
        }

        play(
            badgeRef.current,
            [
                { transform: 'scale(1)' },
                { transform: 'scale(1.35)', offset: 0.4 },
                { transform: 'scale(1)' },
            ],
            { duration: 420, easing: 'cubic-bezier(.34,1.56,.64,1)' },
        )
        play(
            iconRef.current,
            [
                { transform: 'translateY(0) scale(1)' },
                { transform: 'translateY(-3px) scale(1.18)', offset: 0.35 },
                { transform: 'translateY(1px) scale(0.94)', offset: 0.7 },
                { transform: 'translateY(0) scale(1)' },
            ],
            { duration: 460, easing: 'ease-out' },
        )
        play(
            rippleRef.current,
            [
                { transform: 'scale(0.7)', opacity: 0.6 },
                { transform: 'scale(1.6)', opacity: 0 },
            ],
            { duration: 600, easing: 'cubic-bezier(.2,.7,.3,1)' },
        )
        return () => animations.forEach((animation) => animation.cancel())
    }, [cartPulse])

    return { iconRef, badgeRef, rippleRef }
}

export function Header() {
    const cartCount = useCartCount()
    const favoritesCount = useFavoritesCount()
    const {
        iconRef: cartIconRef,
        badgeRef: cartBadgeRef,
        rippleRef: cartRippleRef,
    } = useCartLanding()
    const cartDrawer = useCartDrawer()
    const mobileMenu = useMobileMenu()
    const navigate = useNavigate()
    const { before, after } = useNavLinks()
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const reduceMotion = useReducedMotion()
    const { isDark } = useTheme()

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

    const cartBadge = (
        <>
            <span
                ref={cartRippleRef}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-full border-2 border-cherry-500 opacity-0"
            />
            {cartCount > 0 ? (
                <span
                    ref={cartBadgeRef}
                    className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-cherry-500 px-1 text-[11px] font-bold text-on-cherry tabular-nums ring-2 ring-canvas"
                >
                    {cartCount > 99 ? '99+' : cartCount}
                </span>
            ) : null}
        </>
    )

    return (
        <header className="sticky top-0 z-40 border-b border-line bg-canvas/80 backdrop-blur-md">
            <div className={cn(CONTAINER, 'flex h-16 items-center gap-3 lg:h-20 lg:gap-6')}>
                <BrandLogo />

                <nav
                    aria-label="Navegación principal"
                    className="hidden flex-1 items-center justify-center gap-0.5 lg:flex"
                >
                    {before.map(renderLink)}
                    <PerfumesMenu triggerClassName={navLinkVariants({ isActive: false })} />
                    {after.map(renderLink)}
                </nav>

                <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
                    <SearchField className="hidden w-64 xl:block" />

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

                    {/* Phones reach it from the menu drawer, keeping the bar to three buttons. */}
                    <Tooltip label="Mis pedidos" className="hidden sm:inline-flex">
                        <HeaderIconButton
                            onClick={() => navigate(ROUTES.myOrders)}
                            label="Mis pedidos"
                            icon={<Package aria-hidden="true" className="size-5" />}
                        />
                    </Tooltip>

                    {/* Like "Mis pedidos": phones reach it from the menu drawer. */}
                    <Tooltip label="Favoritos" className="hidden sm:inline-flex">
                        <HeaderIconButton
                            onClick={() => navigate(ROUTES.favorites)}
                            label={
                                favoritesCount > 0 ? `Favoritos (${favoritesCount})` : 'Favoritos'
                            }
                            icon={<Heart aria-hidden="true" className="size-5" />}
                            badge={
                                favoritesCount > 0 ? (
                                    <span
                                        aria-hidden="true"
                                        className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-elevated px-1 text-[11px] font-bold text-accent-strong tabular-nums ring-2 ring-canvas"
                                    >
                                        {favoritesCount > 99 ? '99+' : favoritesCount}
                                    </span>
                                ) : null
                            }
                        />
                    </Tooltip>

                    {/* On phones the theme switch lives in the menu drawer, like "Mis pedidos". */}
                    <Tooltip label={themeToggleLabel(isDark)} className="hidden sm:inline-flex">
                        <ThemeToggle />
                    </Tooltip>

                    <HeaderIconButton
                        onClick={cartDrawer.toggle}
                        label={`Abrir el carrito (${cartCount} artículos)`}
                        data-cart-target=""
                        icon={
                            <span ref={cartIconRef} className="flex">
                                <ShoppingBag aria-hidden="true" className="size-5" />
                            </span>
                        }
                        badge={cartBadge}
                    />

                    <HeaderIconButton
                        onClick={mobileMenu.toggle}
                        aria-expanded={mobileMenu.isOpen}
                        label="Abrir el menú"
                        icon={<Menu aria-hidden="true" className="size-5" />}
                        className="-mr-1.5 lg:hidden"
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
                        className="overflow-hidden border-t border-line xl:hidden"
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
