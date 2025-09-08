"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Search, Plus, Filter, MoreHorizontal, Eye, Edit, Trash2, ToggleLeft, ToggleRight, Star, Users, Clock, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  designation: string | null;
  company: string | null;
  content: string;
  rating: number;
  imageUrl: string | null;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
  averageRating: number;
}

export const TestimonialsManagement = () => {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  
  // Stats
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    inactive: 0,
    averageRating: 0
  });
  
  // Search and filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  
  // Bulk actions
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Expanded content state
  const [expandedContent, setExpandedContent] = useState<number[]>([]);

  // Authentication check
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  // Fetch testimonials
  const fetchTestimonials = async () => {
    if (!session?.user) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem("bearer_token");
      
      const params = new URLSearchParams({
        limit: itemsPerPage.toString(),
        offset: ((currentPage - 1) * itemsPerPage).toString(),
        sort: sortBy,
        order: sortOrder,
      });
      
      if (search.trim()) params.append("search", search.trim());
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (ratingFilter !== "all") params.append("rating", ratingFilter);
      
      const response = await fetch(`/api/admin/testimonials?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.status === 401) {
        toast.error("Session expired. Please login again.");
        router.push("/login");
        return;
      }
      
      if (!response.ok) {
        throw new Error("Failed to fetch testimonials");
      }
      
      const data = await response.json();
      setTestimonials(data);
      
      // Calculate stats
      const total = data.length;
      const active = data.filter((t: Testimonial) => t.status === 'active').length;
      const inactive = total - active;
      const averageRating = total > 0 
        ? data.reduce((sum: number, t: Testimonial) => sum + t.rating, 0) / total 
        : 0;
      
      setStats({ total, active, inactive, averageRating });
      
      // Calculate total pages (rough estimate)
      setTotalPages(Math.ceil(total / itemsPerPage));
      
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      toast.error("Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, [currentPage, search, statusFilter, ratingFilter, sortBy, sortOrder, session]);

  // Toggle status
  const toggleStatus = async (testimonial: Testimonial) => {
    const token = localStorage.getItem("bearer_token");
    const newStatus = testimonial.status === 'active' ? 'inactive' : 'active';
    
    try {
      setActionLoading(testimonial.id);
      
      const response = await fetch(`/api/admin/testimonials?id=${testimonial.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.status === 401) {
        toast.error("Session expired. Please login again.");
        router.push("/login");
        return;
      }
      
      if (!response.ok) {
        throw new Error("Failed to update status");
      }
      
      setTestimonials(prev => 
        prev.map(t => t.id === testimonial.id ? { ...t, status: newStatus } : t)
      );
      
      toast.success(`Testimonial ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  // Delete testimonial
  const deleteTestimonial = async (id: number) => {
    const token = localStorage.getItem("bearer_token");
    
    try {
      setActionLoading(id);
      
      const response = await fetch(`/api/admin/testimonials?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.status === 401) {
        toast.error("Session expired. Please login again.");
        router.push("/login");
        return;
      }
      
      if (!response.ok) {
        throw new Error("Failed to delete testimonial");
      }
      
      setTestimonials(prev => prev.filter(t => t.id !== id));
      setSelectedItems(prev => prev.filter(itemId => itemId !== id));
      toast.success("Testimonial deleted successfully");
      
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      toast.error("Failed to delete testimonial");
    } finally {
      setActionLoading(null);
    }
  };

  // Bulk actions
  const handleBulkAction = async (action: 'activate' | 'deactivate') => {
    if (selectedItems.length === 0) return;
    
    const token = localStorage.getItem("bearer_token");
    const status = action === 'activate' ? 'active' : 'inactive';
    
    try {
      setBulkActionLoading(true);
      
      const promises = selectedItems.map(id =>
        fetch(`/api/admin/testimonials?id=${id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        })
      );
      
      const responses = await Promise.all(promises);
      const failedCount = responses.filter(r => !r.ok).length;
      
      if (failedCount > 0) {
        toast.error(`${failedCount} items failed to update`);
      } else {
        toast.success(`${selectedItems.length} testimonials ${action}d successfully`);
      }
      
      setSelectedItems([]);
      setShowBulkActions(false);
      fetchTestimonials();
      
    } catch (error) {
      console.error("Error in bulk action:", error);
      toast.error("Bulk action failed");
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Handle item selection
  const handleItemSelect = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, id]);
    } else {
      setSelectedItems(prev => prev.filter(itemId => itemId !== id));
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(testimonials.map(t => t.id));
    } else {
      setSelectedItems([]);
    }
  };

  // Toggle content expansion
  const toggleContentExpansion = (id: number) => {
    setExpandedContent(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  // Render star rating
  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">({rating})</span>
      </div>
    );
  };

  // Render loading skeletons
  const renderLoadingSkeletons = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <Skeleton className="h-4 w-4 rounded" />
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-16 w-full" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Show bulk actions when items are selected
  useEffect(() => {
    setShowBulkActions(selectedItems.length > 0);
  }, [selectedItems]);

  if (isPending || loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-8">
          {/* Header skeleton */}
          <div className="flex justify-between items-center">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
          
          {/* Stats skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Filters skeleton */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Content skeletons */}
          {renderLoadingSkeletons()}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Testimonials Management</h1>
            <p className="text-muted-foreground">
              Manage patient testimonials and reviews for your diagnostic laboratory
            </p>
          </div>
          <Button 
            onClick={() => router.push("/admin/testimonials/new")}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Testimonial
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Testimonials</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
              <Clock className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.averageRating.toFixed(1)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Search & Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search testimonials..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [field, order] = value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt-desc">Newest First</SelectItem>
                  <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                  <SelectItem value="name-asc">Name A-Z</SelectItem>
                  <SelectItem value="name-desc">Name Z-A</SelectItem>
                  <SelectItem value="rating-desc">Highest Rating</SelectItem>
                  <SelectItem value="rating-asc">Lowest Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {showBulkActions && (
          <Card className="border-primary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                </span>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('activate')}
                    disabled={bulkActionLoading}
                  >
                    Activate Selected
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('deactivate')}
                    disabled={bulkActionLoading}
                  >
                    Deactivate Selected
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedItems([])}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Testimonials List */}
        <div className="space-y-4">
          {/* Select All */}
          <div className="flex items-center space-x-2 px-2">
            <Checkbox
              checked={selectedItems.length === testimonials.length && testimonials.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm text-muted-foreground">Select All</span>
          </div>

          {/* Testimonials */}
          {testimonials.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No testimonials found</h3>
                <p className="text-muted-foreground mb-4">
                  {search || statusFilter !== 'all' || ratingFilter !== 'all' 
                    ? "Try adjusting your search criteria or filters."
                    : "Get started by adding your first testimonial."
                  }
                </p>
                <Button onClick={() => router.push("/admin/testimonials/new")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Testimonial
                </Button>
              </CardContent>
            </Card>
          ) : (
            testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Checkbox
                      checked={selectedItems.includes(testimonial.id)}
                      onCheckedChange={(checked) => handleItemSelect(testimonial.id, checked as boolean)}
                    />
                    
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold">{testimonial.name}</h3>
                          {renderStarRating(testimonial.rating)}
                        </div>
                        <Badge variant={testimonial.status === 'active' ? 'default' : 'secondary'}>
                          {testimonial.status}
                        </Badge>
                      </div>

                      {/* Subtitle */}
                      {(testimonial.designation || testimonial.company) && (
                        <p className="text-sm text-muted-foreground">
                          {[testimonial.designation, testimonial.company].filter(Boolean).join(' at ')}
                        </p>
                      )}

                      {/* Content */}
                      <div className="text-sm">
                        {expandedContent.includes(testimonial.id) || testimonial.content.length <= 150 ? (
                          <p>{testimonial.content}</p>
                        ) : (
                          <div>
                            <p>{testimonial.content.substring(0, 150)}...</p>
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 h-auto text-primary"
                              onClick={() => toggleContentExpansion(testimonial.id)}
                            >
                              Read more
                            </Button>
                          </div>
                        )}
                        
                        {expandedContent.includes(testimonial.id) && testimonial.content.length > 150 && (
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto text-primary"
                            onClick={() => toggleContentExpansion(testimonial.id)}
                          >
                            Show less
                          </Button>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-xs text-muted-foreground">
                          Created {new Date(testimonial.createdAt).toLocaleDateString()}
                        </span>
                        
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push(`/admin/testimonials/${testimonial.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleStatus(testimonial)}
                            disabled={actionLoading === testimonial.id}
                          >
                            {testimonial.status === 'active' ? (
                              <ToggleRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-gray-600" />
                            )}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={actionLoading === testimonial.id}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Testimonial</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this testimonial from {testimonial.name}? 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteTestimonial(testimonial.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, stats.total)} of {stats.total} testimonials
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const pageNumber = Math.max(1, currentPage - 2) + i;
                      if (pageNumber > totalPages) return null;
                      
                      return (
                        <Button
                          key={pageNumber}
                          variant={pageNumber === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNumber)}
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TestimonialsManagement;