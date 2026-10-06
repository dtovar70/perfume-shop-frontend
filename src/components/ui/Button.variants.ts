import { cva, type VariantProps } from 'class-variance-authority'

/**
 * Shared by `Button` and `ButtonLink` so a CTA looks identical whether it renders a
 * `<button>` or a router `<Link>`. Pills, like the original store. Contrast: `on-cherry` text
 * on cherry-500 is 4.6:1 in both themes (5.6:1 on the cherry-600 hover/press).
 */
export const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cherry-500 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 motion-reduce:transform-none motion-reduce:transition-none',
    {
        variants: {
            variant: {
                primary:
                    'bg-cherry-500 text-on-cherry shadow-glow hover:-translate-y-0.5 hover:bg-cherry-600 active:bg-cherry-600 disabled:bg-elevated disabled:text-fg-soft disabled:opacity-100 disabled:shadow-none disabled:ring-1 disabled:ring-line-strong',
                secondary:
                    'border border-line-strong bg-transparent text-fg hover:-translate-y-0.5 hover:border-fg/60 hover:bg-fg/5',
                ghost: 'text-fg hover:bg-fg/5',
                /** Quiet pill on a surface (filters, secondary actions inside cards). */
                soft: 'border border-line bg-elevated text-fg hover:border-cherry-500/40 hover:text-accent-strong',
                /** WhatsApp green (darkened for white text contrast). */
                whatsapp:
                    'bg-whatsapp text-white shadow-soft hover:-translate-y-0.5 hover:bg-whatsapp-hover',
                danger: 'bg-danger text-canvas shadow-soft hover:-translate-y-0.5 hover:bg-danger-hover',
            },
            size: {
                // Touch screens get a 44px target; mouse users keep the compact size.
                sm: 'h-9 px-4 text-sm pointer-coarse:h-11',
                md: 'h-11 px-6 text-[15px]',
                lg: 'h-13 px-8 text-base',
            },
            fullWidth: {
                true: 'w-full',
                false: '',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
            fullWidth: false,
        },
    },
)

export type ButtonVariantProps = VariantProps<typeof buttonVariants>
