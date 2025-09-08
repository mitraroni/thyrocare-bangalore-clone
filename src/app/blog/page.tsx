"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Calendar, User, ArrowRight, Filter, ChevronLeft, ChevronRight, Share2, Mail, Facebook, Twitter, Linkedin, BookOpen, Clock, Tag } from 'lucide-react';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featuredImageUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  tags: string[];
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string | null;
    image: string | null;
  };
}

interface BlogResponse {
  blogs: BlogPost[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

const POSTS_PER_PAGE = 9;

export default function BlogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.get('category') || '');
  const [selectedTag, setSelectedTag] = useState(searchParams?.get('tag') || '');
  const [sortBy, setSortBy] = useState(searchParams?.get('sort') || 'publishedAt');
  const [sortOrder, setSortOrder] = useState(searchParams?.get('order') || 'desc');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams?.get('page') || '1'));
  const [totalPosts, setTotalPosts] = useState(0);
  const [showNewsletter, setShowNewsletter] = useState(false);

  const offset = (currentPage - 1) * POSTS_PER_PAGE;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  useEffect(() => {
    fetchBlogs();
  }, [searchQuery, selectedCategory, selectedTag, sortBy, sortOrder, offset]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!showNewsletter) {
        setShowNewsletter(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [showNewsletter]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: POSTS_PER_PAGE.toString(),
        offset: offset.toString(),
        sort: sortBy,
        order: sortOrder,
      });

      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedTag) params.append('tag', selectedTag);

      const response = await fetch(`/api/blogs?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch blogs');
      }

      const data: BlogResponse = await response.json();
      setBlogs(data.blogs || []);
      setTotalPosts(data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setBlogs([]);
      setTotalPosts(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    updateURL();
  };

  const updateURL = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedTag) params.set('tag', selectedTag);
    if (sortBy !== 'publishedAt') params.set('sort', sortBy);
    if (sortOrder !== 'desc') params.set('order', sortOrder);
    if (currentPage !== 1) params.set('page', currentPage.toString());

    const newURL = params.toString() ? `?${params.toString()}` : '';
    router.push(`/blog${newURL}`, { scroll: false });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedTag('');
    setSortBy('publishedAt');
    setSortOrder('desc');
    setCurrentPage(1);
    router.push('/blog');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const sharePost = (post: BlogPost, platform: string) => {
    const url = `${window.location.origin}/blog/${post.slug}`;
    const title = post.title;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this article: ${url}`)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const featuredPosts = useMemo(() => {
    return blogs.filter(post => post.featuredImageUrl).slice(0, 3);
  }, [blogs]);

  const relatedPosts = useMemo(() => {
    return blogs.slice(0, 4);
  }, [blogs]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[var(--color-hero-background)] to-[var(--color-hero-pattern)] py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Healthcare Insights
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-text-dark)] mb-6">
              Medical Blog & Health Resources
            </h1>
            <p className="text-xl text-[var(--color-text-medium)] mb-8 leading-relaxed">
              Stay informed with the latest health insights, diagnostic breakthroughs, and medical expertise 
              from our team of healthcare professionals and specialists.
            </p>
            
            {/* Hero Search */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search health topics, conditions, or treatments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-border focus:border-primary"
                />
              </div>
              <Button type="submit" className="bg-primary hover:bg-[var(--color-secondary-red)] px-6">
                Search
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
          <button 
            onClick={() => router.push('/')}
            className="hover:text-primary transition-colors"
          >
            Home
          </button>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Blog</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Filter & Sort</h3>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      <SelectItem value="health-tips">Health Tips</SelectItem>
                      <SelectItem value="lab-services">Lab Services</SelectItem>
                      <SelectItem value="medical-news">Medical News</SelectItem>
                      <SelectItem value="diagnostics">Diagnostics</SelectItem>
                      <SelectItem value="wellness">Wellness</SelectItem>
                      <SelectItem value="prevention">Prevention</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Tag</label>
                  <Select value={selectedTag} onValueChange={setSelectedTag}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Tags" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Tags</SelectItem>
                      <SelectItem value="blood-test">Blood Test</SelectItem>
                      <SelectItem value="diabetes">Diabetes</SelectItem>
                      <SelectItem value="cardiology">Cardiology</SelectItem>
                      <SelectItem value="thyroid-function">Thyroid Function</SelectItem>
                      <SelectItem value="preventive-care">Preventive Care</SelectItem>
                      <SelectItem value="health-screening">Health Screening</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                    const [field, order] = value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="publishedAt-desc">Latest First</SelectItem>
                      <SelectItem value="publishedAt-asc">Oldest First</SelectItem>
                      <SelectItem value="title-asc">Title A-Z</SelectItem>
                      <SelectItem value="title-desc">Title Z-A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>

            {/* Newsletter Signup */}
            {showNewsletter && (
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Stay Updated</h3>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get the latest health insights and medical updates delivered to your inbox.
                  </p>
                  <div className="space-y-3">
                    <Input placeholder="Enter your email" type="email" />
                    <Button className="w-full bg-primary hover:bg-[var(--color-secondary-red)]">
                      Subscribe
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Popular Posts</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {relatedPosts.map((post) => (
                    <div key={post.id} className="space-y-2">
                      <button
                        onClick={() => router.push(`/blog/${post.slug}`)}
                        className="text-sm font-medium hover:text-primary transition-colors text-left"
                      >
                        {post.title}
                      </button>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(post.publishedAt)}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[var(--color-text-dark)]">
                  {searchQuery ? `Search Results for "${searchQuery}"` : 'Latest Articles'}
                </h2>
                <p className="text-muted-foreground">
                  {loading ? 'Loading...' : `${totalPosts} articles found`}
                </p>
              </div>
            </div>

            {/* Blog Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : blogs.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No articles found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search criteria or browse all articles.
                </p>
                <Button onClick={clearFilters} variant="outline">
                  View All Articles
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {blogs.map((post) => (
                    <Card key={post.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border hover:border-primary/20">
                      {/* Featured Image */}
                      <div className="relative h-48 overflow-hidden bg-muted">
                        {post.featuredImageUrl ? (
                          <img
                            src={post.featuredImageUrl}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                            <BookOpen className="h-12 w-12 text-primary/40" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <div className="relative">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white p-2 h-auto"
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => sharePost(post, 'facebook')}
                                  className="p-1 h-auto"
                                >
                                  <Facebook className="h-4 w-4 text-blue-600" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => sharePost(post, 'twitter')}
                                  className="p-1 h-auto"
                                >
                                  <Twitter className="h-4 w-4 text-blue-400" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => sharePost(post, 'linkedin')}
                                  className="p-1 h-auto"
                                >
                                  <Linkedin className="h-4 w-4 text-blue-700" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => sharePost(post, 'email')}
                                  className="p-1 h-auto"
                                >
                                  <Mail className="h-4 w-4 text-gray-600" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <Calendar className="h-3 w-3" />
                          {formatDate(post.publishedAt)}
                          <span>•</span>
                          <Clock className="h-3 w-3" />
                          <span>5 min read</span>
                        </div>
                        
                        <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors cursor-pointer line-clamp-2">
                          <button onClick={() => router.push(`/blog/${post.slug}`)}>
                            {post.title}
                          </button>
                        </h3>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{post.author.name}</span>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                          {post.excerpt}
                        </p>

                        {/* Tags */}
                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {post.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                <Tag className="h-2 w-2 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                            {post.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{post.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>

                      <CardFooter className="pt-0">
                        <Button 
                          variant="ghost" 
                          className="w-full group-hover:bg-primary group-hover:text-white transition-colors p-0 h-auto py-2"
                          onClick={() => router.push(`/blog/${post.slug}`)}
                        >
                          Read More
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCurrentPage(Math.max(1, currentPage - 1));
                        updateURL();
                      }}
                      disabled={currentPage === 1}
                      className="gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setCurrentPage(pageNum);
                              updateURL();
                            }}
                            className={pageNum === currentPage ? "bg-primary" : ""}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setCurrentPage(Math.min(totalPages, currentPage + 1));
                        updateURL();
                      }}
                      disabled={currentPage === totalPages}
                      className="gap-2"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}