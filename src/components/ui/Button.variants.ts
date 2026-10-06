import { cva, type VariantProps } from 'class-variance-authority'

/**
 * Shared by `Button` and `ButtonLink` so a CTA looks identical whether it renders a
 * `<button>` or a router `<Link>`. Contrast: white on the rose gradient is >= 4.9:1 and ink on
 * the gold gradient is >= 5.8:1 (WCAG AA for body text).
 */
export const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-[0.01em] whitespace-nowrap transition duration-300 ease-out focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 motion-reduce:transform-none motion-reduce:transition-none',
    {
        variants: {
            variant: {
                primary:
                    'gradient-rose text-white shadow-soft hover:-translate-y-0.5 hover:shadow-lift hover:brightness-110',
                /** Champagne gold accent CTA (hero, banners). */
                gold: 'gradient-gold text-ink shadow-glow hover:-translate-y-0.5 hover:brightness-105',
                secondary:
                    'border border-ink/80 bg-transparent text-ink hover:-translate-y-0.5 hover:bg-ink hover:text-ivory',
                ghost: 'text-ink hover:bg-rose-50',
                'outline-gold':
                    'border border-gold-400/70 bg-gold-50 text-gold-800 hover:border-gold-500 hover:bg-gold-100',
                /** WhatsApp green (darkened for white text contrast). */
                whatsapp:
                    'bg-[#128c7e] text-white shadow-soft hover:-translate-y-0.5 hover:bg-[#0b6f63]',
                danger: 'bg-rose-800 text-white shadow-soft hover:-translate-y-0.5 hover:bg-rose-900',
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
