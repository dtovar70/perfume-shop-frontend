import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui'

export interface CatalogPaginationProps {
    page: number
    totalPages: number
    onPageChange: (page: number) => void
}

export function CatalogPagination({ page, totalPages, onPageChange }: CatalogPaginationProps) {
    if (totalPages <= 1) return null

    return (
        <nav
            aria-label="Paginación del catálogo"
            className="flex items-center justify-center gap-3"
        >
            <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                leadingIcon={<ChevronLeft aria-hidden="true" className="size-4" />}
            >
                Anterior
            </Button>

            <p className="text-sm font-semibold text-fg-soft" aria-live="polite">
                Página {page} de {totalPages}
            </p>

            <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                trailingIcon={<ChevronRight aria-hidden="true" className="size-4" />}
            >
                Siguiente
            </Button>
        </nav>
    )
}
