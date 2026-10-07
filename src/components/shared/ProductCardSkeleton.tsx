import { Skeleton } from '@/components/ui'

export interface ProductCardSkeletonProps {
    variant?: 'grid' | 'list'
}

export function ProductCardSkeleton({ variant = 'grid' }: ProductCardSkeletonProps) {
    if (variant === 'list') {
        return (
            <div className="flex gap-3 rounded-xl2 border border-line bg-surface p-2.5 sm:gap-5 sm:p-3.5">
                <Skeleton
                    shape="block"
                    className="aspect-[4/5] h-auto w-24 shrink-0 rounded-xl sm:w-32"
                />
                <div className="flex flex-1 flex-col gap-2 py-1">
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="mt-auto h-5 w-20" />
                </div>
            </div>
        )
    }

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
