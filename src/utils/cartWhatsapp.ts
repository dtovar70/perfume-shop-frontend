import type { CartItem } from '@/@types/cart'
import type { ShippingContent } from '@/@types/content'
import { formatShortMoney, shippingCost } from '@/utils/content'
import { formatBolivares, formatRate, usdToBolivares } from '@/utils/formatBolivares'
import { formatCurrency } from '@/utils/formatCurrency'

/**
 * Budget for the URL-encoded message. wa.me links far longer than this get cut or refused by
 * some browsers and the WhatsApp apps; accents and bullets take 6-9 encoded characters each.
 */
export const WHATSAPP_MESSAGE_MAX_ENCODED = 3000

export interface CartWhatsappInput {
    items: readonly CartItem[]
    subtotal: number
    /** Current BCV rate (Bs per USD), when the API has a usable one. */
    rate?: number
    shipping: ShippingContent
    /** "Envío gratis desde $35", already filled from the CMS. */
    freeShippingText: string
    brandName: string
}

function lineText(item: CartItem): string {
    // "Khamrah EDP 100 ml" already says its size: no "(100 ml)" after it.
    const label = item.variantLabel
    const isRedundant =
        !label || label === 'Unidad' || item.name.toLowerCase().includes(label.toLowerCase())
    const variant = isRedundant ? '' : ` (${label})`
    return `• ${item.quantity} × ${item.name}${variant} — ${formatCurrency(item.unitPrice * item.quantity)}`
}

function encodedLength(lines: readonly string[]): number {
    return encodeURIComponent(lines.join('\n')).length
}

/**
 * The cart as a WhatsApp order message: greeting, one line per product, subtotal, the
 * approximate bolívares, a shipping note and a closing question. When the cart is too long for
 * a wa.me link, the last lines are folded into "…y N productos más" (the totals stay whole).
 */
export function buildCartWhatsappMessage({
    items,
    subtotal,
    rate,
    shipping,
    freeShippingText,
    brandName,
}: CartWhatsappInput): string {
    const header = [`¡Hola, ${brandName}! Quiero hacer este pedido:`, '']

    const totals = ['', `Subtotal: ${formatCurrency(subtotal)}`]
    if (rate && rate > 0) {
        totals.push(
            `≈ ${formatBolivares(usdToBolivares(subtotal, rate))} (tasa BCV ${formatRate(rate)} Bs/$)`,
        )
    }
    const cost = shippingCost(subtotal, shipping)
    totals.push(
        cost === 0
            ? `Envío: gratis (pedidos desde ${formatShortMoney(shipping.freeThreshold)})`
            : `Envío estimado: ${formatShortMoney(cost)} (${freeShippingText.toLowerCase()})`,
    )
    totals.push('', '¿Me confirmas la disponibilidad, por favor? ¡Gracias!')

    const lines = items.map(lineText)
    const budget = WHATSAPP_MESSAGE_MAX_ENCODED
    let kept = lines.length
    const assemble = (count: number) => {
        const rest = lines.length - count
        const folded =
            rest > 0 ? [`• …y ${rest} ${rest === 1 ? 'producto más' : 'productos más'}`] : []
        return [...header, ...lines.slice(0, count), ...folded, ...totals]
    }
    while (kept > 1 && encodedLength(assemble(kept)) > budget) kept -= 1

    let message = assemble(kept).join('\n')
    // A single absurdly long line: cut it by characters as a last resort.
    while (encodeURIComponent(message).length > budget && message.length > 0) {
        message = `${message.slice(0, Math.floor(message.length * 0.9))}…`
    }
    return message
}
