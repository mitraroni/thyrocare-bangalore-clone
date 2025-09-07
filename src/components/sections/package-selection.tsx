"use client";

import { Search, ChevronRight, Eye, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

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

const PackageCard = ({ pkg }: { pkg: Package }) => {
  const displayPrice = pkg.discountPrice || pkg.price;

  return (
    <div className="flex flex-col border border-border rounded-lg shadow-sm bg-card min-h-[280px] max-h-[300px] overflow-hidden">
      <div className="flex-shrink-0 flex items-start justify-between p-3 bg-red-50 min-h-[70px] cursor-pointer">
        <h3 className="flex-1 text-sm font-bold text-text-dark leading-5 pr-2 line-clamp-2">
          {pkg.name}
        </h3>
        <div className="flex-shrink-0 w-4 h-4 bg-[#061C3F] rounded-full flex items-center justify-center mt-1">
          <ChevronRight className="w-3 h-3 text-white" />
        </div>
      </div>
      
      <div className="p-3 flex flex-col flex-grow justify-between">
        <div className="flex-grow">
          <p className="text-xs text-text-medium line-clamp-2 mb-2">
            {pkg.description}
          </p>
          
          {pkg.testsIncluded && (
            <div className="text-xs text-text-dark flex items-center flex-wrap mb-3">
              <p className="truncate mr-1 max-w-[120px]">{pkg.testsIncluded}</p>
              {pkg.testCount > 1 && (
                <span className="text-link flex-shrink-0 font-medium whitespace-nowrap cursor-pointer">
                  +{pkg.testCount - 1} Tests
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-text-dark">₹{displayPrice}</p>
                {pkg.discountPrice && pkg.discountPrice < pkg.price && (
                  <p className="text-xs text-muted-foreground line-through">₹{pkg.price}</p>
                )}
              </div>
              {pkg.discountPercentage && (
                <p className="text-xs text-green-600 font-medium">{pkg.discountPercentage}% OFF</p>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <button className="flex-1 bg-secondary text-secondary-foreground px-2 py-2 rounded-md text-xs font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-1">
              <Eye className="w-3 h-3" />
              Details
            </button>
            <button className="flex-1 bg-primary text-primary-foreground px-2 py-2 rounded-md text-xs font-medium hover:bg-secondary-red transition-colors flex items-center justify-center gap-1">
              <ShoppingCart className="w-3 h-3" />
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PackageSelection = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/packages?limit=8');
      if (!response.ok) {
        throw new Error('Failed to fetch packages');
      }
      const data = await response.json();
      setPackages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const filteredPackages = packages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pkg.testsIncluded && pkg.testsIncluded.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (error) {
    return (
      <section className="bg-background py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-14">
          <div className="text-center py-8">
            <p className="text-red-600">Error loading packages: {error}</p>
            <button 
              onClick={fetchPackages}
              className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-secondary-red transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-background py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-14">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-dark">
            Select Package
          </h2>
          <div className="relative w-full md:w-[500px]">
            <input
              type="text"
              placeholder="Search Test/Profile/Package"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-4 pr-12 text-sm border rounded-md border-border placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-gray-500">
              <Search className="w-5 h-5" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="border border-border rounded-lg shadow-sm bg-card min-h-[280px] animate-pulse">
                <div className="h-[70px] bg-gray-200"></div>
                <div className="p-3 space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="flex justify-between items-center mt-6">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <div className="h-8 bg-gray-200 rounded flex-1"></div>
                    <div className="h-8 bg-gray-200 rounded flex-1"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredPackages.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} />
              ))}
            </div>

            {filteredPackages.length === 0 && !loading && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No packages found matching your search.</p>
              </div>
            )}

            <div className="mt-10 text-center">
              <Link href="/packages">
                <button className="bg-[#061C3F] text-white font-bold py-3 px-10 rounded-lg hover:opacity-90 transition-opacity w-full mx-auto md:w-32">
                  View More
                </button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default PackageSelection;