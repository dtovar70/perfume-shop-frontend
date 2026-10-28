import type { QueryClient, QueryKey } from '@tanstack/react-query'

import type { LiveChange } from '@/@types/live-events'
import { queryKeys } from '@/constants/query-keys.constant'

/** Every live change, for the full resync after a reconnect. */
export const LIVE_CHANGES: readonly LiveChange[] = [
    'catalog',
    'catalogs',
    'content',
    'exchange-rate',
]

/**
 * The storefront queries each change makes stale, by prefix: `products.all` covers lists,
 * details, featured, related, facets and the cart's live stock.
 */
const STORE_KEYS: Record<LiveChange, readonly QueryKey[]> = {
    catalog: [queryKeys.products.all, queryKeys.categories.all, queryKeys.brands.all],
    catalogs: [queryKeys.catalogs.all],
    content: [queryKeys.content],
    'exchange-rate': [queryKeys.exchangeRate],
}

export function invalidateKeys(queryClient: QueryClient, keys: readonly QueryKey[]): void {
    for (const queryKey of keys) void queryClient.invalidateQueries({ queryKey })
}

/** Refetches (in the background, only what is on screen) the storefront data `change` touched. */
export function invalidateStoreData(queryClient: QueryClient, change: LiveChange): void {
    invalidateKeys(queryClient, STORE_KEYS[change])
}
