"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authClient, useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Save, Eye, ArrowLeft, Loader2, X, Hash, Image, FileText, Globe, Search } from 'lucide-react';

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

interface FormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImageUrl: string;
  metaTitle: string;
  metaDescription: string;
  tags: string;
  status: 'draft' | 'published';
  categoryId?: number;
}

interface ValidationErrors {
  [key: string]: string;
}

export default function NewBlogPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featuredImageUrl: '',
    metaTitle: '',
    metaDescription: '',
    tags: '',
    status: 'draft',
    categoryId: undefined
  });

  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [tagInputValue, setTagInputValue] = useState('');
  const [parsedTags, setParsedTags] = useState<string[]>([]);

  // Auto-save functionality
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  // Session check and redirect
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login');
    }
  }, [session, isPending, router]);

  // Generate slug from title
  const generateSlug = useCallback((title: string): string => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }, []);

  // Auto-generate slug when title changes
  useEffect(() => {
    if (formData.title && !formData.slug) {
      const newSlug = generateSlug(formData.title);
      setFormData(prev => ({ ...prev, slug: newSlug }));
    }
  }, [formData.title, formData.slug, generateSlug]);

  // Parse tags from string
  useEffect(() => {
    if (formData.tags) {
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      setParsedTags(tags);
    } else {
      setParsedTags([]);
    }
  }, [formData.tags]);

  // Track unsaved changes
  useEffect(() => {
    const hasContent = formData.title || formData.content || formData.excerpt;
    setHasUnsavedChanges(hasContent);
  }, [formData]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('bearer_token');
        if (!token) return;

        const response = await fetch('/api/admin/blog-categories', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const categoriesData = await response.json();
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    if (session?.user) {
      fetchCategories();
    }
  }, [session]);

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!formData.title || !hasUnsavedChanges || isSaving) return;

    try {
      const token = localStorage.getItem('bearer_token');
      if (!token) return;

      const response = await fetch('/api/admin/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          status: 'draft'
        })
      });

      if (response.ok) {
        const result = await response.json();
        setLastSaved(new Date());
        toast.success('Draft auto-saved');
        // Redirect to edit page after first save
        router.replace(`/admin/blogs/${result.id}/edit`);
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [formData, hasUnsavedChanges, isSaving, router]);

  // Set up auto-save timer
  useEffect(() => {
    if (hasUnsavedChanges && formData.title) {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      
      const timer = setTimeout(() => {
        autoSave();
      }, 30000); // Auto-save every 30 seconds

      setAutoSaveTimer(timer);
    }

    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [hasUnsavedChanges, formData.title, autoSave, autoSaveTimer]);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }

    if (formData.metaTitle && formData.metaTitle.length > 60) {
      newErrors.metaTitle = 'Meta title should be under 60 characters';
    }

    if (formData.metaDescription && formData.metaDescription.length > 160) {
      newErrors.metaDescription = 'Meta description should be under 160 characters';
    }

    if (formData.excerpt && formData.excerpt.length > 300) {
      newErrors.excerpt = 'Excerpt should be under 300 characters';
    }

    if (formData.featuredImageUrl && !isValidUrl(formData.featuredImageUrl)) {
      newErrors.featuredImageUrl = 'Please enter a valid image URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle tag input
  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInputValue.trim();
      
      if (newTag && !parsedTags.includes(newTag)) {
        const updatedTags = [...parsedTags, newTag];
        setFormData(prev => ({ 
          ...prev, 
          tags: updatedTags.join(', ') 
        }));
      }
      
      setTagInputValue('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    const updatedTags = parsedTags.filter(tag => tag !== tagToRemove);
    setFormData(prev => ({ 
      ...prev, 
      tags: updatedTags.join(', ') 
    }));
  };

  // Save as draft
  const handleSaveDraft = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const token = localStorage.getItem('bearer_token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch('/api/admin/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          status: 'draft'
        })
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Blog saved as draft');
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        router.push('/admin/blogs');
      } else {
        toast.error(result.error || 'Failed to save blog');
      }
    } catch (error) {
      toast.error('Failed to save blog');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Publish blog
  const handlePublish = async () => {
    if (!validateForm()) return;

    setIsPublishing(true);
    try {
      const token = localStorage.getItem('bearer_token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch('/api/admin/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          status: 'published'
        })
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Blog published successfully');
        setHasUnsavedChanges(false);
        router.push('/admin/blogs');
      } else {
        toast.error(result.error || 'Failed to publish blog');
      }
    } catch (error) {
      toast.error('Failed to publish blog');
      console.error('Publish error:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-7xl mx-auto py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Blog Post</h1>
              <p className="text-sm text-gray-500">
                Write and publish your blog content
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {lastSaved && (
              <span className="text-sm text-gray-500">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-2"
            >
              <Eye className="h-4 w-4" />
              <span>{showPreview ? 'Hide Preview' : 'Preview'}</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSaving || !formData.title}
              className="flex items-center space-x-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>Save Draft</span>
            </Button>
            
            <Button
              onClick={handlePublish}
              disabled={isPublishing || !formData.title}
              className="flex items-center space-x-2 bg-primary hover:bg-primary/90"
            >
              {isPublishing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Globe className="h-4 w-4" />
              )}
              <span>Publish</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title" className="flex items-center space-x-2">
                    <span>Title *</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter blog title..."
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="url-friendly-slug"
                    className={errors.slug ? 'border-red-500' : ''}
                  />
                  {errors.slug && (
                    <p className="text-sm text-red-500 mt-1">{errors.slug}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    This will be the URL: /blog/{formData.slug || 'your-slug-here'}
                  </p>
                </div>

                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => handleInputChange('excerpt', e.target.value)}
                    placeholder="Brief description of your blog post..."
                    rows={3}
                    className={errors.excerpt ? 'border-red-500' : ''}
                  />
                  {errors.excerpt && (
                    <p className="text-sm text-red-500 mt-1">{errors.excerpt}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.excerpt.length}/300 characters
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Content */}
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="content">Blog Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="Write your blog content here... (Markdown supported)"
                    rows={15}
                    className="font-mono"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    You can use Markdown formatting for rich text (e.g., **bold**, *italic*, # headings)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Preview */}
            {showPreview && (
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <h3>{formData.title || 'Blog Title'}</h3>
                    {formData.featuredImageUrl && (
                      <img
                        src={formData.featuredImageUrl}
                        alt={formData.title}
                        className="w-full h-32 object-cover rounded"
                      />
                    )}
                    <p className="text-gray-600">
                      {formData.excerpt || 'Blog excerpt will appear here...'}
                    </p>
                    <div className="text-sm whitespace-pre-wrap">
                      {formData.content.substring(0, 200)}
                      {formData.content.length > 200 && '...'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Publishing Options */}
            <Card>
              <CardHeader>
                <CardTitle>Publishing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'draft' | 'published') => 
                      handleInputChange('status', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.categoryId?.toString() || "none"}
                    onValueChange={(value) => 
                      handleInputChange('categoryId', value === "none" ? undefined : parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Category</SelectItem>
                      {isLoadingCategories ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Image className="h-5 w-5" />
                  <span>Featured Image</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="featuredImageUrl">Image URL</Label>
                  <Input
                    id="featuredImageUrl"
                    type="url"
                    value={formData.featuredImageUrl}
                    onChange={(e) => handleInputChange('featuredImageUrl', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className={errors.featuredImageUrl ? 'border-red-500' : ''}
                  />
                  {errors.featuredImageUrl && (
                    <p className="text-sm text-red-500 mt-1">{errors.featuredImageUrl}</p>
                  )}
                  {formData.featuredImageUrl && isValidUrl(formData.featuredImageUrl) && (
                    <div className="mt-3">
                      <img
                        src={formData.featuredImageUrl}
                        alt="Featured image preview"
                        className="w-full h-32 object-cover rounded border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Hash className="h-5 w-5" />
                  <span>Tags</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="tags">Add Tags</Label>
                  <Input
                    id="tags"
                    value={tagInputValue}
                    onChange={(e) => setTagInputValue(e.target.value)}
                    onKeyDown={handleTagInput}
                    placeholder="Type tag and press Enter"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Press Enter or comma to add tags
                  </p>
                  
                  {parsedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {parsedTags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center space-x-1"
                        >
                          <span>{tag}</span>
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* SEO Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>SEO Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={formData.metaTitle}
                    onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                    placeholder="SEO-friendly title..."
                    className={errors.metaTitle ? 'border-red-500' : ''}
                  />
                  {errors.metaTitle && (
                    <p className="text-sm text-red-500 mt-1">{errors.metaTitle}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.metaTitle.length}/60 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={formData.metaDescription}
                    onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                    placeholder="SEO description for search engines..."
                    rows={3}
                    className={errors.metaDescription ? 'border-red-500' : ''}
                  />
                  {errors.metaDescription && (
                    <p className="text-sm text-red-500 mt-1">{errors.metaDescription}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.metaDescription.length}/160 characters
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}