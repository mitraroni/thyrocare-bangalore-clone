import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { gallery } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single gallery item by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const galleryItem = await db.select()
        .from(gallery)
        .where(eq(gallery.id, parseInt(id)))
        .limit(1);

      if (galleryItem.length === 0) {
        return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 });
      }

      return NextResponse.json(galleryItem[0]);
    }

    // List gallery items with pagination, search, filtering, and sorting
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const sort = searchParams.get('sort') || 'orderPosition';
    const order = searchParams.get('order') || 'asc';

    let query = db.select().from(gallery);
    const conditions = [];

    // Search functionality
    if (search) {
      const searchCondition = or(
        like(gallery.title, `%${search}%`),
        like(gallery.description, `%${search}%`),
        like(gallery.altText, `%${search}%`)
      );
      conditions.push(searchCondition);
    }

    // Filter by category
    if (category) {
      conditions.push(eq(gallery.category, category));
    }

    // Filter by status
    if (status && (status === 'active' || status === 'inactive')) {
      conditions.push(eq(gallery.status, status));
    }

    // Apply conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const sortField = sort === 'orderPosition' ? gallery.orderPosition :
                     sort === 'title' ? gallery.title :
                     sort === 'createdAt' ? gallery.createdAt :
                     sort === 'updatedAt' ? gallery.updatedAt :
                     gallery.orderPosition;

    query = query.orderBy(order === 'desc' ? desc(sortField) : asc(sortField));

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
    const { 
      title, 
      imageUrl, 
      altText, 
      category, 
      description, 
      orderPosition, 
      status 
    } = requestBody;

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody || 'authorId' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Required field validation
    if (!title) {
      return NextResponse.json({ 
        error: "Title is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!imageUrl) {
      return NextResponse.json({ 
        error: "Image URL is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Status validation
    if (status && status !== 'active' && status !== 'inactive') {
      return NextResponse.json({ 
        error: "Status must be either 'active' or 'inactive'",
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    // Prepare insert data with defaults
    const insertData = {
      title: title.trim(),
      imageUrl: imageUrl.trim(),
      altText: altText ? altText.trim() : null,
      category: category ? category.trim() : null,
      description: description ? description.trim() : null,
      orderPosition: orderPosition || 0,
      status: status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newGalleryItem = await db.insert(gallery)
      .values(insertData)
      .returning();

    return NextResponse.json(newGalleryItem[0], { status: 201 });

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

    // Check if gallery item exists
    const existingItem = await db.select()
      .from(gallery)
      .where(eq(gallery.id, parseInt(id)))
      .limit(1);

    if (existingItem.length === 0) {
      return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 });
    }

    // Validate status if provided
    if (requestBody.status && requestBody.status !== 'active' && requestBody.status !== 'inactive') {
      return NextResponse.json({ 
        error: "Status must be either 'active' or 'inactive'",
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    // Prepare update data (only include provided fields)
    const updates = {
      updatedAt: new Date().toISOString()
    };

    if (requestBody.title !== undefined) updates.title = requestBody.title.trim();
    if (requestBody.imageUrl !== undefined) updates.imageUrl = requestBody.imageUrl.trim();
    if (requestBody.altText !== undefined) updates.altText = requestBody.altText ? requestBody.altText.trim() : null;
    if (requestBody.category !== undefined) updates.category = requestBody.category ? requestBody.category.trim() : null;
    if (requestBody.description !== undefined) updates.description = requestBody.description ? requestBody.description.trim() : null;
    if (requestBody.orderPosition !== undefined) updates.orderPosition = requestBody.orderPosition;
    if (requestBody.status !== undefined) updates.status = requestBody.status;

    const updatedGalleryItem = await db.update(gallery)
      .set(updates)
      .where(eq(gallery.id, parseInt(id)))
      .returning();

    if (updatedGalleryItem.length === 0) {
      return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 });
    }

    return NextResponse.json(updatedGalleryItem[0]);

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

    // Check if gallery item exists before deleting
    const existingItem = await db.select()
      .from(gallery)
      .where(eq(gallery.id, parseInt(id)))
      .limit(1);

    if (existingItem.length === 0) {
      return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 });
    }

    const deletedGalleryItem = await db.delete(gallery)
      .where(eq(gallery.id, parseInt(id)))
      .returning();

    if (deletedGalleryItem.length === 0) {
      return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Gallery item deleted successfully',
      deletedItem: deletedGalleryItem[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}