import { cva } from 'class-variance-authority'
import { ChevronRight, Package, Search } from 'lucide-react'
import { Link, NavLink } from 'react-router'

import { PRODUCT_GENDERS } from '@/@types/product'
import { SearchField } from '@/components/layouts/SearchField'
import { SocialIcon } from '@/components/shared/SocialIcon'
import { ButtonLink, Drawer } from '@/components/ui'
import { GENDER_LABELS } from '@/constants/product.constant'
import { ROUTES } from '@/constants/route.constant'
import { useMobileMenu } from '@/store/uiStore'
import { socialLinks } from '@/utils/content'
import { useCategoryLinks, useNavLinks } from '@/utils/hooks/useNavLinks'
import { useShippingContent, useSiteContent } from '@/utils/hooks/useSiteContent'

const mobileLinkVariants = cva(
    'flex min-h-12 items-center justify-between rounded-xl px-3 font-display text-[1.35rem] transition duration-200',
    {
        variants: {
            isActive: {
                true: 'bg-rose-50 text-rose-700',
                false: 'text-ink hover:bg-rose-50/60',
            },
        },
        defaultVariants: { isActive: false },
    },
)

const ORDER_LINKS = [
    { label: 'Mis pedidos', to: ROUTES.myOrders },
    { label: 'Consultar un pedido', to: ROUTES.orderLookup },
] as const

const sectionLabelClass = 'px-3 text-[11px] font-bold tracking-[0.22em] text-gold-700 uppercase'

export function MobileMenu() {
    const { isOpen, close } = useMobileMenu()
    const { before, after } = useNavLinks()
    const categoryLinks = useCategoryLinks()
    const { freeShippingText } = useShippingContent()
    const { contact } = useSiteContent()

    const renderLink = (link: { label: string; to: string }) => (
        <li key={link.to}>
            <NavLink
                to={link.to}
                end
                onClick={close}
                className={({ isActive }) => mobileLinkVariants({ isActive })}
            >
                {link.label}
                <ChevronRight aria-hidden="true" className="size-4 text-ink-soft/60" />
            </NavLink>
        </li>
    )

    return (
        <Drawer isOpen={isOpen} onClose={close} title="Menú" side="left">
            <div className="space-y-7">
                <SearchField onNavigate={close} />

                <nav aria-label="Navegación móvil" className="space-y-6">
                    <ul className="space-y-0.5">{before.map(renderLink)}</ul>

                    <div className="space-y-2">
                        <p className={sectionLabelClass}>Perfumes</p>
                        <ul className="space-y-0.5">
                            {categoryLinks.map(renderLink)}
                            {renderLink({ label: 'Todo el catálogo', to: ROUTES.catalog })}
                        </ul>
                        <ul className="flex flex-wrap gap-2 px-3 pt-2">
                            {PRODUCT_GENDERS.map((gender) => (
                                <li key={gender}>
                                    <Link
                                        to={`${ROUTES.catalog}?gender=${gender}`}
                                        onClick={close}
                                        className="inline-flex h-10 items-center rounded-full border border-line bg-white px-4 text-sm font-semibold text-ink-soft transition hover:border-gold-400 hover:text-ink"
                                    >
                                        {GENDER_LABELS[gender]}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <ul className="space-y-0.5 border-t border-line pt-4">{after.map(renderLink)}</ul>
                </nav>

                <nav aria-label="Tus pedidos" className="space-y-2 border-t border-line pt-4">
                    <p className={sectionLabelClass}>Tus pedidos</p>
                    <ul>
                        {ORDER_LINKS.map((link) => (
                            <li key={link.to}>
                                <NavLink
                                    to={link.to}
                                    end
                                    onClick={close}
                                    className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-semibold text-ink transition hover:bg-rose-50/60"
                                >
                                    {link.to === ROUTES.myOrders ? (
                                        <Package aria-hidden="true" className="size-4 text-gold-700" />
                                    ) : (
                                        <Search aria-hidden="true" className="size-4 text-gold-700" />
                                    )}
                                    {link.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="space-y-4">
                    <ButtonLink to={ROUTES.catalog} fullWidth onClick={close}>
                        Explorar perfumes
                    </ButtonLink>
                    <p className="text-center text-sm text-ink-soft">{freeShippingText}</p>
                    <ul className="flex justify-center gap-2" aria-label="Redes sociales">
                        {socialLinks(contact).map((social) => (
                            <li key={social.label}>
                                <a
                                    href={social.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={`${social.label} (${social.handle})`}
                                    className="flex size-11 items-center justify-center rounded-full border border-line text-ink-soft transition hover:border-gold-400 hover:text-rose-700"
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
