import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { heroBanners } from '@/db/schema';
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

    // Single record fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const record = await db.select()
        .from(heroBanners)
        .where(eq(heroBanners.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json({ error: 'Hero banner not found' }, { status: 404 });
      }

      return NextResponse.json(record[0]);
    }

    // List with pagination and search
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const isActiveFilter = searchParams.get('is_active');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    let query = db.select().from(heroBanners);

    // Build where conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(heroBanners.title, `%${search}%`),
          like(heroBanners.subtitle, `%${search}%`)
        )
      );
    }

    if (isActiveFilter !== null && isActiveFilter !== undefined) {
      const isActive = isActiveFilter === 'true';
      conditions.push(eq(heroBanners.isActive, isActive));
    }

    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions));
    }

    // Apply sorting
    const orderDirection = order === 'asc' ? asc : desc;
    const sortField = sort === 'title' ? heroBanners.title :
                     sort === 'isActive' ? heroBanners.isActive :
                     heroBanners.createdAt;
    
    query = query.orderBy(orderDirection(sortField));

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
    const { title, subtitle, discountText, ctaText, ctaUrl, backgroundImageUrl, isActive } = requestBody;

    // Security check: reject if user ID provided in body
    if ('userId' in requestBody || 'user_id' in requestBody || 'authorId' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Validate required fields
    if (!title || title.trim() === '') {
      return NextResponse.json({ 
        error: "Title is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedData = {
      title: title.trim(),
      subtitle: subtitle?.trim() || null,
      discountText: discountText?.trim() || null,
      ctaText: ctaText?.trim() || null,
      ctaUrl: ctaUrl?.trim() || null,
      backgroundImageUrl: backgroundImageUrl?.trim() || null,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newRecord = await db.insert(heroBanners)
      .values(sanitizedData)
      .returning();

    return NextResponse.json(newRecord[0], { status: 201 });
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

    // Security check: reject if user ID provided in body
    if ('userId' in requestBody || 'user_id' in requestBody || 'authorId' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Check if record exists
    const existingRecord = await db.select()
      .from(heroBanners)
      .where(eq(heroBanners.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ error: 'Hero banner not found' }, { status: 404 });
    }

    const { title, subtitle, discountText, ctaText, ctaUrl, backgroundImageUrl, isActive } = requestBody;

    // Validate title if provided
    if (title !== undefined && (!title || title.trim() === '')) {
      return NextResponse.json({ 
        error: "Title cannot be empty",
        code: "INVALID_TITLE" 
      }, { status: 400 });
    }

    // Build update data with only provided fields
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (title !== undefined) updateData.title = title.trim();
    if (subtitle !== undefined) updateData.subtitle = subtitle?.trim() || null;
    if (discountText !== undefined) updateData.discountText = discountText?.trim() || null;
    if (ctaText !== undefined) updateData.ctaText = ctaText?.trim() || null;
    if (ctaUrl !== undefined) updateData.ctaUrl = ctaUrl?.trim() || null;
    if (backgroundImageUrl !== undefined) updateData.backgroundImageUrl = backgroundImageUrl?.trim() || null;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const updated = await db.update(heroBanners)
      .set(updateData)
      .where(eq(heroBanners.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Hero banner not found' }, { status: 404 });
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

    // Check if record exists
    const existingRecord = await db.select()
      .from(heroBanners)
      .where(eq(heroBanners.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ error: 'Hero banner not found' }, { status: 404 });
    }

    const deleted = await db.delete(heroBanners)
      .where(eq(heroBanners.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Hero banner not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Hero banner deleted successfully',
      deletedRecord: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}