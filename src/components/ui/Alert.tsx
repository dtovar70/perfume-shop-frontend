import type { CSSProperties, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { CircleAlert, CircleCheck, Info, X, type LucideIcon } from 'lucide-react'

import { cn } from '@/utils/cn'

const alertVariants = cva(
    'group relative flex items-start gap-3 overflow-hidden rounded-2xl border px-4 py-3 text-sm font-medium',
    {
        variants: {
            tone: {
                success: 'border-success/40 bg-success/10 text-fg',
                error: 'border-danger/40 bg-danger/10 text-fg',
                info: 'border-line bg-elevated text-fg',
            },
        },
        defaultVariants: {
            tone: 'error',
        },
    },
)

type AlertTone = NonNullable<VariantProps<typeof alertVariants>['tone']>

const TONE_DETAILS: Record<AlertTone, { icon: LucideIcon; iconClass: string; barClass: string }> = {
    success: { icon: CircleCheck, iconClass: 'text-success', barClass: 'bg-success' },
    error: { icon: CircleAlert, iconClass: 'text-danger', barClass: 'bg-danger' },
    info: { icon: Info, iconClass: 'text-accent', barClass: 'bg-cherry-500' },
}

export interface AlertProps extends VariantProps<typeof alertVariants> {
    children: ReactNode
    className?: string
    /** Shows a close button; with `autoDismissMs` it also fires when the countdown ends. */
    onDismiss?: () => void
    /** Countdown before `onDismiss` fires. Pauses while hovered or focused. */
    autoDismissMs?: number
}

/** Inline status message. Errors interrupt screen readers; other tones wait their turn. */
export function Alert({
    tone = 'error',
    children,
    className,
    onDismiss,
    autoDismissMs,
}: AlertProps) {
    const { icon: Icon, iconClass, barClass } = TONE_DETAILS[tone ?? 'error']
    const hasCountdown = onDismiss !== undefined && autoDismissMs !== undefined

    return (
        <div
            role={tone === 'error' ? 'alert' : 'status'}
            className={cn(alertVariants({ tone }), className)}
        >
            <Icon aria-hidden="true" className={cn('mt-0.5 size-4 shrink-0', iconClass)} />
            <div className="min-w-0 flex-1">{children}</div>

            {onDismiss ? (
                <button
                    type="button"
                    onClick={onDismiss}
                    aria-label="Cerrar mensaje"
                    className="-my-1 -mr-2 grid size-7 shrink-0 place-items-center rounded-full text-fg-soft transition hover:bg-surface/70 hover:text-fg focus-visible:outline-2 focus-visible:outline-accent"
                >
                    <X aria-hidden="true" className="size-4" />
                </button>
            ) : null}

            {hasCountdown ? (
                <span
                    aria-hidden="true"
                    data-countdown=""
                    onAnimationEnd={onDismiss}
                    style={
                        {
                            animationDuration: `${autoDismissMs}ms`,
                            '--countdown-duration': `${autoDismissMs}ms`,
                        } as CSSProperties
                    }
                    className={cn(
                        'absolute inset-x-0 bottom-0 h-1 origin-left animate-countdown',
                        'group-focus-within:[animation-play-state:paused] group-hover:[animation-play-state:paused]',
                        barClass,
                    )}
                />
            ) : null}
        </div>
    )
}
