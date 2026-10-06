import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'

import type { Category } from '@/@types/product'
import { BottleArt, type BottleShape } from '@/components/shared/BottleArt'
import { Badge } from '@/components/ui'
import { categoryPath } from '@/constants/route.constant'
import { cn } from '@/utils/cn'

/** Each card draws a different bottle by position, so a row of three never repeats. */
const SHAPES: readonly BottleShape[] = ['classic', 'round', 'tall']

export interface CategoryCardProps {
    category: Category
    /** Position in the list; picks the card's bottle. */
    index?: number
    className?: string
}

/**
 * The original store's category card: an illustration panel on top, then the name with an
 * arrow, the tagline in the accent, a short description and a count chip. The whole card is a
 * link through the name's stretched `::after`.
 */
export function CategoryCard({ category, index = 0, className }: CategoryCardProps) {
    const shape = SHAPES[index % SHAPES.length] ?? 'classic'

    return (
        <article
            className={cn(
                'group relative flex h-full flex-col overflow-hidden rounded-xl2 border border-line bg-elevated shadow-soft transition duration-300 hover:-translate-y-1 hover:border-cherry-500/30 hover:shadow-lift motion-reduce:transform-none',
                className,
            )}
        >
            <div
                aria-hidden="true"
                className="relative flex h-44 items-center justify-center overflow-hidden border-b border-line bg-surface glow-spot sm:h-52"
            >
                <BottleArt
                    shape={shape}
                    className="h-28 w-auto transition-transform duration-300 group-hover:-rotate-3 motion-reduce:transform-none sm:h-32"
                />
            </div>

            <div className="flex flex-1 flex-col gap-2.5 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-2xl font-semibold text-fg">
                        <Link
                            to={categoryPath(category.slug)}
                            className="rounded-sm after:absolute after:inset-0 after:content-['']"
                        >
                            {category.name}
                        </Link>
                    </h3>
                    <ArrowUpRight
                        aria-hidden="true"
                        className="mt-1 size-5 shrink-0 text-accent transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 motion-reduce:transform-none"
                    />
                </div>

                {category.tagline ? (
                    <p className="text-sm font-semibold text-accent">{category.tagline}</p>
                ) : null}
                {category.description ? (
                    <p className="line-clamp-3 text-sm text-fg-soft">{category.description}</p>
                ) : null}

                <Badge tone="neutral" size="sm" className="mt-auto self-start">
                    {category.productCount}{' '}
                    {category.productCount === 1 ? 'fragancia' : 'fragancias'}
                </Badge>
            </div>
        </article>
    )
}
