import { Skeleton } from '@/components/ui'

export function ProductCardSkeleton() {
    return (
        <div className="flex h-full flex-col overflow-hidden rounded-xl2 border border-line bg-surface">
            <Skeleton shape="block" className="aspect-square h-auto w-full rounded-none" />
            <div className="flex flex-1 flex-col gap-2 p-3 sm:p-5">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="mt-2 h-5 w-20" />
            </div>
        </div>
    )
}
