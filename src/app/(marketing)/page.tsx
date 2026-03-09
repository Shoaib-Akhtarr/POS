'use client';

import LandingNavbar from '@/components/marketing/LandingNavbar';
import Hero from '@/components/marketing/Hero';
import SaaSInfo from '@/components/marketing/SaaSInfo';
import Features from '@/components/marketing/Features';
import Testimonials from '@/components/marketing/Testimonials';
import Pricing from '@/components/marketing/Pricing';
import Gallery from '@/components/marketing/Gallery';
import CTASection from '@/components/marketing/CTASection';
import Footer from '@/components/marketing/Footer';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <LandingNavbar />
            <main>
                <Hero />
                <SaaSInfo />
                <CTASection />
            </main>
            <Footer />
        </div>
    );
}
