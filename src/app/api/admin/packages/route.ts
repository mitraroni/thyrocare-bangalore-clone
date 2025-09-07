import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { packages } from '@/db/schema';
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
        .from(packages)
        .where(eq(packages.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json({ error: 'Package not found' }, { status: 404 });
      }

      return NextResponse.json(record[0]);
    }

    // List with pagination, search, and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const isFeatured = searchParams.get('is_featured');
    const sortBy = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    let query = db.select().from(packages);

    const conditions = [];

    // Search functionality
    if (search) {
      const searchCondition = or(
        like(packages.name, `%${search}%`),
        like(packages.description, `%${search}%`)
      );
      conditions.push(searchCondition);
    }

    // Filter by is_featured
    if (isFeatured !== null && isFeatured !== undefined) {
      const featuredValue = isFeatured === 'true';
      conditions.push(eq(packages.isFeatured, featuredValue));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Sorting
    const orderDirection = order === 'asc' ? asc : desc;
    if (sortBy === 'name') {
      query = query.orderBy(orderDirection(packages.name));
    } else if (sortBy === 'price') {
      query = query.orderBy(orderDirection(packages.price));
    } else {
      query = query.orderBy(orderDirection(packages.createdAt));
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
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const requestBody = await request.json();
    
    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { 
      name, 
      description, 
      price, 
      discountPrice, 
      testsIncluded, 
      isFeatured 
    } = requestBody;

    // Validate required fields
    if (!name || name.trim() === '') {
      return NextResponse.json({ 
        error: "Name is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (price === undefined || price === null || isNaN(parseFloat(price))) {
      return NextResponse.json({ 
        error: "Valid price is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedName = name.trim();
    const sanitizedDescription = description ? description.trim() : null;
    const sanitizedTestsIncluded = testsIncluded ? testsIncluded.trim() : null;

    const insertData = {
      name: sanitizedName,
      description: sanitizedDescription,
      price: parseFloat(price),
      discountPrice: discountPrice ? parseFloat(discountPrice) : null,
      testsIncluded: sanitizedTestsIncluded,
      isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newRecord = await db.insert(packages)
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
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Check if record exists
    const existingRecord = await db.select()
      .from(packages)
      .where(eq(packages.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    const { 
      name, 
      description, 
      price, 
      discountPrice, 
      testsIncluded, 
      isFeatured 
    } = requestBody;

    // Validate fields if provided
    if (name !== undefined && (!name || name.trim() === '')) {
      return NextResponse.json({ 
        error: "Name cannot be empty",
        code: "INVALID_FIELD" 
      }, { status: 400 });
    }

    if (price !== undefined && (price === null || isNaN(parseFloat(price)))) {
      return NextResponse.json({ 
        error: "Valid price is required",
        code: "INVALID_FIELD" 
      }, { status: 400 });
    }

    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description ? description.trim() : null;
    if (price !== undefined) updates.price = parseFloat(price);
    if (discountPrice !== undefined) updates.discountPrice = discountPrice ? parseFloat(discountPrice) : null;
    if (testsIncluded !== undefined) updates.testsIncluded = testsIncluded ? testsIncluded.trim() : null;
    if (isFeatured !== undefined) updates.isFeatured = Boolean(isFeatured);

    const updated = await db.update(packages)
      .set(updates)
      .where(eq(packages.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
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

    // Check if record exists before deleting
    const existingRecord = await db.select()
      .from(packages)
      .where(eq(packages.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    const deleted = await db.delete(packages)
      .where(eq(packages.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Package deleted successfully',
      deletedPackage: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}