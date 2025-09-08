import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogs } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single blog by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const blog = await db.select()
        .from(blogs)
        .where(eq(blogs.id, parseInt(id)))
        .limit(1);

      if (blog.length === 0) {
        return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
      }

      return NextResponse.json(blog[0]);
    }

    // List blogs with pagination, search, and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const authorId = searchParams.get('author_id');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    let query = db.select().from(blogs);
    let conditions = [];

    // Search across title, content, and excerpt
    if (search) {
      conditions.push(
        or(
          like(blogs.title, `%${search}%`),
          like(blogs.content, `%${search}%`),
          like(blogs.excerpt, `%${search}%`)
        )
      );
    }

    // Filter by status
    if (status && (status === 'draft' || status === 'published')) {
      conditions.push(eq(blogs.status, status));
    }

    // Filter by author
    if (authorId) {
      conditions.push(eq(blogs.authorId, authorId));
    }

    // Apply conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const sortColumn = sort === 'title' ? blogs.title :
                      sort === 'publishedAt' ? blogs.publishedAt :
                      sort === 'updatedAt' ? blogs.updatedAt :
                      blogs.createdAt;

    query = query.orderBy(order === 'asc' ? asc(sortColumn) : desc(sortColumn));

    // Apply pagination
    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const requestBody = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody || 'authorId' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { 
      title, 
      slug, 
      content, 
      excerpt, 
      featuredImageUrl, 
      status = 'draft',
      metaTitle,
      metaDescription,
      tags
    } = requestBody;

    // Validate required fields
    if (!title) {
      return NextResponse.json({ 
        error: "Title is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Validate status
    if (status && !['draft', 'published'].includes(status)) {
      return NextResponse.json({ 
        error: "Status must be either 'draft' or 'published'",
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    // Generate slug if not provided
    const finalSlug = slug || generateSlug(title);

    // Check for duplicate slug
    const existingBlog = await db.select()
      .from(blogs)
      .where(eq(blogs.slug, finalSlug))
      .limit(1);

    if (existingBlog.length > 0) {
      return NextResponse.json({ 
        error: "Slug already exists",
        code: "DUPLICATE_SLUG" 
      }, { status: 409 });
    }

    // Prepare insert data
    const now = new Date().toISOString();
    const insertData = {
      title: title.trim(),
      slug: finalSlug,
      content: content || null,
      excerpt: excerpt || null,
      featuredImageUrl: featuredImageUrl || null,
      authorId: user.id,
      status,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      tags: tags || null,
      publishedAt: status === 'published' ? now : null,
      createdAt: now,
      updatedAt: now
    };

    const newBlog = await db.insert(blogs)
      .values(insertData)
      .returning();

    return NextResponse.json(newBlog[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const requestBody = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody || 'authorId' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Check if blog exists
    const existingBlog = await db.select()
      .from(blogs)
      .where(eq(blogs.id, parseInt(id)))
      .limit(1);

    if (existingBlog.length === 0) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    const { 
      title, 
      slug, 
      content, 
      excerpt, 
      featuredImageUrl, 
      status,
      metaTitle,
      metaDescription,
      tags
    } = requestBody;

    // Validate status if provided
    if (status && !['draft', 'published'].includes(status)) {
      return NextResponse.json({ 
        error: "Status must be either 'draft' or 'published'",
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    // Check for duplicate slug if slug is being updated
    if (slug && slug !== existingBlog[0].slug) {
      const slugExists = await db.select()
        .from(blogs)
        .where(and(
          eq(blogs.slug, slug),
          eq(blogs.id, parseInt(id))
        ))
        .limit(1);

      if (slugExists.length === 0) {
        const duplicateSlug = await db.select()
          .from(blogs)
          .where(eq(blogs.slug, slug))
          .limit(1);

        if (duplicateSlug.length > 0) {
          return NextResponse.json({ 
            error: "Slug already exists",
            code: "DUPLICATE_SLUG" 
          }, { status: 409 });
        }
      }
    }

    // Prepare update data
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (title !== undefined) updates.title = title.trim();
    if (slug !== undefined) updates.slug = slug;
    if (content !== undefined) updates.content = content;
    if (excerpt !== undefined) updates.excerpt = excerpt;
    if (featuredImageUrl !== undefined) updates.featuredImageUrl = featuredImageUrl;
    if (metaTitle !== undefined) updates.metaTitle = metaTitle;
    if (metaDescription !== undefined) updates.metaDescription = metaDescription;
    if (tags !== undefined) updates.tags = tags;

    // Handle status change and publishedAt
    if (status !== undefined) {
      updates.status = status;
      if (status === 'published' && existingBlog[0].status !== 'published') {
        updates.publishedAt = new Date().toISOString();
      } else if (status === 'draft') {
        updates.publishedAt = null;
      }
    }

    const updated = await db.update(blogs)
      .set(updates)
      .where(eq(blogs.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0]);

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if blog exists
    const existingBlog = await db.select()
      .from(blogs)
      .where(eq(blogs.id, parseInt(id)))
      .limit(1);

    if (existingBlog.length === 0) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    const deleted = await db.delete(blogs)
      .where(eq(blogs.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Blog deleted successfully',
      deletedBlog: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}