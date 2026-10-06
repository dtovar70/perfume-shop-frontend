import { Link } from 'react-router'
import { Clock, Mail, MapPin } from 'lucide-react'

import { BrandLogo } from '@/components/layouts/BrandLogo'
import { SocialIcon } from '@/components/shared/SocialIcon'
import { appConfig } from '@/configs/app.config'
import { CONTAINER } from '@/constants/layout.constant'
import { ROUTES } from '@/constants/route.constant'
import { cn } from '@/utils/cn'
import { socialLinks } from '@/utils/content'
import { useCategoryLinks } from '@/utils/hooks/useNavLinks'
import { useShippingContent, useSiteContent } from '@/utils/hooks/useSiteContent'

const SHOP_EXTRA_LINKS = [
    { label: 'Todas las marcas', to: ROUTES.brands },
    { label: 'Todo el catálogo', to: ROUTES.catalog },
]

const ORDER_LINKS = [
    { label: 'Mis pedidos', to: ROUTES.myOrders },
    { label: 'Consultar pedido', to: ROUTES.orderLookup },
    { label: 'Carrito', to: ROUTES.cart },
]

/** Shipping and payment answers live in the contact page FAQ (`#preguntas`). */
const HELP_LINKS = [
    { label: 'Nosotros', to: ROUTES.about },
    { label: 'Contacto', to: ROUTES.contact },
    { label: 'Envíos y pagos', to: `${ROUTES.contact}#preguntas` },
]

const headingClass = 'text-[11px] font-bold tracking-[0.24em] text-gold-300 uppercase'
const linkClass =
    'inline-flex min-h-8 items-center text-sm text-ivory/70 transition hover:text-ivory hover:underline hover:decoration-gold-400 hover:underline-offset-4'

export function Footer() {
    const categoryLinks = useCategoryLinks(appConfig.categoryLinkLimits.footer)
    const { general, contact } = useSiteContent()
    const { freeShippingText } = useShippingContent()
    const socials = socialLinks(contact)
    const brand = `${appConfig.wordmark.lead}${appConfig.wordmark.accent}`

    const columns = [
        { id: 'footer-shop', title: 'Tienda', links: [...categoryLinks, ...SHOP_EXTRA_LINKS] },
        { id: 'footer-orders', title: 'Tus pedidos', links: ORDER_LINKS },
        { id: 'footer-help', title: 'Ayuda', links: HELP_LINKS },
    ]

    return (
        <footer className="gradient-noir relative mt-20 overflow-hidden text-ivory sm:mt-28">
            {/* A gold hairline and a faint rose glow mark the edge of the page. */}
            <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-gold-400/70 to-transparent"
            />
            <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-40 right-[-10%] size-96 rounded-full bg-rose-700/25 blur-3xl"
            />

            <div
                className={cn(
                    CONTAINER,
                    'relative grid gap-12 py-14 sm:py-16 lg:grid-cols-[1.3fr_2fr] lg:gap-16',
                )}
            >
                <div className="space-y-6">
                    <BrandLogo inverted withTagline />
                    <p className="max-w-sm text-sm leading-relaxed text-ivory/65">
                        {general.description}
                    </p>

                    {socials.length > 0 ? (
                        <ul className="flex gap-2" aria-label="Redes sociales">
                            {socials.map((social) => (
                                <li key={social.label}>
                                    <a
                                        href={social.href}
                                        target="_blank"
                                        rel="noreferrer"
                                        aria-label={`${social.label} (${social.handle})`}
                                        className="flex size-11 items-center justify-center rounded-full border border-ivory/15 text-ivory/80 transition hover:border-gold-400 hover:bg-gold-400/10 hover:text-gold-200"
                                    >
                                        <SocialIcon network={social.label} className="size-4.5" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    ) : null}
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
                    {columns.map((column) => (
                        <nav key={column.id} aria-labelledby={column.id} className="space-y-4">
                            <h2 id={column.id} className={headingClass}>
                                {column.title}
                            </h2>
                            <ul className="space-y-1">
                                {column.links.map((link) => (
                                    <li key={link.to}>
                                        <Link to={link.to} className={linkClass}>
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ))}

                    <div className="col-span-2 space-y-4 sm:col-span-1">
                        <h2 className={headingClass}>Contacto</h2>
                        <ul className="space-y-3 text-sm text-ivory/70">
                            <li className="flex gap-2.5">
                                <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-gold-400" />
                                {contact.city}
                            </li>
                            <li className="flex gap-2.5">
                                <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-gold-400" />
                                {contact.schedule}
                            </li>
                            <li className="flex min-w-0 gap-2.5">
                                <Mail aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-gold-400" />
                                <a
                                    href={`mailto:${contact.email}`}
                                    className="min-w-0 break-all transition hover:text-ivory"
                                >
                                    {contact.email}
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="relative border-t border-ivory/10">
                <div
                    className={cn(
                        CONTAINER,
                        'flex flex-col gap-2 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-xs text-ivory/55 sm:flex-row sm:items-center sm:justify-between',
                    )}
                >
                    <p>
                        © {new Date().getFullYear()} {brand}. Todos los derechos reservados.
                    </p>
                    <p>{freeShippingText}</p>
                </div>
            </div>
        </footer>
    )
}
