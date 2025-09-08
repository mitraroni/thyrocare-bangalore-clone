import { Navigation } from '@/components/sections/navigation';
import Footer from '@/components/sections/footer';
import HeroBanner from '@/components/sections/hero-banner';
import LabInfo from '@/components/sections/lab-info';
import PackageSelection from '@/components/sections/package-selection';
import WhyChooseUs from '@/components/sections/why-choose-us';
import HowItWorksSection from '@/components/sections/how-it-works';
import SpecialRatesCta from '@/components/sections/special-rates-cta';
import FaqSection from '@/components/sections/faq';
import AppointmentForm from '@/components/sections/appointment-form';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      
      <HeroBanner />
      
      <LabInfo />
      
      <PackageSelection />
      
      <WhyChooseUs />
      
      <HowItWorksSection />
      
      <SpecialRatesCta />
      
      <FaqSection />
      
      <AppointmentForm />
      
      <Footer />
    </main>
  );
}