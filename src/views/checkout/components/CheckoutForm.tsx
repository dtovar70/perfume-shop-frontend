import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useEffect } from 'react'

import { MobilePhoneField } from '@/components/shared/MobilePhoneField'
import { Store, Truck } from 'lucide-react'

import { Alert, Button, Input, Textarea } from '@/components/ui'
import { FIELD_MESSAGE_ERROR_CLASS } from '@/components/ui/field.styles'
import { cn } from '@/utils/cn'
import { isApiError } from '@/services/errors'
import {
    CHECKOUT_FIELDS,
    CHECKOUT_NOTES_MAX_LENGTH,
    checkoutSchema,
    DELIVERY_METHOD_LABELS,
    DELIVERY_METHODS,
    type CheckoutValues,
    type DeliveryMethod,
} from '@/views/checkout/schema/checkout.schema'
import { withCapitalizedWords } from '@/utils/capitalizeWords'

const DELIVERY_ICONS: Record<DeliveryMethod, typeof Truck> = {
    delivery: Truck,
    pickup: Store,
}

const DELIVERY_HINTS: Record<DeliveryMethod, string> = {
    delivery: 'Te lo llevamos a la dirección que indiques.',
    pickup: 'Sin costo de envío; coordinamos contigo la entrega.',
}

export interface CheckoutFormProps {
    /** Rejects with the API error; field errors are pinned here, the rest is up to the page. */
    onConfirm: (values: CheckoutValues) => Promise<void>
    onDeliveryMethodChange?: (method: DeliveryMethod) => void
    /** Blocks sending (e.g. no BCV rate): the button stays disabled. */
    disabled?: boolean
    /** Message for errors that are not about a field (shown above the button). */
    formError?: string | null
}

export function CheckoutForm({
    onConfirm,
    onDeliveryMethodChange,
    disabled = false,
    formError,
}: CheckoutFormProps) {
    const {
        register,
        handleSubmit,
        control,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<CheckoutValues>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            fullName: '',
            email: '',
            phone: '',
            city: '',
            address: '',
            notes: '',
            deliveryMethod: 'delivery',
        },
    })

    const deliveryMethod = useWatch({ control, name: 'deliveryMethod' })
    useEffect(() => {
        onDeliveryMethodChange?.(deliveryMethod)
    }, [deliveryMethod, onDeliveryMethodChange])

    const submit = async (values: CheckoutValues) => {
        try {
            await onConfirm(values)
        } catch (error) {
            if (!isApiError(error, 400)) return
            for (const detail of error.details) {
                const field = CHECKOUT_FIELDS.find((name) => name === detail.field)
                const message = detail.errors[0]
                if (field && message) setError(field, { type: 'server', message })
            }
        }
    }

    return (
        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-6">
            <fieldset className="grid gap-5 sm:grid-cols-2" disabled={isSubmitting}>
                <legend className="mb-3 font-display text-2xl font-semibold text-ink">Tus datos</legend>

                <Input
                    label="Nombre y apellido"
                    autoComplete="name"
                    autoCapitalize="words"
                    error={errors.fullName?.message}
                    {...withCapitalizedWords(register('fullName'))}
                />
                <Input
                    label="Correo"
                    type="email"
                    autoComplete="email"
                    error={errors.email?.message}
                    {...register('email')}
                />
                <Controller
                    control={control}
                    name="phone"
                    render={({ field }) => (
                        <MobilePhoneField
                            label="Celular"
                            autoComplete="tel-national"
                            hint="Te avisamos por WhatsApp cómo va tu pedido."
                            error={errors.phone?.message}
                            {...field}
                        />
                    )}
                />
                <Input
                    label="Ciudad"
                    autoComplete="address-level2"
                    error={errors.city?.message}
                    {...register('city')}
                />

                <div className="sm:col-span-2">
                    <Input
                        label="Dirección"
                        autoComplete="street-address"
                        error={errors.address?.message}
                        {...register('address')}
                    />
                </div>

                <fieldset className="space-y-2 sm:col-span-2">
                    <legend className="mb-2 text-sm font-semibold text-ink">Método de entrega</legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {DELIVERY_METHODS.map((method) => {
                            const Icon = DELIVERY_ICONS[method]
                            const isSelected = deliveryMethod === method
                            return (
                                <label
                                    key={method}
                                    className={cn(
                                        'flex min-h-16 cursor-pointer items-center gap-3 rounded-xl border bg-white px-4 py-3 transition duration-200 has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-gold-600',
                                        isSelected
                                            ? 'border-rose-700 bg-rose-50/60 ring-1 ring-rose-700'
                                            : 'border-line hover:border-gold-400',
                                    )}
                                >
                                    <input
                                        type="radio"
                                        value={method}
                                        className="sr-only"
                                        {...register('deliveryMethod')}
                                    />
                                    <span
                                        aria-hidden="true"
                                        className={cn(
                                            'flex size-10 shrink-0 items-center justify-center rounded-full transition',
                                            isSelected
                                                ? 'bg-rose-700 text-white'
                                                : 'bg-rose-50 text-rose-700',
                                        )}
                                    >
                                        <Icon className="size-5" strokeWidth={1.75} />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-[15px] font-bold text-ink">
                                            {DELIVERY_METHOD_LABELS[method]}
                                        </span>
                                        <span className="block text-xs text-ink-soft">
                                            {DELIVERY_HINTS[method]}
                                        </span>
                                    </span>
                                    <span
                                        aria-hidden="true"
                                        className={cn(
                                            'flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition',
                                            isSelected ? 'border-rose-700' : 'border-ink/25',
                                        )}
                                    >
                                        {isSelected ? (
                                            <span className="size-2.5 rounded-full bg-rose-700" />
                                        ) : null}
                                    </span>
                                </label>
                            )
                        })}
                    </div>
                    {errors.deliveryMethod?.message ? (
                        <p role="alert" className={FIELD_MESSAGE_ERROR_CLASS}>
                            {errors.deliveryMethod.message}
                        </p>
                    ) : null}
                </fieldset>

                <div className="sm:col-span-2">
                    <Textarea
                        label="Notas del pedido"
                        optional
                        hint="Un punto de referencia, un horario de entrega o si es para regalo."
                        error={errors.notes?.message}
                        maxLength={CHECKOUT_NOTES_MAX_LENGTH}
                        {...register('notes')}
                    />
                </div>
            </fieldset>

            {formError ? <Alert>{formError}</Alert> : null}

            <div className="space-y-2">
                <Button
                    type="submit"
                    size="lg"
                    fullWidth
                    isLoading={isSubmitting}
                    disabled={disabled || isSubmitting}
                >
                    {isSubmitting ? 'Creando tu pedido…' : 'Confirmar pedido'}
                </Button>
                <p className="text-center text-xs text-ink-soft">
                    Después verás los datos de Pago Móvil y el monto exacto en bolívares.
                </p>
            </div>
        </form>
    )
}
