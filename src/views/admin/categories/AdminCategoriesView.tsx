import { useState } from 'react'
import { Plus, Tags } from 'lucide-react'

import type { AdminCategory } from '@/@types/admin'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { Alert, Button, Skeleton } from '@/components/ui'
import { NOTICE_DISMISS_MS } from '@/constants/ui.constant'
import { getErrorMessage } from '@/services/errors'
import { AdminPageHeader } from '@/views/admin/components/AdminPageHeader'
import { CategoryForm } from '@/views/admin/categories/components/CategoryForm'
import { CategoryList } from '@/views/admin/categories/components/CategoryList'
import { useAdminCategories, useDeleteCategory } from '@/views/admin/hooks/useAdminCategories'
import { useSession } from '@/views/admin/hooks/useSession'

const SKELETON_CARDS = 3

export function AdminCategoriesView() {
    const categories = useAdminCategories()
    const { data: session } = useSession()
    const canDelete = session?.role === 'ADMIN'
    const deleteCategory = useDeleteCategory()
    const [isCreating, setIsCreating] = useState(false)
    const [pendingDelete, setPendingDelete] = useState<AdminCategory | null>(null)
    const [notice, setNotice] = useState<string | null>(null)

    const openCreate = () => {
        setNotice(null)
        setIsCreating(true)
    }

    const openDelete = canDelete
        ? (category: AdminCategory) => {
              deleteCategory.reset()
              setNotice(null)
              setPendingDelete(category)
          }
        : undefined

    const confirmDelete = () => {
        if (!pendingDelete) return
        const { name } = pendingDelete
        deleteCategory.mutate(pendingDelete.slug, {
            onSuccess: () => {
                setPendingDelete(null)
                setNotice(`Eliminamos la categoría «${name}».`)
            },
        })
    }

    return (
        <>
            <AdminPageHeader
                title="Categorías"
                description="Nombre, frase, color y orden de cada categoría, tal como se ven en la tienda."
                actions={
                    isCreating ? null : (
                        <Button
                            onClick={openCreate}
                            leadingIcon={<Plus aria-hidden="true" className="size-4" />}
                        >
                            Nueva categoría
                        </Button>
                    )
                }
            />

            <div className="space-y-6">
                {notice ? (
                    <Alert
                        key={notice}
                        tone="success"
                        autoDismissMs={NOTICE_DISMISS_MS}
                        onDismiss={() => setNotice(null)}
                    >
                        {notice}
                    </Alert>
                ) : null}

                {isCreating ? (
                    <CategoryForm
                        mode="create"
                        onCancel={() => setIsCreating(false)}
                        onCreated={(category) => {
                            setIsCreating(false)
                            setNotice(
                                `Creamos la categoría «${category.name}». Ya aparece en la tienda.`,
                            )
                        }}
                    />
                ) : null}

                {categories.isPending ? (
                    Array.from({ length: SKELETON_CARDS }, (_, index) => (
                        <Skeleton key={index} shape="block" className="h-20" />
                    ))
                ) : categories.isError ? (
                    <EmptyState
                        title="No pudimos cargar las categorías"
                        description={getErrorMessage(categories.error)}
                        icon={<Tags className="size-6" />}
                        action={
                            <Button variant="secondary" onClick={() => void categories.refetch()}>
                                Reintentar
                            </Button>
                        }
                    />
                ) : categories.data.length === 0 && !isCreating ? (
                    <EmptyState
                        title="Todavía no hay categorías"
                        description="Crea la primera para empezar a ordenar el catálogo."
                        icon={<Tags className="size-6" />}
                    />
                ) : (
                    <CategoryList categories={categories.data} onDelete={openDelete} />
                )}
            </div>

            <ConfirmDialog
                isOpen={pendingDelete !== null}
                title="¿Eliminar esta categoría?"
                description={
                    pendingDelete ? (
                        <>
                            <strong className="font-semibold text-fg">{pendingDelete.name}</strong>{' '}
                            dejará de aparecer en el menú y en el catálogo, y su enlace (/catalogo/
                            {pendingDelete.slug}) dejará de funcionar. No se puede deshacer.
                        </>
                    ) : undefined
                }
                confirmLabel="Eliminar categoría"
                isLoading={deleteCategory.isPending}
                error={deleteCategory.isError ? getErrorMessage(deleteCategory.error) : undefined}
                onConfirm={confirmDelete}
                onClose={() => setPendingDelete(null)}
            />
        </>
    )
}
