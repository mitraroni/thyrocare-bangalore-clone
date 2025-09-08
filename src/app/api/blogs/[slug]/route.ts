import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogs, user, blogCategories, blogTags, blogCategoryRelations, blogTagRelations } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;

    // Validate slug parameter
    if (!slug || typeof slug !== 'string' || slug.trim() === '') {
      return NextResponse.json({ 
        error: "Valid slug is required",
        code: "INVALID_SLUG" 
      }, { status: 400 });
    }

    // Get blog by slug - only published blogs
    const blogResult = await db.select({
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
      author: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image
      }
    })
    .from(blogs)
    .leftJoin(user, eq(blogs.authorId, user.id))
    .where(and(eq(blogs.slug, slug), eq(blogs.status, 'published')))
    .limit(1);

    if (blogResult.length === 0) {
      return NextResponse.json({ 
        error: 'Blog not found or not published',
        code: 'BLOG_NOT_FOUND' 
      }, { status: 404 });
    }

    const blog = blogResult[0];

    // Get associated categories
    const categoriesResult = await db.select({
      id: blogCategories.id,
      name: blogCategories.name,
      slug: blogCategories.slug,
      description: blogCategories.description
    })
    .from(blogCategories)
    .innerJoin(blogCategoryRelations, eq(blogCategories.id, blogCategoryRelations.categoryId))
    .where(eq(blogCategoryRelations.blogId, blog.id));

    // Get associated tags
    const tagsResult = await db.select({
      id: blogTags.id,
      name: blogTags.name,
      slug: blogTags.slug
    })
    .from(blogTags)
    .innerJoin(blogTagRelations, eq(blogTags.id, blogTagRelations.tagId))
    .where(eq(blogTagRelations.blogId, blog.id));

    // Construct complete blog response
    const completeBlog = {
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      content: blog.content,
      excerpt: blog.excerpt,
      featuredImageUrl: blog.featuredImageUrl,
      status: blog.status,
      metaTitle: blog.metaTitle,
      metaDescription: blog.metaDescription,
      tags: blog.tags,
      publishedAt: blog.publishedAt,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
      author: blog.author,
      categories: categoriesResult,
      associatedTags: tagsResult
    };

    return NextResponse.json(completeBlog, { status: 200 });

  } catch (error) {
    console.error('GET blog by slug error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}