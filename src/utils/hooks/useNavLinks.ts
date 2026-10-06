import { appConfig, type NavLink } from '@/configs/app.config'
import { categoryPath } from '@/constants/route.constant'
import { useCategories } from '@/views/catalog/hooks/useCategories'

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
