import { useCallback } from 'react'
import { useSearchParams } from 'react-router'

import type { ProductCardVariant } from '@/components/shared/ProductCard'
import { VIEW_PARAM } from '@/views/catalog/hooks/useCatalogFilters'

const STORAGE_KEY = 'kaizen-catalog-view'
const LIST_VALUE = 'lista'
const GRID_VALUE = 'cuadricula'

function readStored(): ProductCardVariant {
    try {
        return window.localStorage.getItem(STORAGE_KEY) === 'list' ? 'list' : 'grid'
    } catch {
        return 'grid'
    }
}

function store(view: ProductCardVariant): void {
    try {
        window.localStorage.setItem(STORAGE_KEY, view)
    } catch {
        // Storage blocked: the choice still lives in the URL for this visit.
    }
}

/**
 * Grid or list layout of the catalog. The URL is the source of truth (`?vista=lista`, shareable
 * and kept by "back"); without the param, the visitor's last choice (localStorage) applies.
 */
export function useCatalogView(): [ProductCardVariant, (view: ProductCardVariant) => void] {
    const [searchParams, setSearchParams] = useSearchParams()
    const param = searchParams.get(VIEW_PARAM)
    const view: ProductCardVariant =
        param === LIST_VALUE ? 'list' : param === GRID_VALUE ? 'grid' : readStored()

    const setView = useCallback(
        (next: ProductCardVariant) => {
            store(next)
            setSearchParams(
                (current) => {
                    const params = new URLSearchParams(current)
                    params.set(VIEW_PARAM, next === 'list' ? LIST_VALUE : GRID_VALUE)
                    return params
                },
                { replace: true, preventScrollReset: true },
            )
        },
        [setSearchParams],
    )

    return [view, setView]
}
