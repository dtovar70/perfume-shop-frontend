import { useState } from 'react'

import type { AdminCategory } from '@/@types/admin'
import { Alert } from '@/components/ui'
import { appConfig } from '@/configs/app.config'
import { getErrorMessage } from '@/services/errors'
import { moveItem } from '@/utils/moveItem'
import { CategoryRow } from '@/views/admin/categories/components/CategoryRow'
import { useReorderCategories } from '@/views/admin/hooks/useAdminCategories'

const MENU_LIMIT = appConfig.categoryLinkLimits.home

export interface CategoryListProps {
    categories: AdminCategory[]
    /** Omitted for roles that cannot delete, which hides the buttons entirely. */
    onDelete?: (category: AdminCategory) => void
}

/**
 * Categories in menu order. Rows are reordered by dragging their handle or with the up/down
 * buttons (keyboard and touch); every change saves the full order right away.
 */
export function CategoryList({ categories, onDelete }: CategoryListProps) {
    const reorder = useReorderCategories()
    const [draggedSlug, setDraggedSlug] = useState<string | null>(null)
    const [overSlug, setOverSlug] = useState<string | null>(null)
    const [announcement, setAnnouncement] = useState('')

    const persistOrder = (from: number, to: number) => {
        const moved = categories[from]
        if (!moved || from === to) return
        const next = moveItem(categories, from, to)
        setAnnouncement(`«${moved.name}» pasó a la posición ${to + 1} de ${next.length}.`)
        reorder.mutate(next.map((category) => category.slug))
    }

    const move = (index: number, offset: -1 | 1) => {
        const target = index + offset
        if (target < 0 || target >= categories.length) return
        persistOrder(index, target)
    }

    const endDrag = () => {
        setDraggedSlug(null)
        setOverSlug(null)
    }

    const handleDrop = (targetSlug: string) => {
        const from = categories.findIndex((category) => category.slug === draggedSlug)
        const to = categories.findIndex((category) => category.slug === targetSlug)
        endDrag()
        if (from < 0 || to < 0) return
        persistOrder(from, to)
    }

    return (
        <div className="space-y-3">
            <p className="text-sm text-ink-soft">
                Arrastra las categorías o usa las flechas para cambiar el orden. Las primeras{' '}
                {MENU_LIMIT} se destacan en la página de inicio; todas aparecen en el menú «Perfumes».
            </p>

            {reorder.isError ? (
                <Alert>No pudimos guardar el nuevo orden. {getErrorMessage(reorder.error)}</Alert>
            ) : null}

            <p className="sr-only" aria-live="polite">
                {announcement}
            </p>

            <ol className="space-y-3" aria-label="Orden de las categorías">
                {categories.map((category, index) => (
                    <CategoryRow
                        key={category.slug}
                        category={category}
                        index={index}
                        total={categories.length}
                        menuLimit={MENU_LIMIT}
                        isBusy={reorder.isPending}
                        isDragActive={draggedSlug !== null}
                        isDragged={draggedSlug === category.slug}
                        isDropTarget={
                            draggedSlug !== null &&
                            overSlug === category.slug &&
                            overSlug !== draggedSlug
                        }
                        onMove={move}
                        onDragStart={(slug) => {
                            reorder.reset()
                            setDraggedSlug(slug)
                        }}
                        onDragEnd={endDrag}
                        onDragOverRow={setOverSlug}
                        onDropOnRow={handleDrop}
                        onDelete={onDelete}
                    />
                ))}
            </ol>
        </div>
    )
}
