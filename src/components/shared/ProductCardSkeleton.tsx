import { Skeleton } from '@/components/ui'

export function ProductCardSkeleton() {
    return (
        <div className="flex h-full flex-col">
            <Skeleton shape="block" className="aspect-[4/5] h-auto w-full rounded-card" />
            <div className="flex flex-1 flex-col gap-2 pt-4">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="mt-2 h-5 w-20" />
            </div>
        </div>
    )
}
