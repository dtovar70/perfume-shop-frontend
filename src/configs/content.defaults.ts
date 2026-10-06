/**
 * Built-in content: exactly the texts and values the storefront shipped with before they became
 * editable. `GET /content` merges the stored values over these, so a section nobody edited (or a
 * field added later) renders these.
 *
 * Mirror of the API's src/content/content.defaults.ts; the storefront falls back to it when the
 * API is slow or cannot be reached. Keep both files identical (only the import and this
 * comment differ).
 */
import type { SiteContent } from '@/@types/content'

export const DEFAULT_SITE_CONTENT: SiteContent = {
    general: {
        brandName: 'KaiZen',
        tagline: 'Fragancias originales que cuentan tu historia',
        description:
            'Perfumería con fragancias 100% originales de diseñador y árabes, para mujer y hombre. Asesoría personalizada y envíos a toda Venezuela.',
        titleSuffix: 'Perfumería — fragancias originales',
        metaDescription:
            'Perfumes originales de diseñador y árabes para mujer y hombre. Pago Móvil y divisas, envío gratis desde {envioGratis} a toda Venezuela.',
        searchPlaceholder: 'Buscar perfumes, marcas…',
    },
    announcements: {
        messages: [
            'Envío gratis desde {envioGratis} a toda Venezuela',
            'Fragancias 100% originales',
            'Paga con Pago Móvil o en divisas',
        ],
    },
    home: {
        heroBadge: '',
        heroTitle: 'Tu esencia, *en cada gota*',
        heroSubtitle:
            'Fragancias originales de las casas que amas, elegidas una a una. Encuentra el aroma que te define y recíbelo en la puerta de tu casa.',
        heroPrimaryCta: 'Ver catálogo',
        heroSecondaryCta: 'Pedir por WhatsApp',
        heroFeatures: ['100% originales', 'Envíos a todo el país', 'Asesoría personalizada'],
        heroMedia: null,
        categoriesEyebrow: 'Colecciones',
        categoriesTitle: 'Encuentra tu *próxima firma*',
        categoriesDescription:
            '{categorias} pensadas para cada momento: del día a día a la noche especial.',
        featuredEyebrow: 'Selección KaiZen',
        featuredTitle: 'Fragancias *destacadas*',
        featuredDescription: 'Las que más nos piden y las que no dejamos de recomendar.',
        featuredCta: 'Ver todo el catálogo',
        stepsEyebrow: 'Comprar es fácil',
        stepsTitle: 'Tu perfume en *tres pasos*',
        stepsDescription: 'Sin complicaciones, con atención real de principio a fin.',
        steps: [
            {
                title: 'Elige tu fragancia',
                description:
                    'Filtra por marca, familia olfativa o concentración. Si dudas, te asesoramos por WhatsApp.',
            },
            {
                title: 'Paga como prefieras',
                description:
                    'Pago Móvil con la tasa BCV del día o en divisas. Confirmamos tu pago en minutos.',
            },
            {
                title: 'Recíbelo en casa',
                description:
                    'Enviamos a toda Venezuela, bien protegido, o retíralo en tienda cuando quieras.',
            },
        ],
        testimonialsEyebrow: 'Opiniones',
        testimonialsTitle: 'Lo que *dicen* nuestros clientes',
        testimonials: [],
        ctaBadge: 'Asesoría personalizada',
        ctaTitle: '¿No sabes cuál *elegir*?',
        ctaDescription:
            'Cuéntanos qué aromas te gustan y para qué ocasión. Te recomendamos opciones a tu medida, sin compromiso.',
        ctaPrimary: 'Escríbenos',
        ctaSecondary: 'Conócenos',
    },
    about: {
        badge: 'Perfumería KaiZen',
        title: 'El arte de *elegir bien*',
        paragraphs: [
            '{marca} nació de una pasión sencilla: que cada persona encuentre la fragancia que la acompaña. Seleccionamos cada perfume con cuidado y solo trabajamos con productos 100% originales.',
            'Atendemos desde {ciudad} y enviamos a todo el país. Te asesoramos antes de comprar y te acompañamos hasta que tu perfume llega a tus manos.',
        ],
        ctaLabel: 'Hablemos de fragancias',
        imageBadge: '100% originales',
        valuesEyebrow: 'Nuestra esencia',
        valuesTitle: 'Lo que *nos define*',
        valuesDescription: 'Cuatro promesas detrás de cada frasco que enviamos.',
        values: [
            {
                icon: 'shield-check',
                title: 'Originalidad garantizada',
                description:
                    'Solo vendemos fragancias auténticas, selladas y de proveedores de confianza.',
            },
            {
                icon: 'heart-handshake',
                title: 'Asesoría cercana',
                description:
                    'Te ayudamos a elegir según tus gustos, tu piel y la ocasión. Hablas con personas, no con un bot.',
            },
            {
                icon: 'truck',
                title: 'Envíos seguros',
                description:
                    'Empacamos cada perfume con protección y te enviamos el número de guía apenas sale.',
            },
            {
                icon: 'sparkles',
                title: 'Curaduría con criterio',
                description:
                    'Un catálogo elegido a mano: clásicos imprescindibles y descubrimientos que vale la pena probar.',
            },
        ],
        statsEyebrow: 'En números',
        statsTitle: 'KaiZen en *cifras*',
        stats: [
            { value: '+1.500', label: 'clientes felices' },
            { value: '+120', label: 'fragancias' },
            { value: '23', label: 'estados con envío' },
        ],
    },
    contact: {
        email: 'hola@kaizenperfumeria.com',
        phone: '0414-5086536',
        whatsapp: '0414-5086536',
        city: 'Caracas',
        schedule: 'Lunes a sábado, 9:00 a.m. – 6:00 p.m.',
        instagram: 'kaizen.perfumeria',
        tiktok: 'kaizen.perfumeria',
    },
    contactPage: {
        badge: 'Respondemos rápido',
        title: '¿Te ayudamos a *elegir*?',
        intro: 'Escríbenos para pedir una recomendación, consultar disponibilidad o resolver cualquier duda sobre tu pedido.',
        faqEyebrow: 'Dudas comunes',
        faqTitle: 'Preguntas *frecuentes*',
        faq: [
            {
                question: '¿Los perfumes son originales?',
                answer: 'Sí. Todas nuestras fragancias son 100% originales, selladas y de proveedores de confianza.',
            },
            {
                question: '¿Cómo puedo pagar?',
                answer: 'Por Pago Móvil, con el monto en bolívares a la tasa BCV del día, o en divisas. Te confirmamos el pago apenas lo verificamos.',
            },
            {
                question: '¿Cuánto tarda mi pedido?',
                answer: '{produccion}. Te enviamos el número de guía apenas sale el paquete.',
            },
            {
                question: '¿Cómo funciona el envío?',
                answer: 'Enviamos a toda Venezuela. Envío gratis desde {envioGratis}; por debajo de ese monto la tarifa es de {tarifaEnvio}. También puedes retirar en tienda.',
            },
        ],
    },
    shipping: {
        freeThreshold: 35,
        flatRate: 4,
        freeShippingCopy: 'Envío gratis desde {envioGratis}',
        productionCopy: 'Despachamos en 1 a 2 días hábiles',
    },
    /** Shown at checkout and on the order page; empty until the owner fills it. */
    payment: {
        bankCode: '',
        bankName: '',
        phone: '',
        idNumber: '',
        holderName: '',
        instructions: '',
    },
}
