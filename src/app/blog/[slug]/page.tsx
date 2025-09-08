"use client";

import { useState, useEffect, useCallback } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  User, 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Mail, 
  Print,
  Eye,
  ChevronRight,
  Newsletter,
  MessageCircle,
  Tag
} from 'lucide-react';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  tags?: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  categories: Array<{
    id: number;
    name: string;
    slug: string;
    description?: string;
  }>;
  associatedTags: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
}

interface RelatedBlog {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featuredImageUrl?: string;
  publishedAt: string;
  author: {
    name: string;
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<RelatedBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [tableOfContents, setTableOfContents] = useState<Array<{id: string; title: string; level: number}>>([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  // Calculate reading time
  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  // Handle scroll for reading progress
  const handleScroll = useCallback(() => {
    const article = document.getElementById('article-content');
    if (article) {
      const scrollTop = window.scrollY;
      const docHeight = article.offsetHeight;
      const winHeight = window.innerHeight;
      const scrollPercent = scrollTop / (docHeight - winHeight);
      const scrollPercentRounded = Math.round(scrollPercent * 100);
      setReadingProgress(Math.min(100, Math.max(0, scrollPercentRounded)));
    }
  }, []);

  // Generate table of contents
  const generateTableOfContents = (content: string) => {
    const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi;
    const headings = [];
    let match;
    
    while ((match = headingRegex.exec(content)) !== null) {
      const level = parseInt(match[1]);
      const title = match[2].replace(/<[^>]*>/g, '').trim();
      const id = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      headings.push({ id, title, level });
    }
    
    setTableOfContents(headings);
  };

  // Fetch blog post
  const fetchBlogPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/blogs/${params.slug}`);
      
      if (response.status === 404) {
        notFound();
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch blog post');
      }
      
      const data = await response.json();
      setBlog(data);
      
      if (data.content) {
        generateTableOfContents(data.content);
      }
      
      // Fetch related blogs
      fetchRelatedBlogs(data.categories[0]?.slug);
      
    } catch (err) {
      setError('Failed to load blog post');
      console.error('Blog fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch related blogs
  const fetchRelatedBlogs = async (categorySlug?: string) => {
    try {
      const url = categorySlug 
        ? `/api/blogs?category=${categorySlug}&limit=3`
        : '/api/blogs?limit=3';
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setRelatedBlogs(data.blogs?.filter((b: RelatedBlog) => b.slug !== params.slug) || []);
      }
    } catch (err) {
      console.error('Related blogs fetch error:', err);
    }
  };

  // Social sharing functions
  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const shareOnTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(blog?.title || '');
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Check out this article: ${blog?.title}`);
    const body = encodeURIComponent(`I thought you might find this interesting: ${window.location.href}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handlePrint = () => {
    window.print();
  };

  // Newsletter subscription
  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    
    setNewsletterLoading(true);
    
    // Simulate newsletter subscription
    setTimeout(() => {
      toast.success('Successfully subscribed to newsletter!');
      setNewsletterEmail('');
      setNewsletterLoading(false);
    }, 1000);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    fetchBlogPost();
  }, [params.slug]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Reading progress bar */}
        <div className="fixed top-0 left-0 w-full h-1 bg-muted z-50">
          <div 
            className="h-full bg-primary transition-all duration-150"
            style={{ width: '0%' }}
          />
        </div>

        {/* Header skeleton */}
        <div className="border-b bg-white">
          <div className="container py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <div className="w-12 h-4 bg-muted rounded animate-pulse" />
              <ChevronRight className="w-4 h-4" />
              <div className="w-16 h-4 bg-muted rounded animate-pulse" />
              <ChevronRight className="w-4 h-4" />
              <div className="w-32 h-4 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Content skeleton */}
        <div className="container py-8">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4 mb-8">
              <div className="w-full h-8 bg-muted rounded animate-pulse" />
              <div className="w-3/4 h-8 bg-muted rounded animate-pulse" />
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="w-24 h-4 bg-muted rounded animate-pulse" />
                <div className="w-20 h-4 bg-muted rounded animate-pulse" />
                <div className="w-16 h-4 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div className="w-full h-80 bg-muted rounded-lg animate-pulse mb-8" />
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="w-full h-4 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Blog Post</h1>
          <p className="text-muted-foreground mb-6">{error || 'Blog post not found'}</p>
          <Button onClick={() => router.push('/blog')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  const readingTime = calculateReadingTime(blog.content);
  const blogTags = blog.tags ? blog.tags.split(',').map(tag => tag.trim()) : [];

  return (
    <>
      {/* SEO Meta Tags */}
      <head>
        <title>{blog.metaTitle || blog.title} | Thyrocare Medical Laboratory</title>
        <meta name="description" content={blog.metaDescription || blog.excerpt} />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.excerpt} />
        <meta property="og:image" content={blog.featuredImageUrl} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blog.title} />
        <meta name="twitter:description" content={blog.excerpt} />
        <meta name="twitter:image" content={blog.featuredImageUrl} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": blog.title,
            "description": blog.excerpt,
            "image": blog.featuredImageUrl,
            "author": {
              "@type": "Person",
              "name": blog.author.name
            },
            "publisher": {
              "@type": "Organization",
              "name": "Thyrocare Medical Laboratory"
            },
            "datePublished": blog.publishedAt,
            "dateModified": blog.updatedAt
          })}
        </script>
      </head>

      <div className="min-h-screen bg-background">
        {/* Reading progress bar */}
        <div className="fixed top-0 left-0 w-full h-1 bg-muted z-50">
          <div 
            className="h-full bg-primary transition-all duration-150"
            style={{ width: `${readingProgress}%` }}
          />
        </div>

        {/* Breadcrumb Navigation */}
        <div className="border-b bg-white">
          <div className="container py-4">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Link href="/" className="hover:text-primary">Home</Link>
              <ChevronRight className="w-4 h-4" />
              <Link href="/blog" className="hover:text-primary">Blog</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground">{blog.title}</span>
            </nav>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/blog')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Button>
          </div>
        </div>

        <div className="container py-8">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Table of Contents - Desktop Sidebar */}
            {tableOfContents.length > 0 && (
              <div className="hidden lg:block lg:col-span-3">
                <div className="sticky top-24">
                  <Card>
                    <CardHeader>
                      <h3 className="font-semibold">Table of Contents</h3>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {tableOfContents.map((heading, index) => (
                        <a
                          key={index}
                          href={`#${heading.id}`}
                          className={`block text-sm hover:text-primary transition-colors ${
                            heading.level > 2 ? 'ml-4 text-muted-foreground' : ''
                          }`}
                        >
                          {heading.title}
                        </a>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Main Content */}
            <main className={`${tableOfContents.length > 0 ? 'lg:col-span-6' : 'lg:col-span-8'} mx-auto max-w-4xl`}>
              <article>
                {/* Article Header */}
                <header className="mb-8">
                  <div className="space-y-4">
                    {/* Categories */}
                    {blog.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {blog.categories.map((category) => (
                          <Link
                            key={category.id}
                            href={`/blog?category=${category.slug}`}
                          >
                            <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground">
                              {category.name}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Title */}
                    <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                      {blog.title}
                    </h1>

                    {/* Excerpt */}
                    {blog.excerpt && (
                      <p className="text-xl text-muted-foreground leading-relaxed">
                        {blog.excerpt}
                      </p>
                    )}

                    {/* Meta Information */}
                    <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>By {blog.author.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <time dateTime={blog.publishedAt}>
                          {formatDate(blog.publishedAt)}
                        </time>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{readingTime} min read</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        <span>Medical Article</span>
                      </div>
                    </div>

                    {/* Social Sharing */}
                    <div className="flex items-center gap-2 pt-4 border-t">
                      <span className="text-sm font-medium">Share:</span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={shareOnFacebook}
                          className="gap-2"
                        >
                          <Facebook className="w-4 h-4" />
                          Facebook
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={shareOnTwitter}
                          className="gap-2"
                        >
                          <Twitter className="w-4 h-4" />
                          Twitter
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={shareOnLinkedIn}
                          className="gap-2"
                        >
                          <Linkedin className="w-4 h-4" />
                          LinkedIn
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={shareViaEmail}
                          className="gap-2"
                        >
                          <Mail className="w-4 h-4" />
                          Email
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePrint}
                          className="gap-2"
                        >
                          <Print className="w-4 h-4" />
                          Print
                        </Button>
                      </div>
                    </div>
                  </div>
                </header>

                {/* Featured Image */}
                {blog.featuredImageUrl && (
                  <div className="mb-8">
                    <div className="relative aspect-video rounded-lg overflow-hidden">
                      <Image
                        src={blog.featuredImageUrl}
                        alt={blog.title}
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                  </div>
                )}

                {/* Article Content */}
                <div 
                  id="article-content"
                  className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-primary prose-strong:text-foreground prose-li:text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />

                {/* Tags */}
                {(blogTags.length > 0 || blog.associatedTags.length > 0) && (
                  <div className="mt-8 pt-6 border-t">
                    <div className="flex items-start gap-3">
                      <Tag className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div className="flex flex-wrap gap-2">
                        {blog.associatedTags.map((tag) => (
                          <Link
                            key={tag.id}
                            href={`/blog?tag=${tag.slug}`}
                          >
                            <Badge variant="outline" className="hover:bg-muted">
                              {tag.name}
                            </Badge>
                          </Link>
                        ))}
                        {blogTags.map((tag, index) => (
                          <Badge key={index} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Author Bio */}
                <Card className="mt-8">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                        {blog.author.image ? (
                          <Image
                            src={blog.author.image}
                            alt={blog.author.name}
                            width={64}
                            height={64}
                            className="rounded-full"
                          />
                        ) : (
                          <User className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{blog.author.name}</h3>
                        <p className="text-muted-foreground mb-2">Medical Content Writer</p>
                        <p className="text-sm text-muted-foreground">
                          Expert in medical diagnostics and healthcare communications, dedicated to providing 
                          accurate and accessible health information to help patients make informed decisions 
                          about their healthcare.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </article>
            </main>

            {/* Sidebar */}
            <aside className={`${tableOfContents.length > 0 ? 'lg:col-span-3' : 'lg:col-span-4'} space-y-6`}>
              {/* Newsletter Signup */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Newsletter className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Stay Updated</h3>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get the latest health tips and medical insights delivered to your inbox.
                  </p>
                  <form onSubmit={handleNewsletterSubscribe} className="space-y-3">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      required
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={newsletterLoading}
                    >
                      {newsletterLoading ? 'Subscribing...' : 'Subscribe'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Related Articles */}
              {relatedBlogs.length > 0 && (
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold">Related Articles</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {relatedBlogs.map((relatedBlog) => (
                      <Link
                        key={relatedBlog.id}
                        href={`/blog/${relatedBlog.slug}`}
                        className="block group"
                      >
                        <article className="space-y-2">
                          {relatedBlog.featuredImageUrl && (
                            <div className="relative aspect-video rounded overflow-hidden">
                              <Image
                                src={relatedBlog.featuredImageUrl}
                                alt={relatedBlog.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            </div>
                          )}
                          <h4 className="font-medium group-hover:text-primary transition-colors line-clamp-2">
                            {relatedBlog.title}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {relatedBlog.excerpt}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{relatedBlog.author.name}</span>
                            <span>•</span>
                            <time>{formatDate(relatedBlog.publishedAt)}</time>
                          </div>
                        </article>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Comments Section Placeholder */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Comments</h3>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Comments feature coming soon. Share your thoughts with us!
                    </p>
                    <Button variant="outline" size="sm">
                      Share Feedback
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>

        {/* Print Styles */}
        <style jsx>{`
          @media print {
            .no-print {
              display: none !important;
            }
            
            .prose {
              font-size: 12pt;
              line-height: 1.4;
            }
            
            .prose h1 {
              font-size: 18pt;
              margin-bottom: 12pt;
            }
            
            .prose h2 {
              font-size: 14pt;
              margin-bottom: 8pt;
            }
            
            .prose p {
              margin-bottom: 8pt;
            }
          }
        `}</style>
      </div>
    </>
  );
}