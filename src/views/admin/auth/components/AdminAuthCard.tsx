import type { ReactNode } from 'react'

import { Card } from '@/components/ui'
import { Monogram } from '@/components/layouts/BrandLogo'

export interface AdminAuthCardProps {
    title: string
    subtitle?: ReactNode
    children: ReactNode
    /** Below the card, e.g. a help line. */
    footer?: ReactNode
}

/** The centered card of the admin's signed-out pages (login, password recovery). */
export function AdminAuthCard({ title, subtitle, children, footer }: AdminAuthCardProps) {
    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas px-4 py-12">
            <span
                aria-hidden="true"
                className="absolute top-1/4 -left-24 size-80 rounded-full bg-cherry-tint opacity-50 blur-3xl"
            />
            <span
                aria-hidden="true"
                className="absolute -right-24 bottom-1/4 size-80 rounded-full bg-cherry-500/20 opacity-50 blur-3xl"
            />

            <div className="relative w-full max-w-md space-y-4">
                <Card padding="lg" elevation="lift" className="space-y-6">
                    <div className="flex flex-col items-center gap-3 text-center">
                        <Monogram className="size-14 rounded-2xl" />
                        <div className="space-y-1">
                            <h1 className="font-display text-3xl text-fg">{title}</h1>
                            {subtitle ? <p className="text-sm text-fg-soft">{subtitle}</p> : null}
                        </div>
                    </div>
                    {children}
                </Card>
                {footer ? (
                    <div className="px-2 text-center text-sm text-fg-soft">{footer}</div>
                ) : null}
            </div>
        </main>
    )
}
