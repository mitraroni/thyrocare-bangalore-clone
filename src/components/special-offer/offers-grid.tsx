"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/cart-context";

interface ApiPackage {
  id: number | string;
  name: string;
  price: number;
  original_price?: number;
  test_count: number;
  discount_percentage?: number;
  is_active?: boolean;
}

interface CartPackage {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  test_count: number;
  discount_percentage?: number;
}

interface OffersGridProps {}

const PackageCard = ({ pkg }: { pkg: CartPackage }) => {
  const { addToCart, isInCart, getItemQuantity, updateQuantity } = useCart();
  const inCart = isInCart(pkg.id);
  const quantity = getItemQuantity(pkg.id);

  const handleAddToCart = () => {
    addToCart(pkg);
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity > 0) {
      updateQuantity(pkg.id, newQuantity);
    }
  };

  return (
    <Card className="group hover:shadow-lg hover:border-primary/20 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-semibold text-text-dark line-clamp-2">
            {pkg.name}
          </CardTitle>
          {pkg.discount_percentage && pkg.discount_percentage > 0 && (
            <Badge 
              variant="secondary" 
              className="bg-primary text-primary-foreground font-medium"
            >
              {pkg.discount_percentage}% OFF
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-2">
          <p className="text-sm text-text-medium">
            {pkg.test_count} medical test{pkg.test_count !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-text-dark">
              ₹{pkg.price.toLocaleString()}
            </span>
            {pkg.original_price && pkg.original_price > pkg.price && (
              <span className="text-sm text-text-light line-through">
                ₹{pkg.original_price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        {!inCart ? (
          <Button
            onClick={handleAddToCart}
            className="w-full bg-primary hover:bg-primary/90"
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        ) : (
          <div className="w-full flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleQuantityChange(-1)}
              aria-label="Decrease quantity"
              className="h-8 w-8"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="font-medium text-sm">Qty: {quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleQuantityChange(1)}
              aria-label="Increase quantity"
              className="h-8 w-8"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export const OffersGrid = ({}: OffersGridProps) => {
  const [packages, setPackages] = useState<CartPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        is_active: 'true',
        limit: '50',
        offset: '0'
      });
      
      const response = await fetch(`/api/packages?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch packages');
      }
      
      const data = await response.json();
      // Support both array and { packages: [...] } shapes
      const apiList: ApiPackage[] = Array.isArray(data) ? data : (data?.packages ?? []);
      
      // Filter and transform packages (expecting snake_case fields as per public API)
      const discountedPackages = apiList
        .filter((pkg) => 
          (pkg as any).discount_percentage && 
          Number((pkg as any).discount_percentage) > 0 && 
          (pkg as any).is_active !== false
        )
        .map((pkg): CartPackage => ({
          id: String(pkg.id),
          name: pkg.name || 'Untitled Package',
          price: Number((pkg as any).price) || 0,
          original_price: (pkg as any).original_price ? Number((pkg as any).original_price) : undefined,
          test_count: Number((pkg as any).test_count) || 0,
          discount_percentage: (pkg as any).discount_percentage ? Number((pkg as any).discount_percentage) : 0
        }))
        .sort((a, b) => {
          // Sort by highest discount percentage first, then by price ascending
          if ((b.discount_percentage || 0) !== (a.discount_percentage || 0)) {
            return (b.discount_percentage || 0) - (a.discount_percentage || 0);
          }
          return (a.price || 0) - (b.price || 0);
        });
      
      setPackages(discountedPackages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-5 w-1/3" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-text-medium mb-4">Error loading special offers</p>
        <Button onClick={fetchPackages} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-text-medium">
          No discounted packages available at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {packages.map((pkg) => (
        <PackageCard key={pkg.id} pkg={pkg} />
      ))}
    </div>
  );
};