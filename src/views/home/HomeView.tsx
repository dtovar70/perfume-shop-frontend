import { ROUTES } from '@/constants/route.constant'
import { formatVePhone, socialLinks } from '@/utils/content'
import { absoluteUrl, useSeo } from '@/utils/hooks/useSeo'
import { useSiteContent } from '@/utils/hooks/useSiteContent'
import { Benefits } from '@/views/home/components/Benefits'
import { BrandsStrip } from '@/views/home/components/BrandsStrip'
import { CategoryStrip } from '@/views/home/components/CategoryStrip'
import { CtaBanner } from '@/views/home/components/CtaBanner'
import { Hero } from '@/views/home/components/Hero'
import { FeaturedProducts, NewArrivals } from '@/views/home/components/HomeRails'
import { HowItWorks } from '@/views/home/components/HowItWorks'
import { Testimonials } from '@/views/home/components/Testimonials'

/**
 * The original store's rhythm: hero, a tinted category band, product grids, the tinted
 * "how it works" band, social proof and a closing banner. Bands alternate with plain sections.
 */
export function HomeView() {
    const { general, contact } = useSiteContent()
    const sameAs = socialLinks(contact)
        .filter((link) => link.label !== 'WhatsApp')
        .map((link) => link.href)
    useSeo({
        canonical: ROUTES.home,
        jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'Store',
            name: `${general.brandName} Perfumería`,
            description: general.description,
            url: absoluteUrl(ROUTES.home),
            logo: absoluteUrl('/img/kaizen-logo.jpg'),
            image: absoluteUrl('/img/og-image.png'),
            ...(contact.email ? { email: contact.email } : {}),
            ...(contact.phone ? { telephone: formatVePhone(contact.phone) } : {}),
            ...(contact.city
                ? {
                      address: {
                          '@type': 'PostalAddress',
                          addressLocality: contact.city,
                          addressCountry: 'VE',
                      },
                  }
                : {}),
            currenciesAccepted: 'USD, VES',
            ...(sameAs.length > 0 ? { sameAs } : {}),
        },
    })

    return (
        <>
            <Hero />
            <Benefits />
            <CategoryStrip />
            <NewArrivals />
            <FeaturedProducts />
            <HowItWorks />
            <BrandsStrip />
            <Testimonials />
            <CtaBanner />
        </>
    )
}
