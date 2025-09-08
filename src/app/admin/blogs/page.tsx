"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  FileText, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Plus, 
  MoreHorizontal,
  Calendar,
  User,
  TrendingUp,
  FileCheck,
  FileClock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle
} from 'lucide-react';

interface Blog {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  featuredImageUrl: string | null;
  authorId: string;
  status: 'draft' | 'published';
  metaTitle: string | null;
  metaDescription: string | null;
  tags: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BlogStats {
  total: number;
  published: number;
  drafts: number;
}

export default function BlogManagementPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  // State management
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [stats, setStats] = useState<BlogStats>({ total: 0, published: 0, drafts: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Filters and search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [totalBlogs, setTotalBlogs] = useState(0);
  
  // Bulk actions
  const [selectedBlogs, setSelectedBlogs] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Delete confirmation
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; blogId: number | null; title: string }>({
    open: false,
    blogId: null,
    title: ''
  });

  // Authentication check
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login');
    }
  }, [session, isPending, router]);

  // Fetch blogs
  const fetchBlogs = useCallback(async () => {
    if (!session?.user) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('bearer_token');
      if (!token) {
        toast.error('Authentication token not found');
        router.push('/login');
        return;
      }

      const offset = (currentPage - 1) * limit;
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        sort: sortBy,
        order: sortOrder
      });

      if (search.trim()) {
        params.append('search', search.trim());
      }

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/admin/blogs?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          router.push('/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setBlogs(data);

      // Calculate stats from current data
      const published = data.filter((blog: Blog) => blog.status === 'published').length;
      const drafts = data.filter((blog: Blog) => blog.status === 'draft').length;
      setStats({
        total: data.length,
        published,
        drafts
      });

      setTotalBlogs(data.length);
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  }, [session, currentPage, limit, search, statusFilter, sortBy, sortOrder, router]);

  // Load blogs on mount and dependency changes
  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  // Handle search
  const handleSearch = useCallback(() => {
    setCurrentPage(1);
    fetchBlogs();
  }, [fetchBlogs]);

  // Handle status update (publish/unpublish)
  const handleStatusUpdate = async (blogId: number, newStatus: 'published' | 'draft') => {
    if (!session?.user) return;
    
    setActionLoading(`status-${blogId}`);
    try {
      const token = localStorage.getItem('bearer_token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      const response = await fetch(`/api/admin/blogs?id=${blogId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          router.push('/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.success(`Blog ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`);
      await fetchBlogs();
    } catch (error) {
      console.error('Failed to update blog status:', error);
      toast.error('Failed to update blog status');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle delete blog
  const handleDeleteBlog = async (blogId: number) => {
    if (!session?.user) return;
    
    setActionLoading(`delete-${blogId}`);
    try {
      const token = localStorage.getItem('bearer_token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      const response = await fetch(`/api/admin/blogs?id=${blogId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          router.push('/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.success('Blog deleted successfully');
      setDeleteDialog({ open: false, blogId: null, title: '' });
      await fetchBlogs();
    } catch (error) {
      console.error('Failed to delete blog:', error);
      toast.error('Failed to delete blog');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle bulk actions
  const handleBulkStatusUpdate = async (status: 'published' | 'draft') => {
    if (selectedBlogs.length === 0) return;
    
    setActionLoading('bulk-status');
    const promises = selectedBlogs.map(id => handleStatusUpdate(id, status));
    
    try {
      await Promise.all(promises);
      setSelectedBlogs([]);
      setShowBulkActions(false);
      toast.success(`${selectedBlogs.length} blogs ${status === 'published' ? 'published' : 'unpublished'} successfully`);
    } catch (error) {
      toast.error('Some operations failed');
    } finally {
      setActionLoading(null);
    }
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Loading skeleton
  const BlogSkeleton = () => (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex items-center justify-between mt-4">
        <Skeleton className="h-4 w-32" />
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );

  if (isPending || !session?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-dark">Blog Management</h1>
          <p className="text-text-medium mt-2">Create, manage, and publish blog content</p>
        </div>
        <Button 
          onClick={() => router.push('/admin/blogs/new')}
          className="bg-primary hover:bg-secondary-red text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Blog
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Blogs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <FileCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <FileClock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.drafts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search blogs by title or content..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>

              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [field, order] = value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt-desc">Newest First</SelectItem>
                  <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                  <SelectItem value="title-asc">Title A-Z</SelectItem>
                  <SelectItem value="title-desc">Title Z-A</SelectItem>
                  <SelectItem value="publishedAt-desc">Recently Published</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleSearch} variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Apply
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedBlogs.length > 0 && (
        <Card className="bg-muted">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="font-medium">{selectedBlogs.length} blog(s) selected</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkStatusUpdate('published')}
                  disabled={actionLoading === 'bulk-status'}
                >
                  {actionLoading === 'bulk-status' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Publish All'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkStatusUpdate('draft')}
                  disabled={actionLoading === 'bulk-status'}
                >
                  {actionLoading === 'bulk-status' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Unpublish All'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedBlogs([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Blog List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Blog Posts</CardTitle>
          <CardDescription>
            {totalBlogs > 0 
              ? `Showing ${(currentPage - 1) * limit + 1}-${Math.min(currentPage * limit, totalBlogs)} of ${totalBlogs} blogs`
              : 'No blogs found'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <BlogSkeleton key={i} />
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-dark mb-2">No blogs found</h3>
              <p className="text-text-medium mb-4">
                {search || statusFilter !== 'all' 
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Get started by creating your first blog post.'
                }
              </p>
              <Button onClick={() => router.push('/admin/blogs/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Blog
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {blogs.map((blog) => (
                <div key={blog.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3 flex-1">
                      <Checkbox
                        checked={selectedBlogs.includes(blog.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedBlogs([...selectedBlogs, blog.id]);
                          } else {
                            setSelectedBlogs(selectedBlogs.filter(id => id !== blog.id));
                          }
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-text-dark mb-1 line-clamp-1">
                          {blog.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-text-medium">
                          <span className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            Author ID: {blog.authorId.slice(0, 8)}...
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Created: {formatDate(blog.createdAt)}
                          </span>
                          {blog.publishedAt && (
                            <span className="flex items-center">
                              <TrendingUp className="h-4 w-4 mr-1" />
                              Published: {formatDate(blog.publishedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge variant={blog.status === 'published' ? 'default' : 'secondary'}>
                      {blog.status}
                    </Badge>
                  </div>

                  {blog.excerpt && (
                    <p className="text-text-medium text-sm mb-4 line-clamp-2">
                      {blog.excerpt}
                    </p>
                  )}

                  {blog.tags && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {blog.tags.split(',').slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag.trim()}
                        </Badge>
                      ))}
                      {blog.tags.split(',').length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{blog.tags.split(',').length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-text-medium">
                      Last updated: {formatDate(blog.updatedAt)}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`/blog/${blog.slug}`, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/admin/blogs/edit/${blog.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(
                          blog.id, 
                          blog.status === 'published' ? 'draft' : 'published'
                        )}
                        disabled={actionLoading === `status-${blog.id}`}
                      >
                        {actionLoading === `status-${blog.id}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          blog.status === 'published' ? 'Unpublish' : 'Publish'
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteDialog({ 
                          open: true, 
                          blogId: blog.id, 
                          title: blog.title 
                        })}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalBlogs > limit && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-text-medium">
                Page {currentPage} of {Math.ceil(totalBlogs / limit)}
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
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage >= Math.ceil(totalBlogs / limit)}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => 
        setDeleteDialog({ open, blogId: null, title: '' })
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Delete
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteDialog.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialog({ open: false, blogId: null, title: '' })}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => deleteDialog.blogId && handleDeleteBlog(deleteDialog.blogId)}
              disabled={actionLoading?.startsWith('delete-')}
            >
              {actionLoading?.startsWith('delete-') ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete Blog'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}