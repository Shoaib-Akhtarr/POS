'use client';

import { motion } from 'framer-motion';
import LandingNavbar from '@/components/marketing/LandingNavbar';
import CTASection from '@/components/marketing/CTASection';
import Footer from '@/components/marketing/Footer';

const aboutSections = [
    {
        id: 'our-mission',
        title: 'Our Mission',
        subtitle: 'Empowering Growth through Digital Tools',
        content: [
            'Our mission is to empower small and medium businesses with simple yet powerful digital tools that make sales management, record keeping, and daily operations more efficient.',
            'We aim to remove the technical barriers that prevent businesses from adopting modern software by creating a system that is easy to learn, reliable to use, and accessible from anywhere.'
        ],
        icon: '🎯',
        color: 'from-indigo-500/20 to-indigo-600/10'
    },
    {
        id: 'our-vision',
        title: 'Our Vision',
        subtitle: 'The Future of Business Ecosystems',
        content: [
            'Our vision is to build a smart business ecosystem where retailers and entrepreneurs can manage their businesses seamlessly using technology.',
            'In the future, Karobar Sahulat aims to evolve into a platform that integrates advanced features such as analytics, automation, and intelligent business insights to help businesses grow faster and make better decisions.'
        ],
        icon: '🚀',
        color: 'from-emerald-500/20 to-emerald-600/10'
    },
    {
        id: 'why-built',
        title: 'Why We Built This POS',
        subtitle: 'Solving Real-World Business Challenges',
        content: [
            'Many small businesses still rely on manual records or complicated software that slows down their daily operations. We built Karobar Sahulat to solve this problem by providing a simple, efficient, and practical POS system.',
            'The idea behind this platform is to give businesses a tool that feels natural to use while still offering the power of modern technology. By focusing on usability and performance, we aim to create a system that supports entrepreneurs in managing their work smoothly and confidently.'
        ],
        icon: '💡',
        color: 'from-amber-500/20 to-amber-600/10'
    }
];

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
            <LandingNavbar />
            
            <main>
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-grid">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
                        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
                        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[100px]" />
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center max-w-4xl mx-auto">
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-6 block"
                            >
                                Get to know us
                            </motion.span>
                            <motion.h1 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-5xl md:text-8xl font-black text-foreground tracking-tight leading-[0.95] mb-10 italic"
                            >
                                Your Partner in <br />
                                <span className="text-gradient">Digital Success.</span>
                            </motion.h1>
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="space-y-6 text-lg md:text-xl text-muted font-medium max-w-3xl mx-auto leading-relaxed"
                            >
                                <p>
                                    <span className="text-foreground font-bold">Karobar Sahulat – Web POS</span> is a modern point-of-sale platform designed to simplify how businesses manage sales and operations. Our goal is to provide a fast, reliable, and easy-to-use system that helps shop owners focus on running their business instead of struggling with complicated software.
                                </p>
                                <p>
                                    We believe technology should make work easier, not harder. That is why our POS is built as a web-based solution that allows businesses to manage transactions, users, and business activities from a clean and simple interface.
                                </p>
                                <p>
                                    Karobar Sahulat is developed with a focus on usability, performance, and accessibility, making it suitable for small and growing businesses that need a smart digital solution for daily operations.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Values / Mission sections */}
                <div className="py-24 space-y-32">
                    {aboutSections.map((section, index) => (
                        <section 
                            key={section.id} 
                            id={section.id} 
                            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-32"
                        >
                            <div className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-16 lg:gap-24`}>
                                {/* Text Content */}
                                <motion.div 
                                    initial={{ opacity: 0, x: index % 2 === 1 ? -30 : 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="flex-1 space-y-8"
                                >
                                    <div>
                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4 block">
                                            {section.subtitle}
                                        </span>
                                        <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight italic mb-8">
                                            {section.title}
                                        </h2>
                                        <div className="space-y-6">
                                            {section.content.map((paragraph, pIndex) => (
                                                <p key={pIndex} className="text-lg md:text-xl text-muted font-medium leading-relaxed">
                                                    {paragraph}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Visual Element */}
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9, rotate: index % 2 === 1 ? 5 : -5 }}
                                    whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                                    viewport={{ once: true }}
                                    className="flex-1 w-full"
                                >
                                    <div className={`relative aspect-square lg:aspect-[4/3] rounded-[3rem] overflow-hidden bg-gradient-to-br ${section.color} border border-white/5 shadow-2xl flex items-center justify-center group`}>
                                        <div className="text-9xl group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
                                            {section.icon}
                                        </div>
                                        
                                        {/* Decorative elements */}
                                        <div className="absolute inset-0 bg-grid opacity-20" />
                                        <div className="absolute top-8 right-8 glass px-4 py-2 rounded-xl text-[10px] font-black text-white/50 uppercase tracking-widest">
                                            Chapter {index + 1}
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </section>
                    ))}
                </div>

                <CTASection />
            </main>
            
            <Footer />
        </div>
    );
}
