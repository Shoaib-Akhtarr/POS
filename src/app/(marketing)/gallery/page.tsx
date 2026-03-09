'use client';

import LandingNavbar from '@/components/marketing/LandingNavbar';
import Gallery from '@/components/marketing/Gallery';
import CTASection from '@/components/marketing/CTASection';
import Footer from '@/components/marketing/Footer';

export default function GalleryPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <LandingNavbar />
            <main>
                <div className="pt-20">
                    <Gallery />
                </div>
                <CTASection />
            </main>
            <Footer />
        </div>
    );
}
