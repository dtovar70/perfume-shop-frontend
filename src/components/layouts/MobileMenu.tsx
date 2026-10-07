import { cva } from 'class-variance-authority'
import { ChevronRight, Heart, Package, Search } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router'

import { SearchField } from '@/components/layouts/SearchField'
import { ThemeToggle } from '@/components/layouts/ThemeToggle'
import { SocialIcon } from '@/components/shared/SocialIcon'
import { ButtonLink, Drawer } from '@/components/ui'
import { ROUTES } from '@/constants/route.constant'
import { useFavoritesCount } from '@/store/favoritesStore'
import { useTheme } from '@/store/themeStore'
import { useMobileMenu } from '@/store/uiStore'
import { socialLinks } from '@/utils/content'
import { GENDER_LINKS, useCategoryLinks, useNavLinks } from '@/utils/hooks/useNavLinks'
import { useShippingContent, useSiteContent } from '@/utils/hooks/useSiteContent'

const mobileLinkVariants = cva(
    'flex min-h-12 items-center justify-between rounded-xl px-3 font-display text-[1.35rem] transition duration-200',
    {
        variants: {
            isActive: {
                true: 'bg-elevated text-accent',
                false: 'text-fg hover:bg-elevated/60',
            },
        },
        defaultVariants: { isActive: false },
    },
)

const ORDER_LINKS = [
    { label: 'Mis pedidos', to: ROUTES.myOrders, icon: Package },
    { label: 'Consultar un pedido', to: ROUTES.orderLookup, icon: Search },
    { label: 'Favoritos', to: ROUTES.favorites, icon: Heart },
] as const

const sectionLabelClass = 'px-3 text-[11px] font-bold tracking-[0.22em] text-accent uppercase'

export function MobileMenu() {
    const { isOpen, close } = useMobileMenu()
    const { before, after } = useNavLinks()
    const categoryLinks = useCategoryLinks()
    const { freeShippingText } = useShippingContent()
    const { contact } = useSiteContent()
    const { isDark } = useTheme()
    const favoritesCount = useFavoritesCount()

    const location = useLocation()
    const activeGender = new URLSearchParams(location.search).get('gender')
    // `NavLink` ignores the query string, so the gender links work out their own active state.
    const isGenderLinkActive = (link: { to: string }) =>
        location.pathname === ROUTES.catalog &&
        activeGender !== null &&
        link.to.endsWith(`?gender=${activeGender}`)

    /** `isActive`, when given, replaces the path match (for links whose query string matters). */
    const renderLink = (link: { label: string; to: string }, isActive?: boolean) => {
        const content = (
            <>
                {link.label}
                <ChevronRight aria-hidden="true" className="size-4 text-fg-muted" />
            </>
        )
        return (
            <li key={link.to}>
                {isActive === undefined ? (
                    <NavLink
                        to={link.to}
                        end
                        onClick={close}
                        className={({ isActive: matches }) =>
                            mobileLinkVariants({ isActive: matches })
                        }
                    >
                        {content}
                    </NavLink>
                ) : (
                    <Link
                        to={link.to}
                        onClick={close}
                        aria-current={isActive ? 'page' : undefined}
                        className={mobileLinkVariants({ isActive })}
                    >
                        {content}
                    </Link>
                )}
            </li>
        )
    }

    return (
        <Drawer isOpen={isOpen} onClose={close} title="Menú" side="left">
            <div className="space-y-7">
                <SearchField onNavigate={close} />

                <nav aria-label="Navegación móvil" className="space-y-6">
                    <ul className="space-y-0.5">{before.map((link) => renderLink(link))}</ul>

                    <div className="space-y-2">
                        <p id="mobile-menu-type" className={sectionLabelClass}>
                            Tipo
                        </p>
                        <ul aria-labelledby="mobile-menu-type" className="space-y-0.5">
                            {categoryLinks.map((link) => renderLink(link))}
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <p id="mobile-menu-for" className={sectionLabelClass}>
                            Para
                        </p>
                        <ul aria-labelledby="mobile-menu-for" className="space-y-0.5">
                            {GENDER_LINKS.map((link) => renderLink(link, isGenderLinkActive(link)))}
                        </ul>
                    </div>

                    <ul className="space-y-0.5">
                        {renderLink(
                            { label: 'Todo el catálogo', to: ROUTES.catalog },
                            location.pathname === ROUTES.catalog && !activeGender,
                        )}
                    </ul>

                    <ul className="space-y-0.5 border-t border-line pt-4">
                        {after.map((link) => renderLink(link))}
                    </ul>
                </nav>

                <nav
                    aria-label="Tus pedidos y favoritos"
                    className="space-y-2 border-t border-line pt-4"
                >
                    <p className={sectionLabelClass}>Tus pedidos</p>
                    <ul>
                        {ORDER_LINKS.map((link) => (
                            <li key={link.to}>
                                <NavLink
                                    to={link.to}
                                    end
                                    onClick={close}
                                    className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-semibold text-fg transition hover:bg-elevated/60"
                                >
                                    <link.icon aria-hidden="true" className="size-4 text-accent" />
                                    {link.label}
                                    {link.to === ROUTES.favorites && favoritesCount > 0 ? (
                                        <span className="ml-auto min-w-6 rounded-full bg-elevated px-1.5 py-0.5 text-center text-xs font-bold text-accent-strong tabular-nums">
                                            {favoritesCount}
                                        </span>
                                    ) : null}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="flex items-center justify-between gap-3 border-t border-line pt-4 pl-3">
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold tracking-[0.22em] text-accent uppercase">
                            Apariencia
                        </p>
                        <p className="text-[15px] font-semibold text-fg">
                            {isDark ? 'Modo oscuro' : 'Modo claro'}
                        </p>
                    </div>
                    <ThemeToggle className="border-line bg-surface" />
                </div>

                <div className="space-y-4">
                    <ButtonLink to={ROUTES.catalog} fullWidth onClick={close}>
                        Explorar perfumes
                    </ButtonLink>
                    <p className="text-center text-sm text-fg-soft">{freeShippingText}</p>
                    <ul className="flex justify-center gap-2" aria-label="Redes sociales">
                        {socialLinks(contact).map((social) => (
                            <li key={social.label}>
                                <a
                                    href={social.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={`${social.label} (${social.handle})`}
                                    className="flex size-11 items-center justify-center rounded-full border border-line text-fg-soft transition hover:border-cherry-500/50 hover:text-accent"
                                >
                                    <SocialIcon network={social.label} className="size-4.5" />
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </Drawer>
    )
}
