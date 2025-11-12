import React from 'react';
import { Helmet } from 'react-helmet';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import TemplatesSection from './components/TemplatesSection';
import HowItWorksSection from './components/HowItWorksSection';
import PricingSection from './components/PricingSection';
import TestimonialsSection from './components/TestimonialsSection';
import CTASection from './components/CTASection';

const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>StartupDocs Builder - All Your Startup Documents in One Place</title>
        <meta name="description" content="Access, edit, and download 1000+ verified business templates instantly. Simplify compliance and amplify growth for your startup." />
      </Helmet>

      <div className="min-h-screen">
        <Navbar />
        <HeroSection />
         <TemplatesSection />
          <HowItWorksSection />
        <FeaturesSection />
        <PricingSection />
        <TestimonialsSection />
        <CTASection />
        <Footer />
      </div>
    </>
  );
};

export default HomePage;