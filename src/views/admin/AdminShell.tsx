import { AdminLayout } from '@/components/layouts/AdminLayout'
import { AdminLiveUpdates } from '@/views/admin/components/AdminLiveUpdates'
import { RequireAdmin } from '@/views/admin/components/RequireAdmin'
import { SessionTimeoutManager } from '@/views/admin/session/SessionTimeoutManager'

/**
 * Guarded back-office shell: session check first, then the inactivity timeout, the live
 * updates stream and the chrome.
 */
export function AdminShell() {
    return (
        <RequireAdmin>
            <SessionTimeoutManager />
            <AdminLiveUpdates />
            <AdminLayout />
        </RequireAdmin>
    )
}
