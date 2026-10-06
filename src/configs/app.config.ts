import { ROUTES } from '@/constants/route.constant'

export interface NavLink {
    label: string
    to: string
}

/**
 * App configuration that is not editable content. The texts, contact data, socials and
 * shipping values live in the site content (`useSiteContent`), edited from /admin/contenido.
 */
export const appConfig = {
    /** The wordmark is set in type ("Kai" + gold "Zen"), not loaded as an image. */
    wordmark: { lead: 'Kai', accent: 'Zen' },
    /**
     * Main navigation. "Perfumes" opens the live categories (see `useCategoryLinks`), so a
     * category created in the admin shows up on its own.
     */
    navLinks: {
        before: [{ label: 'Inicio', to: ROUTES.home }] satisfies NavLink[],
        after: [
            { label: 'Marcas', to: ROUTES.brands },
            { label: 'Nosotros', to: ROUTES.about },
            { label: 'Contacto', to: ROUTES.contact },
        ] satisfies NavLink[],
    },
    /**
     * How many categories (in admin order) each place lists. The header "Perfumes" menu and the
     * mobile drawer list them all; the home page features the first few as image cards.
     */
    categoryLinkLimits: {
        home: 3,
        footer: 8,
    },
} as const
