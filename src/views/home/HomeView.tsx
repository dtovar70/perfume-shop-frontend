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
