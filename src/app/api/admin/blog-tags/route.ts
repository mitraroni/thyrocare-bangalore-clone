import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogTags } from '@/db/schema';
import { eq, like, desc, asc, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single tag by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const tag = await db.select()
        .from(blogTags)
        .where(eq(blogTags.id, parseInt(id)))
        .limit(1);

      if (tag.length === 0) {
        return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
      }

      return NextResponse.json(tag[0]);
    }

    // List tags with pagination, search, and sorting
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    let query = db.select().from(blogTags);

    // Apply search filter
    if (search) {
      query = query.where(like(blogTags.name, `%${search}%`));
    }

    // Apply sorting
    const orderBy = order === 'asc' ? asc : desc;
    const sortField = sort === 'name' ? blogTags.name : blogTags.createdAt;
    query = query.orderBy(orderBy(sortField));

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
    const { name, slug } = requestBody;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({ 
        error: "Name is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Generate slug if not provided
    const tagSlug = slug?.trim() || generateSlug(name.trim());

    // Check for duplicate slug
    const existingTag = await db.select()
      .from(blogTags)
      .where(eq(blogTags.slug, tagSlug))
      .limit(1);

    if (existingTag.length > 0) {
      return NextResponse.json({ 
        error: "Tag with this slug already exists",
        code: "DUPLICATE_SLUG" 
      }, { status: 409 });
    }

    // Create new tag
    const insertData = {
      name: name.trim(),
      slug: tagSlug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newTag = await db.insert(blogTags)
      .values(insertData)
      .returning();

    return NextResponse.json(newTag[0], { status: 201 });
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
    const { name, slug } = requestBody;

    // Check if tag exists
    const existingTag = await db.select()
      .from(blogTags)
      .where(eq(blogTags.id, parseInt(id)))
      .limit(1);

    if (existingTag.length === 0) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    // Prepare update data
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json({ 
          error: "Name cannot be empty",
          code: "INVALID_NAME" 
        }, { status: 400 });
      }
      updates.name = name.trim();
    }

    if (slug !== undefined) {
      const tagSlug = slug.trim() || (updates.name ? generateSlug(updates.name) : existingTag[0].slug);
      
      // Check for duplicate slug (excluding current tag)
      if (tagSlug !== existingTag[0].slug) {
        const duplicateTag = await db.select()
          .from(blogTags)
          .where(and(
            eq(blogTags.slug, tagSlug),
            eq(blogTags.id, parseInt(id))
          ))
          .limit(1);

        if (duplicateTag.length > 0) {
          return NextResponse.json({ 
            error: "Tag with this slug already exists",
            code: "DUPLICATE_SLUG" 
          }, { status: 409 });
        }
      }
      
      updates.slug = tagSlug;
    }

    // If name is updated but slug is not provided, regenerate slug
    if (updates.name && !slug) {
      const newSlug = generateSlug(updates.name);
      if (newSlug !== existingTag[0].slag) {
        // Check for duplicate slug
        const duplicateTag = await db.select()
          .from(blogTags)
          .where(eq(blogTags.slug, newSlug))
          .limit(1);

        if (duplicateTag.length > 0) {
          return NextResponse.json({ 
            error: "Generated slug already exists. Please provide a custom slug.",
            code: "DUPLICATE_SLUG" 
          }, { status: 409 });
        }
        updates.slug = newSlug;
      }
    }

    const updatedTag = await db.update(blogTags)
      .set(updates)
      .where(eq(blogTags.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedTag[0]);
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

    // Check if tag exists
    const existingTag = await db.select()
      .from(blogTags)
      .where(eq(blogTags.id, parseInt(id)))
      .limit(1);

    if (existingTag.length === 0) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    const deletedTag = await db.delete(blogTags)
      .where(eq(blogTags.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Tag deleted successfully',
      tag: deletedTag[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}