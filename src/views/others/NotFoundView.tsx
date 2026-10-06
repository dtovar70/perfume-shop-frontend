import { PerfumeArt } from '@/components/shared/PerfumeArt'
import { ButtonLink } from '@/components/ui'
import { CONTAINER } from '@/constants/layout.constant'
import { ROUTES } from '@/constants/route.constant'
import { cn } from '@/utils/cn'

export function NotFoundView() {
    return (
        <section className={cn(CONTAINER, 'relative isolate py-16 lg:py-24')}>
            <div
                aria-hidden="true"
                className="absolute top-10 left-1/2 -z-10 size-80 -translate-x-1/2 rounded-full bg-rose-100 opacity-80 blur-3xl"
            />

            <div className="mx-auto flex max-w-xl flex-col items-center gap-7 text-center">
                <PerfumeArt notes={false} className="w-44 sm:w-52" />

                <p className="text-[11px] font-bold tracking-[0.3em] text-gold-700 uppercase sm:text-xs">
                    Error 404
                </p>

                <h1 className="-mt-3 font-display text-5xl leading-none font-semibold text-balance text-ink sm:text-6xl">
                    Esta fragancia se <span className="text-rose-700 italic">evaporó</span>
                </h1>

                <p className="text-lg text-ink-soft">
                    La página que buscas no existe o cambió de lugar. Nuestro catálogo sigue aquí.
                </p>

                <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
                    <ButtonLink to={ROUTES.home} size="lg">
                        Volver al inicio
                    </ButtonLink>
                    <ButtonLink to={ROUTES.catalog} size="lg" variant="secondary">
                        Ver perfumes
                    </ButtonLink>
                </div>
            </div>
        </section>
    )
}
