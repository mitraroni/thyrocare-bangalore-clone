"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Filter, Plus, Minus, ShoppingCart, Star, ChevronDown, ChevronUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart, type Package } from "@/contexts/cart-context";
import { toast } from "sonner";
import { Navigation } from '@/components/sections/navigation';
import Footer from '@/components/sections/footer';

interface TestDetail {
  name: string;
  description: string;
}

interface BloodTestPackage extends Package {
  description: string;
  category: string;
  isPopular: boolean;
  isActive: boolean;
  tests: TestDetail[];
  created_at?: string;
  updated_at?: string;
}

const CATEGORIES = [
  { id: "all", label: "All Packages" },
  { id: "popular", label: "Popular" },
  { id: "comprehensive", label: "Comprehensive" },
  { id: "basic", label: "Basic" },
  { id: "cardiac", label: "Cardiac" },
  { id: "diabetes", label: "Diabetes" },
  { id: "thyroid", label: "Thyroid" }
];

const SORT_OPTIONS = [
  { id: "name", label: "Name (A-Z)" },
  { id: "price-low", label: "Price (Low to High)" },
  { id: "price-high", label: "Price (High to Low)" },
  { id: "tests", label: "Number of Tests" }
];

// Transform API package to BloodTestPackage format
const transformApiPackage = (apiPackage: any): BloodTestPackage => {
  const tests: TestDetail[] = [];
  
  // Parse test codes into test details
  if (apiPackage.test_codes) {
    const testCodes = apiPackage.test_codes.split(',').map((code: string) => code.trim());
    testCodes.forEach((code: string, index: number) => {
      tests.push({
        name: code,
        description: `Test code: ${code}`
      });
    });
  }

  // Determine category based on test count and name
  let category = "basic";
  if (apiPackage.test_count > 50) category = "comprehensive";
  else if (apiPackage.name.toLowerCase().includes("cardiac") || apiPackage.name.toLowerCase().includes("heart")) category = "cardiac";
  else if (apiPackage.name.toLowerCase().includes("diabetes") || apiPackage.name.toLowerCase().includes("sugar")) category = "diabetes";
  else if (apiPackage.name.toLowerCase().includes("thyroid")) category = "thyroid";

  // Determine if popular (packages with discounts or high test count)
  const isPopular = (apiPackage.discount_percentage && apiPackage.discount_percentage > 15) || apiPackage.test_count > 80;

  return {
    id: apiPackage.id.toString(),
    name: apiPackage.name,
    description: apiPackage.description || `Comprehensive package with ${apiPackage.test_count} tests`,
    test_count: apiPackage.test_count,
    price: apiPackage.price,
    original_price: apiPackage.original_price,
    discount_percentage: apiPackage.discount_percentage,
    category,
    isPopular,
    isActive: apiPackage.is_active,
    tests,
    created_at: apiPackage.created_at,
    updated_at: apiPackage.updated_at
  };
};

