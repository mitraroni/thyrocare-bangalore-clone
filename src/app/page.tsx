import { Navigation } from '@/components/sections/navigation';
import Footer from '@/components/sections/footer';
import { PromoHero } from '@/components/sections/promotional-hero';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      
      <PromoHero />
      
      <Footer />
    </main>
  );
}