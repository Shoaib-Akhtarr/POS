'use client';

import LandingNavbar from '@/components/marketing/LandingNavbar';
import Features from '@/components/marketing/Features';
import Testimonials from '@/components/marketing/Testimonials';
import CTASection from '@/components/marketing/CTASection';
import Footer from '@/components/marketing/Footer';

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <LandingNavbar />
            <main>
                <div className="pt-20">
                    <Features />
                </div>
                <Testimonials />
                <CTASection />
            </main>
            <Footer />
        </div>
    );
}