function PackageCardSkeleton() {
  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
          </div>
          <Skeleton className="h-6 w-16 ml-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

function PackageCard({ package: pkg }: { package: BloodTestPackage }) {
  const { addToCart, items, updateQuantity, isInCart, getItemQuantity } = useCart();
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const currentQuantityInCart = getItemQuantity(pkg.id);
  const itemInCart = isInCart(pkg.id);

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      addToCart(pkg, selectedQuantity);
      toast.success(`${pkg.name} added to cart!`);
    } catch (error) {
      toast.error("Failed to add item to cart");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQuantity = async (newQuantity: number) => {
    setIsLoading(true);
    try {
      updateQuantity(pkg.id, newQuantity);
      toast.success("Cart updated!");
    } catch (error) {
      toast.error("Failed to update cart");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-fit hover:shadow-lg transition-all duration-300 border-border hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg leading-tight text-text-dark">{pkg.name}</CardTitle>
              {pkg.isPopular && (
                <Badge className="bg-primary text-primary-foreground">
                  <Star className="h-3 w-3 mr-1" />
                  Popular
                </Badge>
              )}
            </div>
            <CardDescription className="text-sm text-text-medium line-clamp-2">
              {pkg.description}
            </CardDescription>
          </div>
          {pkg.discount_percentage && (
            <Badge variant="destructive" className="ml-2 bg-green-500 hover:bg-green-600">
              {pkg.discount_percentage}% OFF
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-sm text-text-medium">
          <span className="font-medium">{pkg.test_count} tests</span> included
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              {pkg.original_price && pkg.original_price > pkg.price && (
                <span className="text-sm text-text-light line-through">
                  ₹{pkg.original_price.toLocaleString()}
                </span>
              )}
              <div className="text-2xl font-bold text-primary">
                ₹{pkg.price.toLocaleString()}
              </div>
            </div>

            {itemInCart ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateQuantity(currentQuantityInCart - 1)}
                  disabled={currentQuantityInCart <= 1 || isLoading}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="min-w-[2rem] text-center font-medium">
                  {currentQuantityInCart}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateQuantity(currentQuantityInCart + 1)}
                  disabled={currentQuantityInCart >= 10 || isLoading}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Select value={selectedQuantity.toString()} onValueChange={(value) => setSelectedQuantity(parseInt(value))}>
                  <SelectTrigger className="w-16 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleAddToCart}
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full h-8 text-xs text-text-medium hover:text-primary"
          >
            {isExpanded ? (
              <>Hide Tests <ChevronUp className="h-3 w-3 ml-1" /></>
            ) : (
              <>View Tests <ChevronDown className="h-3 w-3 ml-1" /></>
            )}
          </Button>

          {isExpanded && (
            <div className="space-y-2 pt-2 border-t">
              {pkg.tests.slice(0, 5).map((test, index) => (
                <div key={index} className="text-xs">
                  <div className="font-medium text-text-dark">{test.name}</div>
                  <div className="text-text-light">{test.description}</div>
                </div>
              ))}
              {pkg.tests.length > 5 && (
                <div className="text-xs text-text-light">
                  +{pkg.tests.length - 5} more tests
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CartSummary() {
  const { items, totalItems, total, totalSavings, removeFromCart } = useCart();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleRemoveItem = async (itemId: string) => {
    setIsLoading(itemId);
    try {
      removeFromCart(itemId);
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-text-dark">Cart Summary</h3>
        <Badge variant="secondary">{totalItems} items</Badge>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-text-medium">
          <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-text-light" />
          <p>Your cart is empty</p>
          <p className="text-sm">Add some packages to get started</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {items.map((item) => (
              <div key={item.package.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{item.package.name}</div>
                  <div className="text-xs text-text-medium">
                    {item.package.test_count} tests • Qty: {item.quantity}
                  </div>
                  <div className="text-sm font-semibold text-primary">
                    ₹{(item.package.price * item.quantity).toLocaleString()}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveItem(item.package.id)}
                  disabled={isLoading === item.package.id}
                  className="h-8 w-8 p-0 ml-2"
                >
                  {isLoading === item.package.id ? (
                    <div className="h-3 w-3 animate-spin rounded-full border border-text-medium border-t-transparent" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                </Button>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-2">
            {totalSavings > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>You Save:</span>
                <span>₹{totalSavings.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="font-semibold text-text-dark">Total:</span>
              <span className="text-xl font-bold text-primary">
                ₹{total.toLocaleString()}
              </span>
            </div>
          </div>

          <Button className="w-full bg-primary hover:bg-primary/90" asChild>
            <a href="/cart">Proceed to Checkout</a>
          </Button>
        </>
      )}
    </div>
  );
}

export default function BloodTestPackagesPage() {
  const [packages, setPackages] = useState<BloodTestPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const { totalItems } = useCart();

  // Fetch packages from API
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build query parameters
        const params = new URLSearchParams({
          limit: '50',
          offset: '0',
          is_active: 'true' // Only fetch active packages for public view
        });

        if (searchTerm.trim()) {
          params.append('search', searchTerm.trim());
        }

        const response = await fetch(`/api/packages?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch packages');
        }

        const apiPackages = await response.json();
        
        // Transform API data to component format
        const transformedPackages = apiPackages.map(transformApiPackage);
        setPackages(transformedPackages);
        
      } catch (err: any) {
        console.error('Error fetching packages:', err);
        setError(err.message || "Failed to load packages");
        
        // Fallback to empty array to prevent app crash
        setPackages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [searchTerm]);

  const filteredAndSortedPackages = useMemo(() => {
    let filtered = packages.filter(pkg => {
      const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pkg.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || 
                            (selectedCategory === "popular" && pkg.isPopular) ||
                            pkg.category === selectedCategory;
      
      return matchesSearch && matchesCategory && pkg.isActive;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "tests":
          return b.test_count - a.test_count;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [packages, searchTerm, selectedCategory, sortBy]);

  if (error) {
    return (
      <main className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-red-500 text-lg font-medium">{error}</div>
            <p className="text-gray-600 mt-2">Please try again later or contact support if the problem persists.</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-primary hover:bg-primary/90"
            >
              Try Again
            </Button>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text-dark mb-4">Blood Test Packages</h1>
          <p className="text-lg text-text-medium max-w-2xl mx-auto">
            Choose from our comprehensive range of blood test packages designed for complete health monitoring. 
            Get accurate results with convenient home collection services.
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-light" />
              <Input
                placeholder="Search packages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(option => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={selectedCategory === category.id ? "bg-primary hover:bg-primary/90" : ""}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <PackageCardSkeleton key={index} />
                ))}
              </div>
            ) : filteredAndSortedPackages.length === 0 ? (
              <div className="text-center py-12">
                <Filter className="h-16 w-16 mx-auto mb-4 text-text-light" />
                <h3 className="text-xl font-semibold text-text-dark mb-2">No packages found</h3>
                <p className="text-text-medium">Try adjusting your search or filter criteria</p>
                {packages.length === 0 && !loading && (
                  <p className="text-text-medium mt-2">
                    No active packages are currently available. Please check back later.
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedPackages.map(pkg => (
                  <PackageCard key={pkg.id} package={pkg} />
                ))}
              </div>
            )}
          </div>

          {/* Desktop Cart Summary */}
          <div className="hidden lg:block w-80 sticky top-4 h-fit">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Your Cart</span>
                  <ShoppingCart className="h-5 w-5" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CartSummary />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mobile Cart Button */}
        <div className="lg:hidden fixed bottom-4 right-4 z-50">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="lg" className="rounded-full shadow-lg bg-primary hover:bg-primary/90">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Cart ({totalItems})
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Your Cart</SheetTitle>
                <SheetDescription>
                  Review your selected packages before checkout
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <CartSummary />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <Footer />
    </main>
  );
}