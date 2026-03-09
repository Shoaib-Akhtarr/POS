'use client';

import LandingNavbar from '@/components/marketing/LandingNavbar';
import Pricing from '@/components/marketing/Pricing';
import CTASection from '@/components/marketing/CTASection';
import Footer from '@/components/marketing/Footer';

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <LandingNavbar />
            <main>
                <div className="pt-20">
                    <Pricing />
                </div>
                <CTASection />
            </main>
            <Footer />
        </div>
    );
}
