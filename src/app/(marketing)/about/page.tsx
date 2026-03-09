'use client';

import LandingNavbar from '@/components/marketing/LandingNavbar';
import SaaSInfo from '@/components/marketing/SaaSInfo';
import CTASection from '@/components/marketing/CTASection';
import Footer from '@/components/marketing/Footer';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <LandingNavbar />
            <main>
                <div className="pt-20">
                    <SaaSInfo />
                </div>
                <CTASection />
            </main>
            <Footer />
        </div>
    );
}
