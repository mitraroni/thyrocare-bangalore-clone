import { Navigation } from "@/components/sections/navigation"
import Footer from "@/components/sections/footer"
import AppointmentForm from "@/components/sections/appointment-form"
import Link from "next/link"

interface Pkg {
  id: number
  name: string
  description: string
  testsIncluded: string
  testCount: number
  price: number
  originalPrice?: number
  discountPrice?: number
  discountPercentage?: number
}

function splitTests(testsString: string): string[] {
  return testsString.split(",").map(test => test.trim()).filter(test => test.length > 0)
}

async function getPackage(id: number): Promise<Pkg | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/packages`, { cache: 'no-store' })
    if (!res.ok) return null
    const packages: Pkg[] = await res.json()
    return packages.find(pkg => pkg.id === id) || null
  } catch {
    return null
  }
}

export default async function BookPackagePage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  const pkg = await getPackage(id)

  if (!pkg) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Package Not Found</h2>
            <p className="text-gray-600 mb-6">The package you're looking for doesn't exist.</p>
            <Link
              href="/packages"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 transition-colors"
            >
              Back to Packages
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const tests = splitTests(pkg.testsIncluded)
  const displayTests = tests.slice(0, 5)
  const remainingTests = tests.length - displayTests.length

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/packages" className="hover:text-primary transition-colors">
            Packages
          </Link>
          <span>/</span>
          <span className="text-gray-900">Book</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left side - Appointment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Appointment Details</h1>
              <AppointmentForm />
            </div>
          </div>

          {/* Right side - Package Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{pkg.name}</h2>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">{pkg.testCount} tests included</p>
                <ul className="space-y-1">
                  {displayTests.map((test, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="text-primary mr-2">•</span>
                      {test}
                    </li>
                  ))}
                  {remainingTests > 0 && (
                    <li className="text-sm text-gray-500">
                      +{remainingTests} more
                    </li>
                  )}
                </ul>
              </div>

              <div className="border-t pt-4 mb-6">
                {pkg.discountPrice ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-primary">₹{pkg.discountPrice}</span>
                      <span className="text-lg text-gray-500 line-through">₹{pkg.originalPrice || pkg.price}</span>
                      {pkg.discountPercentage && (
                        <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                          {pkg.discountPercentage}% OFF
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-gray-900">
                    ₹{pkg.price}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Link
                  href={`/packages/${pkg.id}`}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-secondary text-base font-medium rounded-md shadow-sm text-secondary bg-white hover:bg-gray-50 transition-colors"
                >
                  Back to Details
                </Link>
                <Link
                  href="/packages"
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-secondary hover:bg-secondary/90 transition-colors"
                >
                  Back to Packages
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}