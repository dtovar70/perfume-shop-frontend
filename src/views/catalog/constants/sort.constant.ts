import type { SelectOption } from '@/components/ui'

/** Always labels, never raw values: the trigger renders `label`. */
export const SORT_SELECT_OPTIONS: SelectOption[] = [
    { value: 'relevance', label: 'Relevancia' },
    { value: 'name-asc', label: 'Nombre A–Z' },
    { value: 'price-asc', label: 'Precio: menor a mayor' },
    { value: 'price-desc', label: 'Precio: mayor a menor' },
    { value: 'newest', label: 'Más nuevos' },
]
