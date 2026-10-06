import { useCallback, useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useNavigate } from 'react-router'

import { Input } from '@/components/ui'
import { ROUTES } from '@/constants/route.constant'
import { useDebouncedValue } from '@/utils/hooks/useDebouncedValue'
import { CATALOG_SEARCH_PARAM } from '@/views/catalog/hooks/useCatalogFilters'
import { useSiteContent } from '@/utils/hooks/useSiteContent'

const DEBOUNCE_MS = 400

export interface SearchFieldProps {
    className?: string
    /** Called after a navigation so overlays can close themselves. */
    onNavigate?: () => void
    /** Called when the search is submitted (Enter), not on the live, debounced updates. */
    onSubmitted?: () => void
    /** Focus the field on mount (the header's expandable search row). */
    autoFocus?: boolean
}

export function SearchField({
    className,
    onNavigate,
    onSubmitted,
    autoFocus = false,
}: SearchFieldProps) {
    const { general } = useSiteContent()
    const navigate = useNavigate()
    const [term, setTerm] = useState('')
    const debouncedTerm = useDebouncedValue(term, DEBOUNCE_MS)
    const hasTyped = useRef(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const onNavigateRef = useRef(onNavigate)

    useEffect(() => {
        onNavigateRef.current = onNavigate
    })

    const goToCatalog = useCallback(
        (rawTerm: string) => {
            const query = rawTerm.trim()
            const search = query ? `?${new URLSearchParams({ [CATALOG_SEARCH_PARAM]: query })}` : ''

            void navigate(`${ROUTES.catalog}${search}`)
            onNavigateRef.current?.()
        },
        [navigate],
    )

    useEffect(() => {
        if (autoFocus) inputRef.current?.focus()
    }, [autoFocus])

    useEffect(() => {
        if (!hasTyped.current) return
        goToCatalog(debouncedTerm)
    }, [debouncedTerm, goToCatalog])

    return (
        <form
            role="search"
            className={className}
            onSubmit={(event) => {
                event.preventDefault()
                goToCatalog(term)
                onSubmitted?.()
            }}
        >
            <Input
                ref={inputRef}
                label="Buscar perfumes"
                hideLabel
                type="search"
                value={term}
                placeholder={general.searchPlaceholder}
                leadingIcon={<Search aria-hidden="true" className="size-4" />}
                trailingAction={
                    term ? (
                        <button
                            type="button"
                            aria-label="Borrar la búsqueda"
                            onClick={() => {
                                hasTyped.current = true
                                setTerm('')
                                inputRef.current?.focus()
                            }}
                            // 32px inside the field; the pseudo-element makes the hit area 44px.
                            className="relative flex size-8 items-center justify-center rounded-full text-fg-soft transition after:absolute after:-inset-1.5 after:content-[''] hover:bg-elevated hover:text-fg"
                        >
                            <X aria-hidden="true" className="size-4" />
                        </button>
                    ) : null
                }
                onChange={(event) => {
                    hasTyped.current = true
                    setTerm(event.target.value)
                }}
            />
        </form>
    )
}
