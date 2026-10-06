import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'

import type { Category } from '@/@types/product'
import { categoryPath } from '@/constants/route.constant'
import { cn } from '@/utils/cn'

/**
 * Categories have no photo, so each card gets one of three rich, hand-tuned scenes (rose, noir,
 * champagne) by position. Text sits on a dark scrim in every scene: ivory text >= 7:1.
 */
const SCENES = [
    {
        surface: 'bg-[radial-gradient(120%_90%_at_80%_10%,#dd8c9c_0%,#8f4254_45%,#4a2530_100%)]',
        bottle: 'text-rose-200/40',
    },
    {
        surface: 'bg-[radial-gradient(120%_90%_at_80%_10%,#6d5a61_0%,#2b1f24_50%,#1c1417_100%)]',
        bottle: 'text-gold-300/35',
    },
    {
        surface: 'bg-[radial-gradient(120%_90%_at_80%_10%,#eedcbc_0%,#c4954f_45%,#654a26_100%)]',
        bottle: 'text-white/35',
    },
] as const

export interface CategoryCardProps {
    category: Category
    /** Position in the list; picks the card's scene. */
    index?: number
    className?: string
}

/** Image-feature card: a deep scene, the name in display type and a "Comprar ahora" pill. */
export function CategoryCard({ category, index = 0, className }: CategoryCardProps) {
    const scene = SCENES[index % SCENES.length] ?? SCENES[0]

    return (
        <article
            className={cn(
                'group relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-card p-5 text-ivory shadow-soft sm:p-7',
                className,
            )}
        >
            <div
                aria-hidden="true"
                className={cn(
                    'absolute inset-0 -z-10 transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transform-none',
                    scene.surface,
                )}
            >
                {/* Oversized line bottle as the "photo". */}
                <svg
                    viewBox="0 0 80 112"
                    fill="none"
                    className={cn('absolute top-[8%] right-[-6%] h-[78%] w-auto', scene.bottle)}
                >
                    <rect x="28" y="6" width="24" height="18" rx="3" stroke="currentColor" strokeWidth="1" />
                    <rect x="33" y="24" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1" />
                    <rect x="8" y="33" width="64" height="73" rx="12" stroke="currentColor" strokeWidth="1" />
                    <rect x="22" y="50" width="36" height="16" rx="2" stroke="currentColor" strokeWidth=".75" />
                </svg>
                <span className="absolute inset-x-0 bottom-0 h-3/4 bg-linear-to-t from-noir/85 via-noir/40 to-transparent" />
            </div>

            <p className="text-[11px] font-bold tracking-[0.24em] text-gold-200 uppercase">
                {category.productCount} {category.productCount === 1 ? 'fragancia' : 'fragancias'}
            </p>
            <h3 className="mt-2 font-display text-[2rem] leading-none font-semibold sm:text-4xl">
                <Link
                    to={categoryPath(category.slug)}
                    className="rounded-sm after:absolute after:inset-0 after:content-['']"
                >
                    {category.name}
                </Link>
            </h3>
            {category.tagline ? (
                <p className="mt-2 line-clamp-2 max-w-xs text-sm text-ivory/80">
                    {category.tagline}
                </p>
            ) : null}

            <span
                aria-hidden="true"
                className="mt-5 inline-flex h-11 items-center gap-2 self-start rounded-full bg-ivory px-5 text-sm font-bold text-ink transition duration-300 group-hover:gap-3 group-hover:bg-gold-200"
            >
                Comprar ahora
                <ArrowRight className="size-4" />
            </span>
        </article>
    )
}
