import { useEffect, useId, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { ImagePlus, X } from 'lucide-react'
import { Controller, useForm, useWatch } from 'react-hook-form'

import type { AdminBrand, BrandInput } from '@/@types/admin'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button, Input, Switch, Textarea } from '@/components/ui'
import { FIELD_LABEL_CLASS, FIELD_MESSAGE_ERROR_CLASS } from '@/components/ui/field.styles'
import { getErrorMessage } from '@/services/errors'
import { slugify } from '@/utils/slugify'
import {
    BRAND_DESCRIPTION_MAX_LENGTH,
    BRAND_LOGO_MAX_BYTES,
    BRAND_LOGO_TYPES,
    brandFormSchema,
    EMPTY_BRAND_FORM,
    toBrandFormValues,
    toBrandInput,
    type BrandFormValues,
} from '@/views/admin/brands/schema/brand.schema'
import { toOptionalNumber } from '@/views/admin/products/schema/product.schema'

export interface BrandFormDialogProps {
    isOpen: boolean
    /** `null` creates a new brand. */
    brand: AdminBrand | null
    onClose: () => void
    onSubmit: (input: BrandInput) => Promise<unknown>
}

/** Create / edit a brand: name, slug, description, order, visibility and logo (file or URL). */
export function BrandFormDialog({ isOpen, brand, onClose, onSubmit }: BrandFormDialogProps) {
    const mode = brand ? 'edit' : 'create'
    const formId = useId()
    const fileInputId = useId()
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [fileError, setFileError] = useState<string | null>(null)
    const [serverError, setServerError] = useState<string | null>(null)
    const [isSlugCustom, setIsSlugCustom] = useState(mode === 'edit')

    const {
        control,
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<BrandFormValues>({
        resolver: zodResolver(brandFormSchema),
        defaultValues: brand ? toBrandFormValues(brand) : EMPTY_BRAND_FORM,
    })
    const logoUrl = useWatch({ control, name: 'logoUrl' })

    // The parent remounts this dialog (new `key`) on every opening, so the form always starts
    // from the brand being edited, or blank.
    const previewUrl = useMemo(() => (logoFile ? URL.createObjectURL(logoFile) : null), [logoFile])
    useEffect(() => {
        if (!previewUrl) return
        return () => URL.revokeObjectURL(previewUrl)
    }, [previewUrl])
    const shownLogo = previewUrl ?? (logoUrl?.trim() || null)

    const submit = handleSubmit(async (values) => {
        setServerError(null)
        try {
            await onSubmit(toBrandInput(values, logoFile, mode))
            onClose()
        } catch (error) {
            setServerError(getErrorMessage(error, 'No pudimos guardar la marca.'))
        }
    })

    const nameField = register('name', {
        onChange: (event: { target: { value: string } }) => {
            if (!isSlugCustom) setValue('slug', slugify(event.target.value).slice(0, 80))
        },
    })

    return (
        <ConfirmDialog
            isOpen={isOpen}
            size="lg"
            title={mode === 'create' ? 'Nueva marca' : `Editar «${brand?.name ?? ''}»`}
            isLoading={isSubmitting}
            error={serverError ?? undefined}
            onClose={onClose}
            actions={
                <Button type="submit" form={formId} isLoading={isSubmitting}>
                    {mode === 'create' ? 'Crear marca' : 'Guardar cambios'}
                </Button>
            }
        >
            <form id={formId} onSubmit={submit} noValidate className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                    <Input label="Nombre" error={errors.name?.message} {...nameField} />
                    <Input
                        label="Slug (URL)"
                        hint="Se usa en /catalogo?brand=…"
                        autoCapitalize="none"
                        spellCheck={false}
                        error={errors.slug?.message}
                        {...register('slug', {
                            onChange: (event: { target: { value: string } }) =>
                                setIsSlugCustom(event.target.value !== ''),
                        })}
                    />
                </div>

                <Textarea
                    label="Descripción"
                    optional
                    rows={3}
                    maxLength={BRAND_DESCRIPTION_MAX_LENGTH}
                    error={errors.description?.message}
                    {...register('description')}
                />

                <div className="space-y-2">
                    <p className={FIELD_LABEL_CLASS}>Logo</p>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex h-20 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-white p-2">
                            {shownLogo ? (
                                <img
                                    src={shownLogo}
                                    alt="Vista previa del logo"
                                    className="max-h-full max-w-full object-contain"
                                />
                            ) : (
                                <span className="text-xs text-ink-soft">Sin logo</span>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <label
                                htmlFor={fileInputId}
                                className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-ink/80 px-4 text-sm font-semibold text-ink transition hover:bg-ink hover:text-ivory has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-gold-600"
                            >
                                <ImagePlus aria-hidden="true" className="size-4" />
                                Subir archivo
                                <input
                                    id={fileInputId}
                                    type="file"
                                    accept={BRAND_LOGO_TYPES.join(',')}
                                    className="sr-only"
                                    onChange={(event) => {
                                        const file = event.target.files?.[0] ?? null
                                        event.target.value = ''
                                        if (!file) return
                                        if (!BRAND_LOGO_TYPES.includes(file.type)) {
                                            setFileError('Usa una imagen PNG, JPG, WEBP o SVG.')
                                            return
                                        }
                                        if (file.size > BRAND_LOGO_MAX_BYTES) {
                                            setFileError('El logo debe pesar menos de 2 MB.')
                                            return
                                        }
                                        setFileError(null)
                                        setLogoFile(file)
                                    }}
                                />
                            </label>
                            {shownLogo ? (
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setLogoFile(null)
                                        setValue('logoUrl', '')
                                    }}
                                    leadingIcon={<X aria-hidden="true" className="size-4" />}
                                >
                                    Quitar logo
                                </Button>
                            ) : null}
                        </div>
                    </div>
                    {fileError ? (
                        <p role="alert" className={FIELD_MESSAGE_ERROR_CLASS}>
                            {fileError}
                        </p>
                    ) : null}
                    {logoFile ? (
                        <p className="text-xs text-ink-soft">Archivo elegido: {logoFile.name}</p>
                    ) : (
                        <Input
                            label="…o enlace del logo"
                            optional
                            placeholder="https://"
                            inputMode="url"
                            spellCheck={false}
                            error={errors.logoUrl?.message}
                            {...register('logoUrl')}
                        />
                    )}
                </div>

                <div className="grid items-end gap-5 sm:grid-cols-2">
                    <Input
                        label="Orden"
                        hint="Las de número menor aparecen primero."
                        type="number"
                        inputMode="numeric"
                        min={0}
                        step={1}
                        error={errors.sortOrder?.message}
                        {...register('sortOrder', { setValueAs: toOptionalNumber })}
                    />
                    <Controller
                        control={control}
                        name="isActive"
                        render={({ field }) => (
                            <div className="flex min-h-11 items-center justify-between gap-4 rounded-xl border border-line bg-ivory px-4 py-2">
                                <span className="text-sm font-semibold text-ink">
                                    Visible en la tienda
                                </span>
                                <Switch
                                    checked={field.value}
                                    onChange={field.onChange}
                                    label="Visible en la tienda"
                                />
                            </div>
                        )}
                    />
                </div>
            </form>
        </ConfirmDialog>
    )
}
