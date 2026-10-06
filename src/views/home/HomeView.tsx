import { Benefits } from '@/views/home/components/Benefits'
import { BrandsStrip } from '@/views/home/components/BrandsStrip'
import { CategoryStrip } from '@/views/home/components/CategoryStrip'
import { CtaBanner } from '@/views/home/components/CtaBanner'
import { Hero } from '@/views/home/components/Hero'
import { FeaturedProducts, NewArrivals } from '@/views/home/components/HomeRails'
import { Testimonials } from '@/views/home/components/Testimonials'

export function HomeView() {
    return (
        <>
            <Hero />
            <CategoryStrip />
            <NewArrivals />
            <FeaturedProducts />
            <BrandsStrip />
            <Benefits />
            <Testimonials />
            <CtaBanner />
        </>
    )
}
