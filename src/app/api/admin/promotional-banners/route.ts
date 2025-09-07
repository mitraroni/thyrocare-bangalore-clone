import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { promotionalBanners } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

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
        .from(promotionalBanners)
        .where(eq(promotionalBanners.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json({ error: 'Promotional banner not found' }, { status: 404 });
      }

      return NextResponse.json(record[0]);
    }

    // List with pagination, search, and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const isActive = searchParams.get('is_active');
    const sortBy = searchParams.get('sort') || 'sortOrder';
    const order = searchParams.get('order') || 'asc';

    let query = db.select().from(promotionalBanners);

    // Build conditions
    const conditions = [];

    if (search) {
      conditions.push(like(promotionalBanners.text, `%${search}%`));
    }

    if (isActive !== null && isActive !== undefined && isActive !== '') {
      const activeValue = isActive === 'true' || isActive === '1';
      conditions.push(eq(promotionalBanners.isActive, activeValue));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const orderDirection = order.toLowerCase() === 'desc' ? desc : asc;
    if (sortBy === 'sortOrder') {
      query = query.orderBy(orderDirection(promotionalBanners.sortOrder));
    } else if (sortBy === 'createdAt') {
      query = query.orderBy(orderDirection(promotionalBanners.createdAt));
    } else if (sortBy === 'updatedAt') {
      query = query.orderBy(orderDirection(promotionalBanners.updatedAt));
    } else if (sortBy === 'text') {
      query = query.orderBy(orderDirection(promotionalBanners.text));
    } else {
      query = query.orderBy(asc(promotionalBanners.sortOrder));
    }

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
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const requestBody = await request.json();
    
    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody || 'authorId' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { text, backgroundColor, textColor, isActive, sortOrder } = requestBody;

    // Validate required fields
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return NextResponse.json({ 
        error: "Text is required and cannot be empty",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Prepare insert data with defaults
    const insertData = {
      text: text.trim(),
      backgroundColor: backgroundColor || '#007bff',
      textColor: textColor || '#ffffff',
      isActive: isActive !== undefined ? isActive : true,
      sortOrder: sortOrder !== undefined ? parseInt(sortOrder) || 0 : 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newRecord = await db.insert(promotionalBanners)
      .values(insertData)
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
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

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

    // Check if record exists
    const existingRecord = await db.select()
      .from(promotionalBanners)
      .where(eq(promotionalBanners.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ error: 'Promotional banner not found' }, { status: 404 });
    }

    const { text, backgroundColor, textColor, isActive, sortOrder } = requestBody;

    // Validate text if provided
    if (text !== undefined && (typeof text !== 'string' || text.trim() === '')) {
      return NextResponse.json({ 
        error: "Text cannot be empty if provided",
        code: "INVALID_TEXT" 
      }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (text !== undefined) updateData.text = text.trim();
    if (backgroundColor !== undefined) updateData.backgroundColor = backgroundColor;
    if (textColor !== undefined) updateData.textColor = textColor;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder) || 0;

    const updated = await db.update(promotionalBanners)
      .set(updateData)
      .where(eq(promotionalBanners.id, parseInt(id)))
      .returning();

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
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if record exists before deleting
    const existingRecord = await db.select()
      .from(promotionalBanners)
      .where(eq(promotionalBanners.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ error: 'Promotional banner not found' }, { status: 404 });
    }

    const deleted = await db.delete(promotionalBanners)
      .where(eq(promotionalBanners.id, parseInt(id)))
      .returning();

    return NextResponse.json({ 
      message: 'Promotional banner deleted successfully',
      deleted: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}