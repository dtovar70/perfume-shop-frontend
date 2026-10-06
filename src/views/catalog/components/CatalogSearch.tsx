import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'

import { Input } from '@/components/ui'
import { cn } from '@/utils/cn'
import { useDebouncedValue } from '@/utils/hooks/useDebouncedValue'
import { useSiteContent } from '@/utils/hooks/useSiteContent'

const DEBOUNCE_MS = 350

export interface CatalogSearchProps {
    value: string
    onSearch: (search: string) => void
    className?: string
}

/**
 * The catalog's own search field (phones and tablets; desktop uses the header's). Filters live
 * as the visitor types, debounced; the × only shows while there is text.
 */
export function CatalogSearch({ value, onSearch, className }: CatalogSearchProps) {
    const { general } = useSiteContent()
    const [term, setTerm] = useState(value)
    const debounced = useDebouncedValue(term, DEBOUNCE_MS)
    const inputRef = useRef<HTMLInputElement>(null)
    const hasTyped = useRef(false)
    const onSearchRef = useRef(onSearch)

    useEffect(() => {
        onSearchRef.current = onSearch
    })

    // The URL changed elsewhere (header search, a chip): mirror it unless the user is typing.
    const [lastValue, setLastValue] = useState(value)
    if (lastValue !== value) {
        setLastValue(value)
        if (value !== term.trim()) setTerm(value)
    }

    useEffect(() => {
        if (!hasTyped.current) return
        onSearchRef.current(debounced.trim())
    }, [debounced])

    return (
        <form
            role="search"
            className={className}
            onSubmit={(event) => {
                event.preventDefault()
                hasTyped.current = true
                onSearch(term.trim())
                inputRef.current?.blur()
            }}
        >
            <Input
                ref={inputRef}
                label="Buscar en el catálogo"
                hideLabel
                type="search"
                enterKeyHint="search"
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
                            className={cn(
                                "relative flex size-8 items-center justify-center rounded-full text-fg-soft transition after:absolute after:-inset-1.5 after:content-[''] hover:bg-elevated hover:text-fg",
                            )}
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
