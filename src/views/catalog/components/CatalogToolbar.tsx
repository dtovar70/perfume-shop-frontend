import { SlidersHorizontal } from 'lucide-react'

import type { SortOption } from '@/@types/common'
import { Select } from '@/components/ui'
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
}

/** Result count, sort and (below `lg`) the filters button. */
export function CatalogToolbar({
    total,
    sort,
    isRefreshing,
    onSortChange,
    onOpenFilters,
    activeFilterCount,
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
        </div>
    )
}
