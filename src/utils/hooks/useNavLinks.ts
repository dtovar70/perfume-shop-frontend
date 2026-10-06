import { PRODUCT_GENDERS } from '@/@types/product'
import { appConfig, type NavLink } from '@/configs/app.config'
import { GENDER_LABELS } from '@/constants/product.constant'
import { categoryPath, ROUTES } from '@/constants/route.constant'
import { useCategories } from '@/views/catalog/hooks/useCategories'

/**
 * Categories are the perfume type (Árabes, Europeos, Sets y regalos); who it is for is the
 * `gender` filter. These are the catalog links per gender: `/catalogo?gender=mujer`.
 */
export const GENDER_LINKS: NavLink[] = PRODUCT_GENDERS.map((gender) => ({
    label: GENDER_LABELS[gender],
    to: `${ROUTES.catalog}?gender=${gender}`,
}))

/** Links to the first `limit` categories, in the order set in the admin. */
export function useCategoryLinks(limit?: number): NavLink[] {
    const { data: categories } = useCategories()
    return (categories ?? [])
        .slice(0, limit)
        .map((category) => ({ label: category.name, to: categoryPath(category.slug) }))
}

/** Main navigation: "Inicio", then the "Perfumes" menu (rendered apart), then the rest. */
export function useNavLinks(): { before: NavLink[]; after: NavLink[] } {
    return { before: appConfig.navLinks.before, after: appConfig.navLinks.after }
}
