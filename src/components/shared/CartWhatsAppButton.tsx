import { SocialIcon } from '@/components/shared/SocialIcon'
import { buttonVariants } from '@/components/ui/Button.variants'
import { useCartItems, useCartSubtotal } from '@/store/cartStore'
import { buildCartWhatsappMessage } from '@/utils/cartWhatsapp'
import { cn } from '@/utils/cn'
import { whatsappUrl } from '@/utils/content'
import { useExchangeRate } from '@/utils/hooks/useExchangeRate'
import { useShippingContent, useSiteContent } from '@/utils/hooks/useSiteContent'

export interface CartWhatsAppButtonProps {
    className?: string
}

/**
 * "Pedir por WhatsApp": opens a chat with the whole cart written out (the cart is kept). A
 * secondary action under "Finalizar compra"; disabled with an empty cart or without a number.
 */
export function CartWhatsAppButton({ className }: CartWhatsAppButtonProps) {
    const items = useCartItems()
    const subtotal = useCartSubtotal()
    const { contact, general } = useSiteContent()
    const shipping = useShippingContent()
    const { data: rate } = useExchangeRate()

    const classes = cn(
        buttonVariants({ variant: 'secondary', fullWidth: true }),
        'gap-2.5 [&_svg]:text-whatsapp-ink',
        className,
    )
    const content = (
        <>
            <SocialIcon network="WhatsApp" className="size-5 shrink-0" />
            Pedir por WhatsApp
        </>
    )

    if (items.length === 0 || !contact.whatsapp) {
        return (
            <button
                type="button"
                disabled
                className={classes}
                title={contact.whatsapp ? 'Tu carrito está vacío' : undefined}
            >
                {content}
            </button>
        )
    }

    const message = buildCartWhatsappMessage({
        items,
        subtotal,
        rate: rate?.available ? rate.rate : undefined,
        shipping,
        freeShippingText: shipping.freeShippingText,
        brandName: general.brandName,
    })

    return (
        <a
            href={whatsappUrl(contact.whatsapp, message)}
            target="_blank"
            rel="noreferrer"
            aria-label="Pedir por WhatsApp (se abre en una pestaña nueva)"
            className={classes}
        >
            {content}
        </a>
    )
}
