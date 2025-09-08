import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogs, user, blogCategories, blogTags, blogCategoryRelations, blogTagRelations } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Search and filter parameters
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const featured = searchParams.get('featured');
    
    // Sorting parameters
    const sort = searchParams.get('sort') || 'publishedAt';
    const order = searchParams.get('order') || 'desc';
    
    // Validate sort field
    const validSortFields = ['publishedAt', 'createdAt', 'title', 'updatedAt'];
    const sortField = validSortFields.includes(sort) ? sort : 'publishedAt';
    
    // Validate order
    const sortOrder = order.toLowerCase() === 'asc' ? asc : desc;
    
    // Base query - only published blogs with author information
    let query = db
      .select({
        id: blogs.id,
        title: blogs.title,
        slug: blogs.slug,
        content: blogs.content,
        excerpt: blogs.excerpt,
        featuredImageUrl: blogs.featuredImageUrl,
        authorId: blogs.authorId,
        status: blogs.status,
        metaTitle: blogs.metaTitle,
        metaDescription: blogs.metaDescription,
        tags: blogs.tags,
        publishedAt: blogs.publishedAt,
        createdAt: blogs.createdAt,
        updatedAt: blogs.updatedAt,
        authorName: user.name,
        authorEmail: user.email,
        authorImage: user.image
      })
      .from(blogs)
      .leftJoin(user, eq(blogs.authorId, user.id));
    
    // Build where conditions
    let whereConditions = [eq(blogs.status, 'published')];
    
    // Search in title, content, and excerpt
    if (search) {
      const searchCondition = or(
        like(blogs.title, `%${search}%`),
        like(blogs.content, `%${search}%`),
        like(blogs.excerpt, `%${search}%`)
      );
      whereConditions.push(searchCondition);
    }
    
    // Filter by category (using slug)
    if (category) {
      // Get category ID by slug
      const categoryRecord = await db
        .select({ id: blogCategories.id })
        .from(blogCategories)
        .where(eq(blogCategories.slug, category))
        .limit(1);
      
      if (categoryRecord.length > 0) {
        // Get blog IDs that belong to this category
        const blogIds = await db
          .select({ blogId: blogCategoryRelations.blogId })
          .from(blogCategoryRelations)
          .where(eq(blogCategoryRelations.categoryId, categoryRecord[0].id));
        
        if (blogIds.length > 0) {
          const blogIdList = blogIds.map(b => b.blogId);
          whereConditions.push(
            or(...blogIdList.map(id => eq(blogs.id, id)))
          );
        } else {
          // No blogs in this category, return empty result
          return NextResponse.json([]);
        }
      } else {
        // Category not found, return empty result
        return NextResponse.json([]);
      }
    }
    
    // Filter by tag (using slug)
    if (tag) {
      // Get tag ID by slug
      const tagRecord = await db
        .select({ id: blogTags.id })
        .from(blogTags)
        .where(eq(blogTags.slug, tag))
        .limit(1);
      
      if (tagRecord.length > 0) {
        // Get blog IDs that have this tag
        const blogIds = await db
          .select({ blogId: blogTagRelations.blogId })
          .from(blogTagRelations)
          .where(eq(blogTagRelations.tagId, tagRecord[0].id));
        
        if (blogIds.length > 0) {
          const blogIdList = blogIds.map(b => b.blogId);
          whereConditions.push(
            or(...blogIdList.map(id => eq(blogs.id, id)))
          );
        } else {
          // No blogs with this tag, return empty result
          return NextResponse.json([]);
        }
      } else {
        // Tag not found, return empty result
        return NextResponse.json([]);
      }
    }
    
    // Filter for featured blogs (if featuredImageUrl exists)
    if (featured === 'true') {
      whereConditions.push(
        and(
          eq(blogs.featuredImageUrl, blogs.featuredImageUrl),
          // This is a simple check - you might want to add a dedicated featured field
        )
      );
    }
    
    // Apply where conditions
    if (whereConditions.length > 0) {
      query = query.where(and(...whereConditions));
    }
    
    // Apply sorting
    query = query.orderBy(sortOrder(blogs[sortField as keyof typeof blogs]));
    
    // Apply pagination
    const results = await query.limit(limit).offset(offset);
    
    // Process results to truncate content for list view and format response
    const processedResults = results.map(blog => ({
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt || (blog.content ? blog.content.substring(0, 200) + '...' : ''),
      featuredImageUrl: blog.featuredImageUrl,
      metaTitle: blog.metaTitle,
      metaDescription: blog.metaDescription,
      tags: blog.tags ? blog.tags.split(',').map(t => t.trim()) : [],
      publishedAt: blog.publishedAt,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
      author: {
        id: blog.authorId,
        name: blog.authorName,
        email: blog.authorEmail,
        image: blog.authorImage
      }
    }));
    
    // Get total count for metadata (optional but helpful)
    let countQuery = db
      .select({ count: blogs.id })
      .from(blogs);
    
    if (whereConditions.length > 0) {
      countQuery = countQuery.where(and(...whereConditions));
    }
    
    const totalCountResult = await countQuery;
    const totalCount = totalCountResult.length;
    
    // Return results with metadata
    return NextResponse.json({
      blogs: processedResults,
      pagination: {
        limit,
        offset,
        total: totalCount,
        hasMore: offset + limit < totalCount
      }
    });
    
  } catch (error) {
    console.error('GET blogs error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}