import type { Paginated } from '@/@types/common'

/** Mirror of backend `OUTBOX_STATUSES` (src/outbox/entities/outbox-message.entity.ts). */
export const OUTBOX_STATUSES = ['pending', 'processing', 'sent', 'failed'] as const
export type OutboxStatus = (typeof OUTBOX_STATUSES)[number]

/** One notification as `GET /admin/outbox` returns it (`AdminOutboxMessageDto`). */
export interface AdminOutboxMessage {
    id: string
    /** Handler that delivers it: "email.order_received", "telegram.payment_submitted"… */
    type: string
    status: OutboxStatus
    /** Deliveries started so far. */
    attempts: number
    /** When a pending one is due (or, while processing, when its claim expires). ISO. */
    nextAttemptAt: string
    lastError: string | null
    createdAt: string
    sentAt: string | null
    /** The domain event it was recorded for; order events carry the order `code`. */
    payload: Record<string, unknown>
}

export type AdminOutboxList = Paginated<AdminOutboxMessage>

export interface AdminOutboxQueryParams {
    /** Omitted: every status. */
    status?: OutboxStatus
    page?: number
    pageSize?: number
}
