import type { ContentSection } from '@/@types/content'

export interface SectionMeta {
    label: string
    description: string
}

/** Tab labels and intros of the content editor, in display order. */
export const SECTION_META: Record<ContentSection, SectionMeta> = {
    general: {
        label: 'General y marca',
        description:
            'Nombre de la marca, eslogan, descripción del pie de página y lo que muestran los buscadores.',
    },
    announcements: {
        label: 'Cinta de anuncios',
        description: 'Los mensajes cortos que se desplazan en la franja oscura sobre el menú.',
    },
    home: {
        label: 'Inicio',
        description: 'Portada, títulos de cada bloque de la página de inicio y el banner final.',
    },
    about: {
        label: 'Nosotros',
        description: 'Historia de la tienda, valores y cifras de la página Nosotros.',
    },
    contact: {
        label: 'Contacto y redes',
        description:
            'Correo, teléfonos, ciudad, horario y redes. Se usan en Contacto, el pie de página y los enlaces de WhatsApp.',
    },
    contactPage: {
        label: 'Página de contacto',
        description: 'Encabezado y preguntas frecuentes de la página Contacto.',
    },
    shipping: {
        label: 'Envíos',
        description:
            'Monto para envío gratis, tarifa y tiempo de producción. El carrito y el checkout calculan el envío con estos valores.',
    },
    payment: {
        label: 'Pago Móvil',
        description:
            'Datos para que el cliente te pague por Pago Móvil. Todavía no se muestran en la tienda: el checkout los usará más adelante.',
    },
}
