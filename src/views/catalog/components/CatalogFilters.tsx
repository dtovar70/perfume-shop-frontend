import type { ReactNode } from 'react'
import { cva } from 'class-variance-authority'
import { Check } from 'lucide-react'

import type { Concentration, ProductFacets, ProductGender, ProductTag } from '@/@types/product'
import { Button } from '@/components/ui'
import {
    CONCENTRATION_LABELS,
    GENDER_LABELS,
    PRODUCT_TAG_LABELS,
} from '@/constants/product.constant'
import { cn } from '@/utils/cn'
import {
    PRICE_BRACKETS,
    PRODUCT_TAGS,
    type CatalogFilters as CatalogFiltersState,
    type PriceBracketId,
} from '@/views/catalog/hooks/useCatalogFilters'

const chipVariants = cva(
    'inline-flex min-h-10 pointer-coarse:min-h-11 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-sm transition duration-200 has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-cherry-500',
    {
        variants: {
            isSelected: {
                true: 'border-cherry-500 bg-cherry-500 font-bold text-on-cherry',
                false: 'border-line bg-surface font-semibold text-fg-soft hover:border-cherry-500/50 hover:text-fg',
            },
        },
        defaultVariants: { isSelected: false },
    },
)

const legendClass = 'mb-3 text-[11px] font-bold tracking-[0.22em] text-accent uppercase'

function FilterGroup({ legend, children }: { legend: string; children: ReactNode }) {
    return (
        <fieldset className="border-t border-line pt-5 first:border-t-0 first:pt-0">
            <legend className={cn(legendClass, 'float-left w-full')}>{legend}</legend>
            <div className="clear-both">{children}</div>
        </fieldset>
    )
}

export interface CatalogFiltersProps {
    filters: CatalogFiltersState
    facets: ProductFacets | undefined
    isFiltered: boolean
    onBrandToggle: (slug: string) => void
    onGenderChange: (gender?: ProductGender) => void
    onConcentrationChange: (concentration?: Concentration) => void
    onFamilyChange: (family?: string) => void
    onPriceBracketChange: (bracket: PriceBracketId) => void
    onTagToggle: (tag: ProductTag) => void
    onClear: () => void
}

