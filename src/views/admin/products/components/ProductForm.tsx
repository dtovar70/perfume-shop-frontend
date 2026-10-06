import { useId, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Save, Trash2 } from 'lucide-react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'

import type { AdminProduct, ProductInput } from '@/@types/admin'
import { CONCENTRATIONS, PRODUCT_GENDERS } from '@/@types/product'
import {
    Alert,
    Button,
    Card,
    Input,
    OptionalMark,
    Select,
    Switch,
    Textarea,
    type SelectOption,
} from '@/components/ui'
import { TagInput } from '@/components/ui/TagInput'
import { CONCENTRATION_LABELS, GENDER_LABELS } from '@/constants/product.constant'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/formatCurrency'
import { slugify } from '@/utils/slugify'
import { useAdminBrands } from '@/views/admin/hooks/useAdminBrands'
import { useAdminCategories } from '@/views/admin/hooks/useAdminCategories'
import {
    MAX_HIGHLIGHTS,
    MAX_NOTES_PER_TIER,
    MAX_VARIANTS,
    PRODUCT_DESCRIPTION_MAX_LENGTH,
    PRODUCT_TAG_LABELS,
    PRODUCT_TAGS,
    productFormSchema,
    toOptionalNumber,
    toProductInput,
    variantsStockTotal,
    type ProductFormValues,
} from '@/views/admin/products/schema/product.schema'
import { applyServerErrors } from '@/views/admin/products/utils/applyServerErrors'

const sectionTitleClass = 'font-display text-2xl font-semibold text-fg'

const iconButtonClass =
    'flex size-11 shrink-0 items-center justify-center rounded-full text-fg-soft transition hover:bg-cherry-tint hover:text-accent focus-visible:ring-2 focus-visible:ring-cherry-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40'

export interface ProductFormProps {
    mode: 'create' | 'edit'
    initialValues: Partial<ProductFormValues>
    onSubmit: (input: ProductInput) => Promise<AdminProduct>
}

