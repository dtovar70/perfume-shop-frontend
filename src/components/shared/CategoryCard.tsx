import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'

import type { Category } from '@/@types/product'
import { BottleArt, type BottleShape } from '@/components/shared/BottleArt'
import { ProductMedia } from '@/components/shared/ProductMedia'
import { Badge } from '@/components/ui'
import { categoryPath } from '@/constants/route.constant'
import { cldSrcSet, cldUrl } from '@/utils/cloudinary'
import { cn } from '@/utils/cn'

/** Each card draws a different bottle by position, so a row of three never repeats. */
const SHAPES: readonly BottleShape[] = ['classic', 'round', 'tall']

/**
 * The card's width: 78% / 45% of the screen in the phone row, a third of the container (at
 * most 1440px wide) from `md`. Cloudinary covers are resized to these candidates.
 */
const MEDIA_SIZES =
    '(min-width: 1440px) 27rem, (min-width: 768px) 31vw, (min-width: 640px) 45vw, 78vw'
const COVER_WIDTHS = [400, 640, 900, 1200] as const

/**
 * Gentle zoom of the media on hover or keyboard focus, only without reduced motion (Tailwind
 * v4's `scale-*` sets the `scale` property, which `motion-reduce:transform-none` cannot reset).
 */
const ZOOM =
    'transition-[scale] duration-500 ease-out motion-safe:group-hover:scale-[1.06] motion-safe:group-focus-within:scale-[1.06] motion-reduce:transition-none'

/** The same zoom applied to the picture inside the product plate, so the plate itself stays put. */
const PLATE_ZOOM =
    '[&_img]:transition-[scale] [&_img]:duration-500 [&_img]:ease-out motion-safe:group-hover:[&_img]:scale-[1.06] motion-safe:group-focus-within:[&_img]:scale-[1.06] motion-reduce:[&_img]:transition-none'

/**
 * Fades the cover's lower edge out through a mask on the image itself, so the fade scales with
 * the zoom and the card's own background shows through: no overlay edge left to misalign. The
 * fade starts per theme (`--theme-cover-fade-start`): long on black, short on light cards.
 */
const COVER_FADE =
    '[mask-image:linear-gradient(to_bottom,#000_var(--theme-cover-fade-start),transparent)]'

export interface CategoryCardProps {
    category: Category
    /** Position in the list; picks the card's bottle when there is no image. */
    index?: number
    className?: string
}

/**
 * The original store's category card: a media panel on top, then the name with an arrow, the
 * tagline in the accent, a short description and a count chip. The whole card is a link through
 * the name's stretched `::after`.
 *
 * The panel shows, in order of preference: the cover uploaded in the admin (cropped to fill),
 * the photo of the category's best product on the product plate, or a drawn bottle.
 */
export function CategoryCard({ category, index = 0, className }: CategoryCardProps) {
    return (
        <article
            className={cn(
                'group relative flex h-full flex-col overflow-hidden rounded-xl2 border border-line bg-elevated shadow-soft transition duration-300 hover:-translate-y-1 hover:border-cherry-500/30 hover:shadow-lift motion-reduce:transform-none',
                className,
            )}
        >
            <CategoryCardMedia category={category} index={index} />

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

/**
 * Fixed-height panel (no layout shift whatever the image). Decorative: the card's name is the
 * link, so the images carry an empty `alt`.
 */
function CategoryCardMedia({ category, index }: { category: Category; index: number }) {
    const frame = 'relative h-44 shrink-0 overflow-hidden sm:h-52'

    if (category.imageUrl) {
        const srcSet = cldSrcSet(category.imageUrl, COVER_WIDTHS)
        return (
            <div aria-hidden="true" className={frame}>
                <img
                    src={cldUrl(category.imageUrl, COVER_WIDTHS.at(-1) ?? 1200)}
                    srcSet={srcSet}
                    sizes={srcSet ? MEDIA_SIZES : undefined}
                    alt=""
                    width={1200}
                    height={624}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className={cn(
                        'size-full object-cover object-center select-none',
                        COVER_FADE,
                        ZOOM,
                    )}
                />
            </div>
        )
    }

    if (category.previewImageUrl) {
        return (
            <div aria-hidden="true" className={cn(frame, 'border-b border-line')}>
                <ProductMedia
                    image={{ url: category.previewImageUrl, alt: '' }}
                    sizes={MEDIA_SIZES}
                    className={cn('p-5 sm:p-6', PLATE_ZOOM)}
                />
            </div>
        )
    }

    const shape = SHAPES[index % SHAPES.length] ?? 'classic'
    return (
        <div
            aria-hidden="true"
            className={cn(
                frame,
                'flex items-center justify-center border-b border-line bg-surface glow-spot',
            )}
        >
            <BottleArt
                shape={shape}
                className="h-28 w-auto transition-transform duration-300 group-hover:-rotate-3 motion-reduce:transform-none sm:h-32"
            />
        </div>
    )
}