/** Brand, gender, concentration, family, price and tag filters (sidebar or drawer). */
export function CatalogFilters({
    filters,
    facets,
    isFiltered,
    onBrandToggle,
    onGenderChange,
    onConcentrationChange,
    onFamilyChange,
    onPriceBracketChange,
    onTagToggle,
    onClear,
}: CatalogFiltersProps) {
    const brands = facets?.brands ?? []
    // A selected brand stays listed even if the current scope has none of it.
    const missingBrands = filters.brands.filter((slug) => !brands.some((b) => b.slug === slug))
    const genders = facets?.genders.filter((facet) => facet.count > 0) ?? []
    const concentrations = facets?.concentrations.filter((facet) => facet.count > 0) ?? []
    const families = facets?.families.filter((facet) => facet.count > 0) ?? []

    return (
        <div className="space-y-5">
            {brands.length > 0 || missingBrands.length > 0 ? (
                <FilterGroup legend="Marca">
                    <ul className="scroll-soft -mx-1 max-h-64 space-y-0.5 overflow-y-auto px-1">
                        {[
                            ...brands,
                            ...missingBrands.map((slug) => ({ slug, name: slug, count: 0 })),
                        ].map((brand) => {
                            const checked = filters.brands.includes(brand.slug)
                            return (
                                <li key={brand.slug}>
                                    <label className="group flex min-h-10 cursor-pointer items-center gap-3 rounded-lg px-1 text-sm text-fg transition hover:bg-elevated/70 has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-cherry-500 pointer-coarse:min-h-11">
                                        <input
                                            type="checkbox"
                                            className="peer sr-only"
                                            checked={checked}
                                            onChange={() => onBrandToggle(brand.slug)}
                                        />
                                        <span
                                            aria-hidden="true"
                                            className={cn(
                                                'flex size-5 shrink-0 items-center justify-center rounded-md border transition',
                                                checked
                                                    ? 'border-cherry-500 bg-cherry-500 text-on-cherry'
                                                    : 'border-line-strong bg-surface group-hover:border-accent/60',
                                            )}
                                        >
                                            {checked ? (
                                                <Check className="size-3.5" strokeWidth={3} />
                                            ) : null}
                                        </span>
                                        <span
                                            className={cn(
                                                'flex-1 truncate',
                                                checked && 'font-bold',
                                            )}
                                        >
                                            {brand.name}
                                        </span>
                                        <span className="text-xs text-fg-soft tabular-nums">
                                            {brand.count}
                                        </span>
                                    </label>
                                </li>
                            )
                        })}
                    </ul>
                </FilterGroup>
            ) : null}

            {genders.length > 0 ? (
                <FilterGroup legend="Para">
                    <div className="flex flex-wrap gap-2">
                        <RadioChip
                            name="gender"
                            label="Todos"
                            checked={filters.gender === undefined}
                            onSelect={() => onGenderChange(undefined)}
                        />
                        {genders.map((facet) => (
                            <RadioChip
                                key={facet.value}
                                name="gender"
                                label={GENDER_LABELS[facet.value] ?? facet.value}
                                checked={filters.gender === facet.value}
                                onSelect={() => onGenderChange(facet.value)}
                            />
                        ))}
                    </div>
                </FilterGroup>
            ) : null}

            {concentrations.length > 0 ? (
                <FilterGroup legend="Concentración">
                    <div className="flex flex-wrap gap-2">
                        <RadioChip
                            name="concentration"
                            label="Todas"
                            checked={filters.concentration === undefined}
                            onSelect={() => onConcentrationChange(undefined)}
                        />
                        {concentrations.map((facet) => (
                            <RadioChip
                                key={facet.value}
                                name="concentration"
                                label={CONCENTRATION_LABELS[facet.value]?.long ?? facet.value}
                                checked={filters.concentration === facet.value}
                                onSelect={() => onConcentrationChange(facet.value)}
                            />
                        ))}
                    </div>
                </FilterGroup>
            ) : null}

            {families.length > 0 ? (
                <FilterGroup legend="Familia olfativa">
                    <div className="flex flex-wrap gap-2">
                        <RadioChip
                            name="family"
                            label="Todas"
                            checked={filters.family === undefined}
                            onSelect={() => onFamilyChange(undefined)}
                        />
                        {families.map((facet) => (
                            <RadioChip
                                key={facet.value}
                                name="family"
                                label={facet.value}
                                checked={filters.family === facet.value}
                                onSelect={() => onFamilyChange(facet.value)}
                            />
                        ))}
                    </div>
                </FilterGroup>
            ) : null}

            <FilterGroup legend="Precio">
                <div className="flex flex-wrap gap-2">
                    {PRICE_BRACKETS.map((bracket) => (
                        <RadioChip
                            key={bracket.id}
                            name="price"
                            label={bracket.label}
                            checked={filters.priceBracket === bracket.id}
                            onSelect={() => onPriceBracketChange(bracket.id)}
                        />
                    ))}
                </div>
            </FilterGroup>

            <FilterGroup legend="Destacados">
                <div className="flex flex-wrap gap-2">
                    {PRODUCT_TAGS.map((tag) => {
                        const checked = filters.tags.includes(tag)
                        return (
                            <label key={tag} className={chipVariants({ isSelected: checked })}>
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={checked}
                                    onChange={() => onTagToggle(tag)}
                                />
                                <span className="first-letter:uppercase">
                                    {PRODUCT_TAG_LABELS[tag]}
                                </span>
                            </label>
                        )
                    })}
                </div>
            </FilterGroup>

            {isFiltered ? (
                <Button variant="secondary" size="sm" fullWidth onClick={onClear}>
                    Limpiar filtros
                </Button>
            ) : null}
        </div>
    )
}

interface RadioChipProps {
    name: string
    label: string
    checked: boolean
    onSelect: () => void
}

function RadioChip({ name, label, checked, onSelect }: RadioChipProps) {
    return (
        <label className={chipVariants({ isSelected: checked })}>
            <input
                type="radio"
                name={name}
                className="sr-only"
                checked={checked}
                onChange={onSelect}
            />
            {label}
        </label>
    )
}
