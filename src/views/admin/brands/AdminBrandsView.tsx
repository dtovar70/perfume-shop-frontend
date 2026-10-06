import { useState } from 'react'
import { Gem, Pencil, Plus, Trash2 } from 'lucide-react'

import type { AdminBrand } from '@/@types/admin'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { Alert, Badge, Button, Card, Skeleton } from '@/components/ui'
import { NOTICE_DISMISS_MS } from '@/constants/ui.constant'
import { getErrorMessage } from '@/services/errors'
import { BrandFormDialog } from '@/views/admin/brands/components/BrandFormDialog'
import { AdminPageHeader } from '@/views/admin/components/AdminPageHeader'
import {
    useAdminBrands,
    useCreateBrand,
    useDeleteBrand,
    useUpdateBrand,
} from '@/views/admin/hooks/useAdminBrands'
import { useSession } from '@/views/admin/hooks/useSession'

const iconButtonClass =
    'flex size-11 items-center justify-center rounded-full text-fg-soft transition hover:bg-elevated hover:text-accent disabled:pointer-events-none disabled:opacity-40'

/** `/admin/marcas`: the perfume houses, with logo, order and visibility. */
export function AdminBrandsView() {
    const brands = useAdminBrands()
    const createBrand = useCreateBrand()
    const updateBrand = useUpdateBrand()
    const deleteBrand = useDeleteBrand()
    const { data: session } = useSession()
    const canDelete = session?.role === 'ADMIN'

    const [editing, setEditing] = useState<AdminBrand | null>(null)
    const [isFormOpen, setIsFormOpen] = useState(false)
    /** Bumped on every opening so the form remounts with fresh values. */
    const [formKey, setFormKey] = useState(0)
    const [pendingDelete, setPendingDelete] = useState<AdminBrand | null>(null)
    const [notice, setNotice] = useState<string | null>(null)

    const openForm = (brand: AdminBrand | null) => {
        setNotice(null)
        setEditing(brand)
        setFormKey((key) => key + 1)
        setIsFormOpen(true)
    }

    return (
        <>
            <AdminPageHeader
                title="Marcas"
                description="Las casas de perfumería del catálogo: su logo, orden y si se muestran en la tienda."
                actions={
                    <Button
                        onClick={() => openForm(null)}
                        leadingIcon={<Plus aria-hidden="true" className="size-4" />}
                    >
                        Nueva marca
                    </Button>
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

                {brands.isPending ? (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: 6 }, (_, index) => (
                            <Skeleton key={index} shape="block" className="h-28" />
                        ))}
                    </div>
                ) : brands.isError ? (
                    <EmptyState
                        title="No pudimos cargar las marcas"
                        description={getErrorMessage(brands.error)}
                        icon={<Gem className="size-6" />}
                        action={
                            <Button variant="secondary" onClick={() => void brands.refetch()}>
                                Reintentar
                            </Button>
                        }
                    />
                ) : brands.data.length === 0 ? (
                    <EmptyState
                        title="Todavía no hay marcas"
                        description="Crea la primera y asígnala a tus perfumes."
                        icon={<Gem className="size-6" />}
                        action={<Button onClick={() => openForm(null)}>Crear marca</Button>}
                    />
                ) : (
                    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {brands.data.map((brand) => (
                            <li key={brand.slug}>
                                <Card padding="sm" className="flex h-full items-center gap-4">
                                    <div className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-surface p-2">
                                        {brand.logoUrl ? (
                                            <img
                                                src={brand.logoUrl}
                                                alt=""
                                                loading="lazy"
                                                className="max-h-full max-w-full object-contain"
                                            />
                                        ) : (
                                            <span className="font-display text-2xl font-semibold text-accent">
                                                {brand.name.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-display text-xl font-semibold text-fg">
                                            {brand.name}
                                        </p>
                                        <p className="truncate text-xs text-fg-soft">
                                            /{brand.slug} · {brand.totalProductCount}{' '}
                                            {brand.totalProductCount === 1
                                                ? 'producto'
                                                : 'productos'}
                                        </p>
                                        {brand.isActive ? null : (
                                            <Badge tone="neutral" size="sm" className="mt-1">
                                                Oculta
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => openForm(brand)}
                                            aria-label={`Editar ${brand.name}`}
                                            className={iconButtonClass}
                                        >
                                            <Pencil aria-hidden="true" className="size-4" />
                                        </button>
                                        {canDelete ? (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    deleteBrand.reset()
                                                    setPendingDelete(brand)
                                                }}
                                                aria-label={`Eliminar ${brand.name}`}
                                                className={iconButtonClass}
                                            >
                                                <Trash2 aria-hidden="true" className="size-4" />
                                            </button>
                                        ) : null}
                                    </div>
                                </Card>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <BrandFormDialog
                key={formKey}
                isOpen={isFormOpen}
                brand={editing}
                onClose={() => setIsFormOpen(false)}
                onSubmit={async (input) => {
                    if (editing) {
                        await updateBrand.mutateAsync({ slug: editing.slug, input })
                        setNotice(`Guardamos los cambios de «${input.name}».`)
                    } else {
                        await createBrand.mutateAsync(input)
                        setNotice(`Creamos la marca «${input.name}».`)
                    }
                }}
            />

            <ConfirmDialog
                isOpen={pendingDelete !== null}
                title="¿Eliminar esta marca?"
                description={
                    pendingDelete ? (
                        <>
                            <strong className="font-semibold text-fg">{pendingDelete.name}</strong>{' '}
                            dejará de aparecer en la tienda. Solo se puede eliminar si no tiene
                            productos. No se puede deshacer.
                        </>
                    ) : undefined
                }
                confirmLabel="Eliminar marca"
                isLoading={deleteBrand.isPending}
                error={deleteBrand.isError ? getErrorMessage(deleteBrand.error) : undefined}
                onConfirm={() => {
                    if (!pendingDelete) return
                    const { name, slug } = pendingDelete
                    deleteBrand.mutate(slug, {
                        onSuccess: () => {
                            setPendingDelete(null)
                            setNotice(`Eliminamos la marca «${name}».`)
                        },
                    })
                }}
                onClose={() => setPendingDelete(null)}
            />
        </>
    )
}
