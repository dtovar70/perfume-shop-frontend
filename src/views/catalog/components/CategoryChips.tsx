import { useEffect, useRef } from 'react'
import { cva } from 'class-variance-authority'

import type { Category, CategorySlug } from '@/@types/product'
import { cn } from '@/utils/cn'

const chipVariants = cva(
    'inline-flex h-10 shrink-0 snap-start items-center rounded-full border px-4 text-sm whitespace-nowrap transition duration-200 pointer-coarse:h-11',
    {
        variants: {
            isSelected: {
                true: 'border-transparent bg-rose-700 font-bold text-white shadow-soft',
                false: 'border-line bg-white font-semibold text-ink-soft hover:border-gold-400 hover:text-ink',
            },
        },
        defaultVariants: { isSelected: false },
    },
)

export interface CategoryChipsProps {
    categories: Category[] | undefined
    selected?: CategorySlug
    onSelect: (category?: CategorySlug) => void
    className?: string
}

/**
 * The category row of the catalog toolbar: "Ver todos" first, then each category. Phones swipe
 * it with mandatory snapping and no scrollbar; pointer devices get a thin styled scrollbar.
 * The selected chip is scrolled into view.
 */
export function CategoryChips({ categories, selected, onSelect, className }: CategoryChipsProps) {
    const listRef = useRef<HTMLUListElement>(null)

    useEffect(() => {
        const list = listRef.current
        const chip = list?.querySelector<HTMLElement>('[aria-pressed="true"]')
        if (!list || !chip) return
        const left = chip.offsetLeft - list.clientWidth / 2 + chip.clientWidth / 2
        list.scrollTo({ left: Math.max(0, left), behavior: 'smooth' })
    }, [selected, categories])

    const chips: { slug?: CategorySlug; label: string }[] = [
        { slug: undefined, label: 'Ver todos' },
        ...(categories ?? []).map((category) => ({ slug: category.slug, label: category.name })),
    ]

    return (
        <ul
            ref={listRef}
            aria-label="Categorías"
            className={cn(
                'flex snap-x snap-mandatory scrollbar-none gap-2 overflow-x-auto overscroll-x-contain py-1 pointer-fine:scrollbar-thin-soft pointer-fine:snap-proximity',
                className,
            )}
        >
            {chips.map((chip) => {
                const isSelected = chip.slug === selected
                return (
                    <li key={chip.slug ?? 'all'} className="snap-start">
                        <button
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => onSelect(chip.slug)}
                            className={chipVariants({ isSelected })}
                        >
                            {chip.label}
                        </button>
                    </li>
                )
            })}
        </ul>
    )
}
