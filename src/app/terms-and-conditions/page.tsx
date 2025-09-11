import { Navigation } from "@/components/sections/navigation";
import Footer from "@/components/sections/footer";
import Link from "next/link";

export default function TermsAndConditionsPage() {
  return (
    <main className="min-h-screen">
      <Navigation />

      <section className="container max-w-4xl py-10 md:py-14">
        <header className="mb-8 md:mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-secondary">Terms & Conditions</h1>
          <p className="text-sm text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </header>

        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-semibold text-secondary mb-3">1. Acceptance of Terms</h2>
            <p className="text-text-medium leading-relaxed">
              By accessing or using this website, booking services, creating an account, or purchasing any package, you agree to be legally bound by these Terms & Conditions and our Privacy Policy. If you do not agree, do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-secondary mb-3">2. Eligibility</h2>
            <ul className="list-disc pl-6 space-y-2 text-text-medium leading-relaxed">
              <li>You must be at least 18 years old to book services or create an account. For minors, a parent/guardian must provide consent.</li>
              <li>You warrant that all information provided by you is true, accurate, and complete.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-secondary mb-3">3. Services</h2>
            <p className="text-text-medium leading-relaxed">
              We provide diagnostic testing packages, sample collection, and related health information. Services are provided subject to availability, applicable regulations, and internal quality policies. We may modify, suspend, or discontinue any service at any time without prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-secondary mb-3">4. User Accounts</h2>
            <ul className="list-disc pl-6 space-y-2 text-text-medium leading-relaxed">
              <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
              <li>You must immediately notify us of any unauthorized access or security breach.</li>
              <li>We may suspend or terminate accounts for suspected fraud, policy breaches, or misuse.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-secondary mb-3">5. Orders, Bookings & Payments</h2>
            <ul className="list-disc pl-6 space-y-2 text-text-medium leading-relaxed">
              <li>Placing an order constitutes an offer to purchase; acceptance occurs when we confirm the booking.</li>
              <li>Prices, discounts, and promotions are subject to change without notice and may vary by location and time.</li>
              <li>Payments must be successfully completed before sample collection, unless otherwise specified.</li>
              <li>We reserve the right to cancel any order due to pricing errors, suspicious activity, or service unavailability.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-secondary mb-3">6. Medical Disclaimer</h2>
            <ul className="list-disc pl-6 space-y-2 text-text-medium leading-relaxed">
              <li>We do not provide medical advice. Test results are for informational purposes and must be interpreted by a qualified physician.</li>
              <li>Do not disregard professional medical advice based on content or results obtained from this website.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-secondary mb-3">7. Sample Collection & Reports</h2>
            <ul className="list-disc pl-6 space-y-2 text-text-medium leading-relaxed">
              <li>Turnaround times are estimates and may vary due to logistics, quality checks, or unforeseen circumstances.</li>
              <li>Improper sample conditions may require recollection; additional charges may apply.</li>
              <li>Reports are released to the registered user via secure channels; sharing credentials is at your own risk.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-secondary mb-3">8. Cancellations & Refunds</h2>
            <ul className="list-disc pl-6 space-y-2 text-text-medium leading-relaxed">
              <li>
                Cancellations must be requested before sample collection. Post-collection cancellations are generally not eligible for refunds.
              </li>
              <li>
                Refunds (if approved) are processed to the original payment method within a reasonable period, net of applicable charges.
              </li>
              <li>
                No-show or address unavailability at scheduled time may incur revisit fees or forfeiture of booking.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-secondary mb-3">9. Pricing, Offers & Errors</h2>
            <ul className="list-disc pl-6 space-y-2 text-text-medium leading-relaxed">
              <li>We strive for accuracy but do not guarantee that all content, pricing, or availability information is error-free.</li>
              <li>We may correct errors, inaccuracies, or omissions and change or update information at any time without notice.</li>
              <li>Discounts, coupons, or promotional offers are subject to specific terms and may be withdrawn at our discretion.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-secondary mb-3">10. Intellectual Property</h2>
            <p className="text-text-medium leading-relaxed">
              All content on this website, including text, graphics, logos, icons, images, and software, is our property or licensed to us and protected by applicable intellectual property laws. You may not reproduce, distribute, modify, or create derivative works without prior written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-secondary mb-3">11. Acceptable Use & Prohibited Conduct</h2>
            <ul className="list-disc pl-6 space-y-2 text-text-medium leading-relaxed">
              <li>No misuse of the site, including hacking, scraping, or introducing malicious code.</li>
              <li>No false bookings, chargebacks without cause, or fraudulent activities.</li>
              <li>No infringement, defamation, harassment, or violation of third-party rights.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-secondary mb-3">12. User Content & Reviews</h2>
            <ul className="list-disc pl-6 space-y-2 text-text-medium leading-relaxed">
              <li>You are solely responsible for content you submit (reviews, comments, feedback).</li>
              <li>We may moderate or remove content at our discretion without obligation to explain.</li>
              <li>By submitting content, you grant us a worldwide, royalty-free, perpetual license to use and display it.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-secondary mb-3">13. Third-Party Links & Services</h2>
            <p className="text-text-medium leading-relaxed">
              Our website may contain links to third-party sites or integrate third-party services. We are not responsible for their content, policies, or practices. Access at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-secondary mb-3">14. Limitation of Liability</h2>
            <ul className="list-disc pl-6 space-y-2 text-text-medium leading-relaxed">
              <li>To the maximum extent permitted by law, we are not liable for indirect, incidental, special, punitive, or consequential damages.</li>
              <li>Our aggregate liability for any claim shall not exceed the amount paid by you for the service giving rise to the claim.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-secondary mb-3">15. Indemnification</h2>
            <p className="text-text-medium leading-relaxed">
              You agree to defend, indemnify, and hold us harmless from any claims, damages, liabilities, costs, and expenses arising from your use of the website, breach of these Terms, or violation of any law or third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-secondary mb-3">16. Suspension & Termination</h2>
            <p className="text-text-medium leading-relaxed">
              We may suspend or terminate your access, without notice, for any conduct we believe violates these Terms, is harmful to other users, or to protect our interests or the integrity of our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-secondary mb-3">17. Governing Law</h2>
            <p className="text-text-medium leading-relaxed">
              These Terms are governed by the laws of the jurisdiction in which our principal place of business is located, without regard to conflict of laws principles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-secondary mb-3">18. Dispute Resolution</h2>
            <ul className="list-disc pl-6 space-y-2 text-text-medium leading-relaxed">
              <li>Parties shall first attempt to resolve disputes amicably within 30 days.</li>
              <li>Unresolved disputes shall be subject to binding arbitration or courts of competent jurisdiction, as applicable by law.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-secondary mb-3">19. Changes to Terms</h2>
            <p className="text-text-medium leading-relaxed">
              We may update these Terms at any time. Continued use of the website after changes constitutes acceptance of the updated Terms. Material changes will be highlighted on this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-secondary mb-3">20. Contact Us</h2>
            <p className="text-text-medium leading-relaxed">
              For questions or concerns, please contact us via the details on our <Link href="/" className="text-primary hover:underline">homepage</Link> or through the contact information in the website footer.
            </p>
          </section>
        </div>
      </section>

      <Footer />
    </main>
  );
}