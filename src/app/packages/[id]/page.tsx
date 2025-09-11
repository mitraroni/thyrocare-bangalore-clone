import Link from "next/link";
import { Navigation } from "@/components/sections/navigation";
import Footer from "@/components/sections/footer";

interface Pkg {
  id: number;
  name: string;
  description: string;
  testsIncluded: string;
  testCount: number;
  price: number;
  originalPrice: number;
  discountPrice: number | null;
  discountPercentage: number | null;
}

async function getPackages(): Promise<Pkg[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/packages`, { cache: "no-store" });
  if (!res.ok) return [] as Pkg[];
  return res.json();
}

export default async function PackageDetailsPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const data = await getPackages();
  const pkg = data.find((p) => p.id === id);

  if (!pkg) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Package not found</h1>
          <p className="text-gray-600 mb-6">The package you are looking for does not exist.</p>
          <Link href="/packages" className="inline-block bg-secondary text-white px-5 py-3 rounded-md hover:bg-blue-700">Back to Packages</Link>
        </div>
        <Footer />
      </main>
    );
  }

  const tests = (pkg.testsIncluded || "").split(",").map(t => t.trim()).filter(Boolean);
  const displayPrice = pkg.discountPrice ?? pkg.price;

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container py-6">
          <nav className="flex items-center space-x-2 text-sm mb-4">
            <Link href="/" className="text-blue-600 hover:underline">Home</Link>
            <span className="text-gray-400">/</span>
            <Link href="/packages" className="text-blue-600 hover:underline">Packages</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">{pkg.name}</span>
          </nav>
          <h1 className="text-4xl font-bold text-gray-900">{pkg.name}</h1>
          <p className="text-gray-600 mt-2">Comprehensive diagnostics with {pkg.testCount} tests</p>
        </div>
      </div>

      <div className="container py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">About this package</h2>
            <p className="text-gray-700 leading-relaxed">{pkg.description || "No description available."}</p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Tests Included ({pkg.testCount})</h3>
            {tests.length === 0 ? (
              <p className="text-gray-600">No individual test list available.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tests.map((t, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">{t}</span>
                ))}
              </div>
            )}
          </div>
        </section>

        <aside className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-24">
            <div className="mb-4">
              {pkg.discountPrice && pkg.discountPrice < pkg.price ? (
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-primary">₹{displayPrice}</span>
                  <span className="text-sm text-gray-500 line-through">₹{pkg.price}</span>
                  {pkg.discountPercentage && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">{pkg.discountPercentage}% OFF</span>
                  )}
                </div>
              ) : (
                <span className="text-3xl font-bold text-gray-900">₹{displayPrice}</span>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Link href={`/book/${pkg.id}`} className="w-full bg-primary text-white px-4 py-3 rounded-md text-center font-medium hover:bg-red-600">Book Now</Link>
              <Link href="/packages" className="w-full border border-gray-300 px-4 py-3 rounded-md text-center font-medium hover:bg-gray-50">Back to Packages</Link>
            </div>
          </div>
        </aside>
      </div>
      <Footer />
    </main>
  );
}