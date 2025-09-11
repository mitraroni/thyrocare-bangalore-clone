import { Navigation } from "@/components/sections/navigation";
import Footer from "@/components/sections/footer";
import Link from "next/link";
import { OffersGrid } from "@/components/special-offer/offers-grid";

export default function SpecialOfferPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <section className="container mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text-dark mb-3">Special Offers</h1>
          <p className="text-lg text-text-medium max-w-2xl mx-auto">
            Grab limited-time discounts on our most popular health packages. Add directly to cart and checkout.
          </p>
        </div>

        <OffersGrid />

        <div className="mt-12 text-center">
          <Link href="/packages" className="text-primary hover:underline">View all packages →</Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}