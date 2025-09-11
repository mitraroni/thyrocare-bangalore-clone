"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, Filter, Eye, ShoppingCart, ChevronLeft, ChevronRight, ArrowUpDown, X } from 'lucide-react';
import { Navigation } from '@/components/sections/navigation';
import Footer from '@/components/sections/footer';
import AppointmentForm from '@/components/sections/appointment-form';

interface Package {
  id: number;
  name: string;
  description: string;
  testsIncluded: string;
  testCount: number;
  price: number;
  originalPrice: number;
  discountPrice: number | null;
  discountPercentage: number | null;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

const ITEMS_PER_PAGE = 12;

const SkeletonCard = () => (
  <div className="bg-white rounded-lg shadow-md p-6 h-[350px] animate-pulse">
    <div className="h-6 bg-gray-200 rounded mb-4"></div>
    <div className="h-4 bg-gray-200 rounded mb-2"></div>
    <div className="h-4 bg-gray-200 rounded mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
    <div className="flex items-center gap-2 mb-4">
      <div className="h-6 bg-gray-200 rounded w-20"></div>
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </div>
    <div className="flex gap-2 mt-auto">
      <div className="h-10 bg-gray-200 rounded flex-1"></div>
      <div className="h-10 bg-gray-200 rounded flex-1"></div>
    </div>
  </div>
);

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<number>>(new Set());
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/packages');
      if (!response.ok) {
        throw new Error('Failed to fetch packages');
      }
      
