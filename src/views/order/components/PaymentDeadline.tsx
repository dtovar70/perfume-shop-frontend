import { Clock } from 'lucide-react'

import { cn } from '@/utils/cn'
import { formatRemaining, useCountdown } from '@/utils/hooks/useCountdown'
import { formatDateTime } from '@/utils/formatDate'

const URGENT_MS = 60 * 60_000

/** "Tienes 23 h 12 min para pagar (hasta el 25/09/2026, 11:05 a. m.)". */
export function PaymentDeadline({ dueAt }: { dueAt: string }) {
    const remaining = useCountdown(dueAt)
    const urgent = remaining < URGENT_MS

    return (
        <p
            className={cn(
                'flex items-start gap-2 rounded-2xl px-4 py-3 text-sm',
                urgent ? 'bg-rose-50 text-rose-800' : 'bg-gold-100/50 text-ink',
            )}
        >
            <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {remaining > 0 ? (
                <span>
                    Tienes <strong className="font-semibold">{formatRemaining(remaining)}</strong>{' '}
                    para pagar (hasta el {formatDateTime(dueAt)}).
                </span>
            ) : (
                <span>El plazo para pagar venció el {formatDateTime(dueAt)}.</span>
            )}
        </p>
    )
}
