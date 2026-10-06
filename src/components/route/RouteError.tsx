import { isRouteErrorResponse, useRouteError } from 'react-router'

import { ButtonLink } from '@/components/ui/ButtonLink'
import { ROUTES } from '@/constants/route.constant'

interface ErrorCopy {
    title: string
    detail: string
}

function resolveErrorCopy(error: unknown): ErrorCopy {
    if (isRouteErrorResponse(error)) {
        return {
            title: error.status === 404 ? 'No encontramos esta página' : 'Algo salió mal',
            detail:
                error.status === 404
                    ? 'Puede que el enlace esté viejo o que el producto ya no esté disponible.'
                    : error.statusText || 'La página no pudo cargarse por completo.',
        }
    }

    if (error instanceof Error) {
        return { title: 'Algo salió mal', detail: error.message }
    }

    return {
        title: 'Algo salió mal',
        detail: 'Ocurrió un error inesperado. Intenta de nuevo en un momento.',
    }
}

export function RouteError() {
    const error = useRouteError()
    const { title, detail } = resolveErrorCopy(error)

    return (
        <main className="mx-auto flex min-h-[70vh] w-full max-w-xl flex-col items-center justify-center gap-6 px-4 text-center">
            <span aria-hidden="true" className="text-6xl">
                🫖
            </span>

            <div className="space-y-3">
                <h1 className="font-display text-3xl sm:text-4xl">{title}</h1>
                <p className="text-fg-soft">{detail}</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
                <ButtonLink to={ROUTES.home}>Volver al inicio</ButtonLink>
                <ButtonLink to={ROUTES.catalog} variant="secondary">
                    Ver el catálogo
                </ButtonLink>
            </div>
        </main>
    )
}