      const data = await response.json();
      setPackages(data);
      setFilteredPackages(data);
    } catch (err) {
      setError('Failed to load packages. Please try again.');
      console.error('Error fetching packages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  // Search and sort logic
  useEffect(() => {
    let filtered = packages.filter(pkg => {
      const searchLower = searchTerm.toLowerCase();
      return (
        pkg.name.toLowerCase().includes(searchLower) ||
        pkg.description.toLowerCase().includes(searchLower) ||
        (pkg.testsIncluded && pkg.testsIncluded.toLowerCase().includes(searchLower))
      );
    });

    // Sort packages
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.discountPrice || a.price) - (b.discountPrice || b.price);
        case 'price-high':
          return (b.discountPrice || b.price) - (a.discountPrice || a.price);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredPackages(filtered);
    setCurrentPage(1);
  }, [packages, searchTerm, sortBy]);

  const toggleDescription = (packageId: number) => {
    const newExpanded = new Set(expandedDescriptions);
    if (newExpanded.has(packageId)) {
      newExpanded.delete(packageId);
    } else {
      newExpanded.add(packageId);
    }
    setExpandedDescriptions(newExpanded);
  };

  const truncateDescription = (description: string, limit: number = 100) => {
    if (description.length <= limit) return description;
    return description.substring(0, limit) + '...';
  };

  const getTestCodesArray = (testsIncluded: string): string[] => {
    if (!testsIncluded) return [];
    return testsIncluded.split(',').map(test => test.trim()).filter(test => test.length > 0);
  };

  // Pagination
  const totalPages = Math.ceil(filteredPackages.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPackages = filteredPackages.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openBooking = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsBookingOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeBooking = () => {
    setIsBookingOpen(false);
    setSelectedPackage(null);
    document.body.style.overflow = '';
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navigation />
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="container py-6">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm mb-4">
              <Link href="/" className="text-blue-600 hover:underline">Home</Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">Packages</span>
            </nav>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">All Medical Test Packages</h1>
            <p className="text-lg text-gray-600 mb-6">
              Comprehensive health checkup packages designed to meet all your diagnostic needs
            </p>
          </div>
        </div>

        {/* Loading Content */}
        <div className="container py-8">
          {/* Search and Filter Bar Skeleton */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="w-48">
                <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Navigation />
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchPackages}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm mb-4">
            <Link href="/" className="text-blue-600 hover:underline">Home</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">Packages</span>
          </nav>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">All Medical Test Packages</h1>
          <p className="text-lg text-gray-600 mb-6">
            Comprehensive health checkup packages designed to meet all your diagnostic needs
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="container py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search packages by name, description, or test codes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <ArrowUpDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {paginatedPackages.length} of {filteredPackages.length} packages
          </div>
        </div>

        {/* Package Grid */}
        {filteredPackages.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No packages found</h2>
            <p className="text-gray-600">Try adjusting your search terms or filters.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {paginatedPackages.map((pkg) => {
                const testCodes = getTestCodesArray(pkg.testsIncluded);
                const displayPrice = pkg.discountPrice || pkg.price;
                
                return (
                  <div
                    key={pkg.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 p-6 h-[350px] flex flex-col"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">{pkg.name}</h3>
                    
                    <div className="mb-4 flex-grow">
                      <p className="text-gray-600 text-sm mb-2">
                        {expandedDescriptions.has(pkg.id)
                          ? pkg.description
                          : truncateDescription(pkg.description)
                        }
                        {pkg.description.length > 100 && (
                          <button
                            onClick={() => toggleDescription(pkg.id)}
                            className="text-primary hover:underline ml-1"
                          >
                            {expandedDescriptions.has(pkg.id) ? 'Show Less' : 'Read More'}
                          </button>
                        )}
                      </p>
                      
                      <div className="text-xs text-gray-500 mb-2">
                        <span className="font-medium">{pkg.testCount} Tests:</span>
                        <span className="ml-1">{testCodes.slice(0, 2).join(', ')}</span>
                        {testCodes.length > 2 && (
                          <span className="ml-1">+{testCodes.length - 2} more</span>
                        )}
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="mb-4">
                      {pkg.discountPrice && pkg.discountPrice < pkg.price ? (
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-primary">₹{pkg.discountPrice}</span>
                          <span className="text-sm text-gray-500 line-through">₹{pkg.price}</span>
                          {pkg.discountPercentage && (
                            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                              {pkg.discountPercentage}% OFF
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-2xl font-bold text-gray-900">₹{pkg.price}</span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-auto">
                      <Link
                        href={`/packages/${pkg.id}`}
                        className="flex-1 bg-secondary text-white px-4 py-2 rounded-md text-center text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Details
                      </Link>
                      <button
                        onClick={() => openBooking(pkg)}
                        className="flex-1 bg-primary text-white px-4 py-2 rounded-md text-center text-sm font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Book Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                  const pageNumber = Math.max(1, currentPage - 2) + index;
                  if (pageNumber > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === pageNumber
                          ? 'bg-primary text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />

      {/* Booking Modal */}
      {isBookingOpen && selectedPackage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeBooking} />
          <div className="relative bg-white w-full max-w-3xl mx-4 rounded-lg shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Book: {selectedPackage.name}</h3>
              <button onClick={closeBooking} className="p-2 rounded hover:bg-gray-100" aria-label="Close booking form">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 max-h-[80vh] overflow-y-auto">
              <div className="lg:col-span-2">
                <AppointmentForm />
              </div>
              <aside className="lg:col-span-1">
                <div className="bg-gray-50 border rounded-lg p-4">
                  <p className="text-sm text-gray-700 mb-2 font-medium">Package Summary</p>
                  <p className="text-sm text-gray-900 mb-1">{selectedPackage.testCount} tests included</p>
                  <div className="mb-3">
                    {selectedPackage.discountPrice && selectedPackage.discountPrice < selectedPackage.price ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-primary">₹{selectedPackage.discountPrice}</span>
                        <span className="text-sm text-gray-500 line-through">₹{selectedPackage.price}</span>
                        {selectedPackage.discountPercentage && (
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded">
                            {selectedPackage.discountPercentage}% OFF
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xl font-bold text-gray-900">₹{selectedPackage.price}</span>
                    )}
                  </div>
                  <Link href={`/packages/${selectedPackage.id}`} className="text-sm text-blue-600 hover:underline">
                    View details
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}