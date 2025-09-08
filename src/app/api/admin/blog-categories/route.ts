import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogCategories } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const category = await db.select()
        .from(blogCategories)
        .where(eq(blogCategories.id, parseInt(id)))
        .limit(1);

      if (category.length === 0) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }

      return NextResponse.json(category[0], { status: 200 });
    }

    // List with pagination, search, and sorting
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    let query = db.select().from(blogCategories);

    if (search) {
      const searchCondition = or(
        like(blogCategories.name, `%${search}%`),
        like(blogCategories.description, `%${search}%`)
      );
      query = query.where(searchCondition);
    }

    // Apply sorting
    const sortOrder = order === 'asc' ? asc : desc;
    if (sort === 'name') {
      query = query.orderBy(sortOrder(blogCategories.name));
    } else if (sort === 'createdAt') {
      query = query.orderBy(sortOrder(blogCategories.createdAt));
    } else if (sort === 'updatedAt') {
      query = query.orderBy(sortOrder(blogCategories.updatedAt));
    } else {
      query = query.orderBy(sortOrder(blogCategories.createdAt));
    }

    const results = await query.limit(limit).offset(offset);
    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  try {
    const requestBody = await request.json();
    const { name, slug, description } = requestBody;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ 
        error: "Name is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Generate slug if not provided
    const finalSlug = slug || generateSlug(name);

    if (!finalSlug) {
      return NextResponse.json({ 
        error: "Slug is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Check for duplicate slug
    const existingCategory = await db.select()
      .from(blogCategories)
      .where(eq(blogCategories.slug, finalSlug))
      .limit(1);

    if (existingCategory.length > 0) {
      return NextResponse.json({ 
        error: "Slug already exists",
        code: "DUPLICATE_SLUG" 
      }, { status: 409 });
    }

    const insertData = {
      name: name.trim(),
      slug: finalSlug,
      description: description?.trim() || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newCategory = await db.insert(blogCategories)
      .values(insertData)
      .returning();

    return NextResponse.json(newCategory[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const requestBody = await request.json();
    const { name, slug, description } = requestBody;

    // Check if category exists
    const existingCategory = await db.select()
      .from(blogCategories)
      .where(eq(blogCategories.id, parseInt(id)))
      .limit(1);

    if (existingCategory.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (name !== undefined) {
      updates.name = name.trim();
    }

    if (slug !== undefined) {
      const finalSlug = slug || (name ? generateSlug(name) : existingCategory[0].slug);
      
      // Check for duplicate slug (excluding current record)
      const duplicateCheck = await db.select()
        .from(blogCategories)
        .where(and(
          eq(blogCategories.slug, finalSlug),
          eq(blogCategories.id, parseInt(id))
        ))
        .limit(1);

      if (duplicateCheck.length === 0) {
        const existingSlug = await db.select()
          .from(blogCategories)
          .where(eq(blogCategories.slug, finalSlug))
          .limit(1);

        if (existingSlug.length > 0) {
          return NextResponse.json({ 
            error: "Slug already exists",
            code: "DUPLICATE_SLUG" 
          }, { status: 409 });
        }
      }

      updates.slug = finalSlug;
    }

    if (description !== undefined) {
      updates.description = description?.trim() || null;
    }

    const updated = await db.update(blogCategories)
      .set(updates)
      .where(eq(blogCategories.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if category exists before deleting
    const existingCategory = await db.select()
      .from(blogCategories)
      .where(eq(blogCategories.id, parseInt(id)))
      .limit(1);

    if (existingCategory.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const deleted = await db.delete(blogCategories)
      .where(eq(blogCategories.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Category deleted successfully',
      deletedCategory: deleted[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}