import { LayoutGrid, List, SlidersHorizontal } from 'lucide-react'

import type { SortOption } from '@/@types/common'
import type { ProductCardVariant } from '@/components/shared/ProductCard'
import { Select } from '@/components/ui'
import { cn } from '@/utils/cn'
import { SORT_SELECT_OPTIONS } from '@/views/catalog/constants/sort.constant'

const SORT_VALUES = SORT_SELECT_OPTIONS.map((option) => option.value)

function isSortOption(value: string): value is SortOption {
    return SORT_VALUES.includes(value)
}

export interface CatalogToolbarProps {
    total: number
    sort: SortOption
    isRefreshing: boolean
    onSortChange: (sort: SortOption) => void
    /** Phones and tablets: opens the filter drawer. Omitted on desktop (sidebar). */
    onOpenFilters?: () => void
    activeFilterCount: number
    view: ProductCardVariant
    onViewChange: (view: ProductCardVariant) => void
}

const VIEW_OPTIONS = [
    { value: 'grid', label: 'Ver en cuadrícula', icon: LayoutGrid },
    { value: 'list', label: 'Ver en lista', icon: List },
] as const satisfies readonly { value: ProductCardVariant; label: string; icon: typeof List }[]

/** Grid / list segmented control: two 44px toggle buttons (`aria-pressed`). */
function ViewToggle({
    view,
    onChange,
}: {
    view: ProductCardVariant
    onChange: (view: ProductCardVariant) => void
}) {
    return (
        <div
            role="group"
            aria-label="Vista de los productos"
            className="flex shrink-0 overflow-hidden rounded-xl border border-line bg-surface"
        >
            {VIEW_OPTIONS.map(({ value, label, icon: Icon }) => {
                const isActive = view === value
                return (
                    <button
                        key={value}
                        type="button"
                        aria-pressed={isActive}
                        aria-label={label}
                        title={label}
                        onClick={() => onChange(value)}
                        className={cn(
                            // 42px inside the 1px border; the pseudo-element brings the hit area to 44px.
                            "relative flex h-[2.625rem] w-11 items-center justify-center transition duration-200 after:absolute after:-inset-px after:content-['']",
                            isActive
                                ? 'bg-cherry-tint text-accent-strong'
                                : 'text-fg-soft hover:bg-elevated hover:text-fg',
                        )}
                    >
                        <Icon aria-hidden="true" className="size-4.5" />
                    </button>
                )
            })}
        </div>
    )
}

/** Result count, sort, grid/list toggle and (below `lg`) the filters button. */
export function CatalogToolbar({
    total,
    sort,
    isRefreshing,
    onSortChange,
    onOpenFilters,
    activeFilterCount,
    view,
    onViewChange,
}: CatalogToolbarProps) {
    return (
        <div className="flex items-center gap-2 sm:gap-3">
            <p
                aria-live="polite"
                className="mr-auto min-w-0 truncate text-sm text-fg-soft max-sm:sr-only"
            >
                {isRefreshing ? (
                    'Actualizando…'
                ) : (
                    <>
                        <span className="font-bold text-fg tabular-nums">{total}</span>{' '}
                        {total === 1 ? 'perfume' : 'perfumes'}
                    </>
                )}
            </p>

            {onOpenFilters ? (
                <button
                    type="button"
                    onClick={onOpenFilters}
                    aria-haspopup="dialog"
                    className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border border-line bg-surface px-3.5 text-sm font-semibold text-fg transition hover:border-cherry-500/50"
                >
                    <SlidersHorizontal aria-hidden="true" className="size-4" />
                    Filtros
                    {activeFilterCount > 0 ? (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-cherry-500 px-1.5 text-[11px] font-bold text-on-cherry tabular-nums">
                            <span className="sr-only">(</span>
                            {activeFilterCount}
                            <span className="sr-only"> activos)</span>
                        </span>
                    ) : null}
                </button>
            ) : null}

            <div className="min-w-0 flex-1 sm:w-56 sm:flex-none">
                <Select
                    label="Ordenar por"
                    hideLabel
                    options={SORT_SELECT_OPTIONS}
                    value={sort}
                    onChange={(event) => {
                        if (isSortOption(event.target.value)) onSortChange(event.target.value)
                    }}
                    className="text-sm"
                />
            </div>

            <ViewToggle view={view} onChange={onViewChange} />
        </div>
    )
}
