"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Star, 
  StarOff, 
  RefreshCw,
  Eye,
  MoreHorizontal,
  Package,
  Calendar,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface PackageType {
  id: number;
  name: string;
  description: string | null;
  test_codes: string | null;
  test_count: number;
  price: number;
  original_price: number | null;
  discount_percentage: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function PackagesManagementPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [selectedPackages, setSelectedPackages] = useState<number[]>([]);

  // Fetch packages with search and filter
  const fetchPackages = useCallback(async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      if (!token) {
        toast.error('Authentication required');
        router.push('/login');
        return;
      }

      const params = new URLSearchParams({
        limit: '50',
        offset: '0'
      });
      
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      
      if (filterActive !== 'all') {
        params.append('is_active', filterActive);
      }

      const response = await fetch(`/api/admin/packages?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch packages');
      }

      const data = await response.json();
      setPackages(data);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast.error('Failed to load packages');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, filterActive, router]);

  // Initial load
  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!loading) {
        fetchPackages();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, fetchPackages, loading]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchPackages();
  };

  // Toggle active status
  const toggleActive = async (packageId: number, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('bearer_token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`/api/admin/packages/${packageId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          is_active: !currentStatus
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update package');
      }

      setPackages(prev => prev.map(pkg => 
        pkg.id === packageId 
          ? { ...pkg, is_active: !currentStatus, updated_at: new Date().toISOString() }
          : pkg
      ));

      toast.success(`Package ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error toggling active status:', error);
      toast.error('Failed to update package');
    }
  };

  // Delete package
  const deletePackage = async (packageId: number) => {
    try {
      const token = localStorage.getItem('bearer_token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`/api/admin/packages/${packageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete package');
      }

      setPackages(prev => prev.filter(pkg => pkg.id !== packageId));
      setSelectedPackages(prev => prev.filter(id => id !== packageId));
      toast.success('Package deleted successfully');
    } catch (error) {
      console.error('Error deleting package:', error);
      toast.error('Failed to delete package');
    }
  };

  // Bulk delete selected packages
  const bulkDeletePackages = async () => {
    if (selectedPackages.length === 0) return;

    try {
      const token = localStorage.getItem('bearer_token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const deletePromises = selectedPackages.map(id =>
        fetch(`/api/admin/packages/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      );

      await Promise.all(deletePromises);
      
      setPackages(prev => prev.filter(pkg => !selectedPackages.includes(pkg.id)));
      setSelectedPackages([]);
      toast.success(`${selectedPackages.length} packages deleted successfully`);
    } catch (error) {
      console.error('Error deleting packages:', error);
      toast.error('Failed to delete packages');
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPackages(packages.map(pkg => pkg.id));
    } else {
      setSelectedPackages([]);
    }
  };

  // Handle individual selection
  const handleSelectPackage = (packageId: number, checked: boolean) => {
    if (checked) {
      setSelectedPackages(prev => [...prev, packageId]);
    } else {
      setSelectedPackages(prev => prev.filter(id => id !== packageId));
    }
  };

  // Format price with discount
  const formatPrice = (price: number, originalPrice: number | null, discountPercentage: number | null) => {
    if (discountPercentage && originalPrice) {
      const discountedPrice = originalPrice * (1 - discountPercentage / 100);
      return (
        <div className="flex flex-col">
          <span className="text-lg font-semibold text-green-600">₹{Math.round(discountedPrice).toLocaleString()}</span>
          <span className="text-sm text-muted-foreground line-through">₹{originalPrice.toLocaleString()}</span>
        </div>
      );
    }
    return <span className="text-lg font-semibold">₹{price.toLocaleString()}</span>;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Loading skeleton
  const PackageRowSkeleton = () => (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-4" /></TableCell>
      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
      <TableCell><Skeleton className="h-4 w-64" /></TableCell>
      <TableCell><Skeleton className="h-8 w-20" /></TableCell>
      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell><Skeleton className="h-8 w-32" /></TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Test Packages Management</h1>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button 
            onClick={() => router.push('/admin/packages/new')}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Package
          </Button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search packages by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterActive} onValueChange={setFilterActive}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Packages</SelectItem>
                <SelectItem value="true">Active Only</SelectItem>
                <SelectItem value="false">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedPackages.length > 0 && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedPackages.length} package{selectedPackages.length !== 1 ? 's' : ''} selected
                </span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Selected
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Bulk Delete</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete {selectedPackages.length} selected package{selectedPackages.length !== 1 ? 's' : ''}. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={bulkDeletePackages} className="bg-destructive hover:bg-destructive/90">
                        Delete All
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Packages</p>
                <p className="text-2xl font-bold">{packages.length}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{packages.filter(pkg => pkg.is_active).length}</p>
              </div>
              <Star className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">With Discounts</p>
                <p className="text-2xl font-bold">{packages.filter(pkg => pkg.discount_percentage).length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Price</p>
                <p className="text-2xl font-bold">
                  ₹{packages.length > 0 ? Math.round(packages.reduce((sum, pkg) => sum + pkg.price, 0) / packages.length).toLocaleString() : '0'}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Packages Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Packages ({packages.length})</span>
            {searchQuery && (
              <Badge variant="secondary">
                Search: "{searchQuery}"
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Select</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <PackageRowSkeleton key={index} />
                ))}
              </TableBody>
            </Table>
          ) : packages.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No packages found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || filterActive !== 'all'
                  ? 'No packages match your current filters.'
                  : 'Get started by creating your first test package.'
                }
              </p>
              <Button onClick={() => router.push('/admin/packages/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Package
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedPackages.length === packages.length}
                      onCheckedChange={handleSelectAll}
                      // @ts-ignore - checkbox component issue with indeterminate
                      indeterminate={selectedPackages.length > 0 && selectedPackages.length < packages.length}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.map((pkg) => (
                  <TableRow key={pkg.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedPackages.includes(pkg.id)}
                        onCheckedChange={(checked) => handleSelectPackage(pkg.id, !!checked)}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{pkg.name}</span>
                        {pkg.test_codes && (
                          <span className="text-xs text-muted-foreground mt-1">
                            {pkg.test_count} tests: {pkg.test_codes.length > 50 
                              ? `${pkg.test_codes.substring(0, 50)}...` 
                              : pkg.test_codes
                            }
                          </span>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm line-clamp-2">
                          {pkg.description || 'No description provided'}
                        </p>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {formatPrice(pkg.price, pkg.original_price, pkg.discount_percentage)}
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={pkg.is_active ? 'default' : 'secondary'} className="w-fit">
                          {pkg.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {pkg.discount_percentage && (
                          <Badge variant="outline" className="w-fit text-xs">
                            {pkg.discount_percentage}% OFF
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(pkg.created_at)}
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/admin/packages/${pkg.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/admin/packages/${pkg.id}/edit`)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Package
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleActive(pkg.id, pkg.is_active)}>
                            {pkg.is_active ? (
                              <>
                                <StarOff className="h-4 w-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Star className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Package
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{pkg.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deletePackage(pkg.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}