export function ProductForm({ mode, initialValues, onSubmit }: ProductFormProps) {
    const { data: categories } = useAdminCategories()
    const { data: brands } = useAdminBrands()
    const [serverError, setServerError] = useState<string | null>(null)
    /** Once the slug is typed by hand, the name stops rewriting it. */
    const [isSlugCustom, setIsSlugCustom] = useState(mode === 'edit')

    const {
        control,
        register,
        handleSubmit,
        setError,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues: initialValues,
    })

    const highlights = useFieldArray({ control, name: 'highlights' })
    const isHighlightsFull = highlights.fields.length >= MAX_HIGHLIGHTS
    const highlightsLimitId = useId()
    const variants = useFieldArray({ control, name: 'variants' })
    const [variantValues, basePrice] = useWatch({
        control,
        name: ['variants', 'price'],
    })

    /** What a variant ends up costing, shown under its price adjustment. */
    const finalPriceHint = (index: number): string | undefined => {
        const delta = Number(variantValues?.[index]?.priceDelta ?? 0)
        const base = Number(basePrice)
        if (!Number.isFinite(base) || !Number.isFinite(delta)) return undefined
        return `Precio final: ${formatCurrency(base + delta)}`
    }

    const categoryOptions: SelectOption[] = (categories ?? []).map((item) => ({
        value: item.slug,
        label: item.name,
    }))
    const brandOptions: SelectOption[] = [
        { value: '', label: 'Sin marca' },
        ...(brands ?? []).map((item) => ({
            value: item.slug,
            label: item.isActive ? item.name : `${item.name} (oculta)`,
        })),
    ]
    const concentrationOptions: SelectOption[] = [
        { value: '', label: 'Sin especificar' },
        ...CONCENTRATIONS.map((value) => ({
            value,
            label: `${CONCENTRATION_LABELS[value].long} (${CONCENTRATION_LABELS[value].short})`,
        })),
    ]

    const submit = handleSubmit(async (values) => {
        setServerError(null)

        // On success the page navigates away (create: to the edit page for photos; edit:
        // back to the list, which shows the notice), so there is nothing to reset here.
        try {
            await onSubmit(toProductInput(values, mode))
        } catch (error) {
            setServerError(applyServerErrors(error, setError))
        }
    })

    const nameField = register('name', {
        onChange: (event: { target: { value: string } }) => {
            if (!isSlugCustom) {
                setValue('slug', slugify(event.target.value).slice(0, 80), {
                    shouldValidate: Boolean(errors.slug),
                })
            }
        },
    })
    const slugField = register('slug', {
        onChange: (event: { target: { value: string } }) => {
            setIsSlugCustom(event.target.value !== '')
        },
    })

    return (
        <form
            onSubmit={submit}
            noValidate
            className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]"
        >
            <div className="min-w-0 space-y-6">
                <Card className="space-y-5">
                    <h2 className={sectionTitleClass}>Información básica</h2>
                    <Input label="Nombre" error={errors.name?.message} {...nameField} />
                    <Input
                        label="Slug (URL)"
                        hint={
                            mode === 'create'
                                ? 'Se genera a partir del nombre; puedes cambiarlo.'
                                : 'Cambiarlo rompe los enlaces que ya se hayan compartido.'
                        }
                        placeholder="good-girl-edp"
                        autoCapitalize="none"
                        spellCheck={false}
                        error={errors.slug?.message}
                        {...slugField}
                    />
                    {/*
                     * Remounted once the categories arrive: the hidden <select> can only show the
                     * saved value after its <option> exists.
                     */}
                    <Select
                        key={categories ? 'loaded' : 'loading'}
                        label="Categoría"
                        placeholder={categories ? 'Elige una categoría' : 'Cargando categorías…'}
                        disabled={!categories}
                        options={categoryOptions}
                        error={errors.categorySlug?.message}
                        {...register('categorySlug')}
                    />
                    <Textarea
                        label="Descripción"
                        optional
                        rows={5}
                        error={errors.description?.message}
                        maxLength={PRODUCT_DESCRIPTION_MAX_LENGTH}
                        {...register('description')}
                    />
                </Card>

                {/*
                 * Columns follow the card's width, not the viewport's (the sidebar and the aside
                 * eat most of it). Three only from 34rem, where every label, "(opcional)"
                 * included, fits on one line, so the inputs stay level.
                 */}
                <Card className="@container space-y-5">
                    <h2 className={sectionTitleClass}>Precio e inventario</h2>
                    <div className="grid grid-cols-1 items-start gap-5 @md:grid-cols-2 @min-[34rem]:grid-cols-3">
                        <Input
                            label="Precio (USD)"
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            min={0}
                            error={errors.price?.message}
                            {...register('price', { setValueAs: toOptionalNumber })}
                        />
                        <Input
                            label="Precio anterior"
                            optional
                            hint="Se ve tachado en la tienda."
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            min={0}
                            error={errors.compareAtPrice?.message}
                            {...register('compareAtPrice', { setValueAs: toOptionalNumber })}
                        />
                        {variants.fields.length > 0 ? (
                            // With variants the stock is theirs; this is only their sum.
                            <Input
                                label="Stock"
                                value={`Total: ${variantsStockTotal(variantValues)}`}
                                readOnly
                                tabIndex={-1}
                                hint="Suma de las variantes. Cámbialo en cada una."
                                className="bg-canvas tabular-nums"
                            />
                        ) : (
                            <Input
                                label="Stock"
                                type="number"
                                inputMode="numeric"
                                step="1"
                                min={0}
                                error={errors.stock?.message}
                                {...register('stock', { setValueAs: toOptionalNumber })}
                            />
                        )}
                    </div>
                </Card>

                <Card className="@container space-y-5">
                    <h2 className={sectionTitleClass}>Ficha del perfume</h2>
                    <div className="grid grid-cols-1 items-start gap-5 @md:grid-cols-2">
                        {/*
                         * Remounted once the brands arrive: the hidden <select> can only show the
                         * saved value after its <option> exists.
                         */}
                        <Select
                            key={brands ? 'brands-loaded' : 'brands-loading'}
                            label="Marca"
                            disabled={!brands}
                            options={brandOptions}
                            error={errors.brandSlug?.message}
                            {...register('brandSlug')}
                        />
                        <Select
                            label="Concentración"
                            options={concentrationOptions}
                            error={errors.concentration?.message}
                            {...register('concentration')}
                        />
                        <Input
                            label="Mililitros"
                            optional
                            hint="Tamaño del frasco base; cada variante puede tener el suyo."
                            type="number"
                            inputMode="numeric"
                            step="1"
                            min={1}
                            error={errors.volumeMl?.message}
                            {...register('volumeMl', { setValueAs: toOptionalNumber })}
                        />
                        <Input
                            label="SKU"
                            optional
                            autoCapitalize="characters"
                            spellCheck={false}
                            error={errors.sku?.message}
                            {...register('sku')}
                        />
                    </div>

                    <Controller
                        control={control}
                        name="gender"
                        render={({ field }) => (
                            <fieldset className="space-y-2">
                                <legend className="text-sm font-semibold text-fg">Para</legend>
                                <div
                                    role="radiogroup"
                                    className="inline-flex rounded-xl border border-line bg-canvas p-1"
                                >
                                    {PRODUCT_GENDERS.map((gender) => {
                                        const isOn = field.value === gender
                                        return (
                                            <button
                                                key={gender}
                                                type="button"
                                                role="radio"
                                                aria-checked={isOn}
                                                onClick={() => field.onChange(gender)}
                                                className={cn(
                                                    'h-10 rounded-lg px-4 text-sm font-semibold transition',
                                                    isOn
                                                        ? 'bg-surface text-accent-strong shadow-soft ring-1 ring-cherry-500/30'
                                                        : 'text-fg-soft hover:text-fg',
                                                )}
                                            >
                                                {GENDER_LABELS[gender]}
                                            </button>
                                        )
                                    })}
                                </div>
                                {errors.gender?.message ? (
                                    <p role="alert" className="text-sm font-medium text-accent">
                                        {errors.gender.message}
                                    </p>
                                ) : null}
                            </fieldset>
                        )}
                    />
                </Card>

                <Card className="space-y-5">
                    <div>
                        <h2 className={sectionTitleClass}>Pirámide olfativa</h2>
                        <p className="text-sm text-fg-soft">
                            Escribe cada nota y pulsa Enter o coma. Máximo {MAX_NOTES_PER_TIER} por
                            nivel.
                        </p>
                    </div>
                    <Input
                        label="Familia olfativa"
                        optional
                        placeholder="Floral oriental"
                        error={errors.olfactoryFamily?.message}
                        {...register('olfactoryFamily')}
                    />
                    <Controller
                        control={control}
                        name="notesTop"
                        render={({ field }) => (
                            <TagInput
                                label="Notas de salida"
                                optional
                                placeholder="Bergamota, Pimienta rosa…"
                                max={MAX_NOTES_PER_TIER}
                                value={field.value}
                                onChange={field.onChange}
                                error={errors.notesTop?.message}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="notesHeart"
                        render={({ field }) => (
                            <TagInput
                                label="Notas de corazón"
                                optional
                                placeholder="Rosa, Jazmín…"
                                max={MAX_NOTES_PER_TIER}
                                value={field.value}
                                onChange={field.onChange}
                                error={errors.notesHeart?.message}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="notesBase"
                        render={({ field }) => (
                            <TagInput
                                label="Notas de fondo"
                                optional
                                placeholder="Vainilla, Ámbar, Almizcle…"
                                max={MAX_NOTES_PER_TIER}
                                value={field.value}
                                onChange={field.onChange}
                                error={errors.notesBase?.message}
                            />
                        )}
                    />
                </Card>

                <Card className="space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className={sectionTitleClass}>Detalles destacados</h2>
                            <p
                                id={highlightsLimitId}
                                className={cn(
                                    'text-sm text-fg-soft tabular-nums',
                                    isHighlightsFull && 'font-semibold text-accent',
                                )}
                            >
                                {highlights.fields.length}/{MAX_HIGHLIGHTS} · Máximo{' '}
                                {MAX_HIGHLIGHTS} detalles
                            </p>
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            disabled={isHighlightsFull}
                            aria-describedby={highlightsLimitId}
                            onClick={() => highlights.append({ value: '' })}
                            leadingIcon={<Plus aria-hidden="true" className="size-4" />}
                        >
                            Agregar detalle
                        </Button>
                    </div>

                    {highlights.fields.length === 0 ? (
                        <p className="text-sm text-fg-soft">
                            Sin detalles. Aparecen como lista en la página del producto.
                        </p>
                    ) : (
                        <ul className="space-y-3">
                            {highlights.fields.map((field, index) => (
                                <li key={field.id} className="flex items-start gap-2">
                                    <Input
                                        label={`Detalle ${index + 1}`}
                                        hideLabel
                                        placeholder="Larga duración en la piel"
                                        error={errors.highlights?.[index]?.value?.message}
                                        {...register(`highlights.${index}.value`)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => highlights.remove(index)}
                                        aria-label={`Eliminar detalle ${index + 1}`}
                                        className={iconButtonClass}
                                    >
                                        <Trash2 aria-hidden="true" className="size-4" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                    {errors.highlights?.message ? (
                        <p role="alert" className="text-sm font-medium text-accent">
                            {errors.highlights.message}
                        </p>
                    ) : null}
                </Card>

                <Card className="space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className={sectionTitleClass}>Variantes</h2>
                            <p className="text-sm text-fg-soft">
                                Opcional: una por tamaño (ml). La primera con stock es la
                                predeterminada; las que están en 0 se ven como «Agotado». Sin
                                variantes se vende un solo tamaño con el stock del producto.
                            </p>
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            disabled={variants.fields.length >= MAX_VARIANTS}
                            onClick={() =>
                                variants.append({
                                    label: '',
                                    priceDelta: 0,
                                    volumeMl: undefined,
                                    stock: 0,
                                })
                            }
                            leadingIcon={<Plus aria-hidden="true" className="size-4" />}
                        >
                            Agregar variante
                        </Button>
                    </div>

                    {variants.fields.length === 0 ? (
                        <p className="text-sm text-fg-soft">
                            Sin variantes: se vende un solo tamaño con el stock y los mililitros del
                            producto.
                        </p>
                    ) : (
                        <ul className="space-y-4">
                            {variants.fields.map((field, index) => {
                                const rowErrors = errors.variants?.[index]
                                return (
                                    <li
                                        key={field.id}
                                        className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 rounded-2xl border border-line bg-canvas p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
                                    >
                                        <div className="sm:col-span-2">
                                            <Input
                                                label="Nombre"
                                                placeholder="100 ml"
                                                error={rowErrors?.label?.message}
                                                {...register(`variants.${index}.label`)}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => variants.remove(index)}
                                            aria-label={`Eliminar variante ${index + 1}`}
                                            className={cn(iconButtonClass, 'mt-6.5')}
                                        >
                                            <Trash2 aria-hidden="true" className="size-4" />
                                        </button>
                                        <div className="col-span-2 grid grid-cols-1 items-start gap-3 sm:grid-cols-3">
                                            <Input
                                                label="Ajuste de precio"
                                                hint={finalPriceHint(index)}
                                                type="number"
                                                inputMode="decimal"
                                                step="0.01"
                                                error={rowErrors?.priceDelta?.message}
                                                {...register(`variants.${index}.priceDelta`, {
                                                    setValueAs: toOptionalNumber,
                                                })}
                                            />
                                            <Input
                                                label="Stock"
                                                type="number"
                                                inputMode="numeric"
                                                step="1"
                                                min={0}
                                                error={rowErrors?.stock?.message}
                                                {...register(`variants.${index}.stock`, {
                                                    setValueAs: toOptionalNumber,
                                                })}
                                            />
                                            <Input
                                                label="Mililitros"
                                                optional
                                                type="number"
                                                inputMode="numeric"
                                                step="1"
                                                min={1}
                                                error={rowErrors?.volumeMl?.message}
                                                {...register(`variants.${index}.volumeMl`, {
                                                    setValueAs: toOptionalNumber,
                                                })}
                                            />
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </Card>
            </div>

            <aside className="min-w-0 space-y-6 xl:sticky xl:top-6 xl:self-start">
                <Card className="space-y-5">
                    <h2 className={sectionTitleClass}>Publicación</h2>
                    <Controller
                        control={control}
                        name="isActive"
                        render={({ field }) => (
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-fg">
                                        Visible en la tienda
                                    </p>
                                    <p className="text-xs text-fg-soft">
                                        {field.value
                                            ? 'Los clientes pueden verlo y comprarlo.'
                                            : 'Oculto: solo se ve en el panel.'}
                                    </p>
                                </div>
                                <Switch
                                    checked={field.value}
                                    onChange={field.onChange}
                                    label="Visible en la tienda"
                                />
                            </div>
                        )}
                    />

                    <Controller
                        control={control}
                        name="isFeatured"
                        render={({ field }) => (
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-fg">Destacado</p>
                                    <p className="text-xs text-fg-soft">
                                        Aparece en «Fragancias destacadas» del inicio.
                                    </p>
                                </div>
                                <Switch
                                    checked={field.value}
                                    onChange={field.onChange}
                                    label="Destacado en el inicio"
                                />
                            </div>
                        )}
                    />

                    <Controller
                        control={control}
                        name="tags"
                        render={({ field }) => (
                            <fieldset className="space-y-2">
                                <legend className="text-sm font-semibold text-fg">
                                    Etiquetas
                                    <OptionalMark />
                                </legend>
                                <div className="flex flex-wrap gap-2">
                                    {PRODUCT_TAGS.map((tag) => {
                                        const isOn = field.value.includes(tag)
                                        return (
                                            <button
                                                key={tag}
                                                type="button"
                                                aria-pressed={isOn}
                                                onClick={() =>
                                                    field.onChange(
                                                        isOn
                                                            ? field.value.filter(
                                                                  (item) => item !== tag,
                                                              )
                                                            : PRODUCT_TAGS.filter(
                                                                  (item) =>
                                                                      item === tag ||
                                                                      field.value.includes(item),
                                                              ),
                                                    )
                                                }
                                                className={cn(
                                                    'rounded-full border px-3.5 py-1.5 text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-cherry-500 focus-visible:ring-offset-2',
                                                    isOn
                                                        ? 'border-cherry-500 bg-cherry-500 text-on-cherry'
                                                        : 'border-line bg-surface text-fg-soft hover:border-cherry-500/50',
                                                )}
                                            >
                                                {PRODUCT_TAG_LABELS[tag]}
                                            </button>
                                        )
                                    })}
                                </div>
                            </fieldset>
                        )}
                    />
                </Card>

                <div className="space-y-3">
                    {serverError ? <Alert>{serverError}</Alert> : null}
                    <Button
                        type="submit"
                        fullWidth
                        isLoading={isSubmitting}
                        leadingIcon={<Save aria-hidden="true" className="size-4" />}
                    >
                        {mode === 'create' ? 'Crear producto' : 'Guardar cambios'}
                    </Button>
                </div>
            </aside>
        </form>
    )
}
