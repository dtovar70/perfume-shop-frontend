import type { AdminOutboxList, AdminOutboxMessage, AdminOutboxQueryParams } from '@/@types/outbox'
import { apiClient } from '@/services/ApiClient'

const BASE = '/admin/outbox'

/** ADMIN only: customer and staff notifications (emails, Telegram) and their delivery. */
export const AdminOutboxService = {
    getMessages: (params: AdminOutboxQueryParams = {}) =>
        apiClient.get<AdminOutboxList>(BASE, {
            query: { status: params.status, page: params.page, pageSize: params.pageSize },
        }),
    /** 404 when it no longer exists; 409 when it was already sent or is being sent. */
    retry: (id: string) =>
        apiClient.post<AdminOutboxMessage>(`${BASE}/${encodeURIComponent(id)}/retry`),
} as const
