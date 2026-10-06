import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'

import { isApiError } from '@/services/errors'

/** "email", "steps.1.title", "heroMedia.url": paths the forms use as-is. */
const FIELD_PATH = /^[A-Za-z]+(?:\.\d+\.[A-Za-z]+|\.[A-Za-z]+)?$/

/**
 * Pins the API's validation errors on their fields and returns the message for the form-level
 * alert. `knownFields` are the form's top-level fields; errors elsewhere go to the alert.
 */
export function applyContentErrors<F extends FieldValues>(
    error: unknown,
    setError: UseFormSetError<F>,
    knownFields: readonly string[],
): string {
    if (!isApiError(error)) return 'No pudimos guardar los cambios. Intenta de nuevo.'

    const unplaced: string[] = []
    for (const detail of error.details) {
        const message = detail.errors[0]
        if (!message) continue
        const topLevel = detail.field.split('.')[0] ?? ''
        if (FIELD_PATH.test(detail.field) && knownFields.includes(topLevel)) {
            setError(detail.field as Path<F>, { type: 'server', message })
        } else {
            unplaced.push(message)
        }
    }
    return unplaced.length ? `${error.message} ${unplaced.join(' ')}` : error.message
}
