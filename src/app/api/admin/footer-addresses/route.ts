import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { footerAddresses } from '@/db/schema';
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
        .from(footerAddresses)
        .where(eq(footerAddresses.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json({ error: 'Footer address not found' }, { status: 404 });
      }

      return NextResponse.json(record[0]);
    }

    // List with pagination, search, filtering, and sorting
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const isActive = searchParams.get('is_active');
    const sort = searchParams.get('sort') || 'displayOrder';
    const order = searchParams.get('order') || 'asc';

    let query = db.select().from(footerAddresses);

    // Build where conditions
    const conditions = [];

    // Search across address fields
    if (search) {
      conditions.push(
        or(
          like(footerAddresses.addressLine1, `%${search}%`),
          like(footerAddresses.addressLine2, `%${search}%`),
          like(footerAddresses.city, `%${search}%`),
          like(footerAddresses.state, `%${search}%`),
          like(footerAddresses.country, `%${search}%`),
          like(footerAddresses.postalCode, `%${search}%`)
        )
      );
    }

    // Filter by is_active
    if (isActive !== null && isActive !== undefined) {
      conditions.push(eq(footerAddresses.isActive, isActive === 'true'));
    }

    // Apply conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const sortField = sort === 'created_at' ? footerAddresses.createdAt : footerAddresses.displayOrder;
    const sortDirection = order === 'desc' ? desc(sortField) : asc(sortField);
    query = query.orderBy(sortDirection);

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
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { 
      addressLine1, 
      addressLine2, 
      city, 
      state, 
      postalCode, 
      country, 
      isActive, 
      displayOrder 
    } = requestBody;

    // Validate required fields
    if (!addressLine1?.trim()) {
      return NextResponse.json({ 
        error: "Address line 1 is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!city?.trim()) {
      return NextResponse.json({ 
        error: "City is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!state?.trim()) {
      return NextResponse.json({ 
        error: "State is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!country?.trim()) {
      return NextResponse.json({ 
        error: "Country is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!postalCode?.trim()) {
      return NextResponse.json({ 
        error: "Postal code is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Sanitize inputs
    const insertData = {
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2?.trim() || null,
      city: city.trim(),
      state: state.trim(),
      postalCode: postalCode.trim(),
      country: country.trim(),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      displayOrder: displayOrder !== undefined ? parseInt(displayOrder) : 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newRecord = await db.insert(footerAddresses)
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
      .from(footerAddresses)
      .where(eq(footerAddresses.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ error: 'Footer address not found' }, { status: 404 });
    }

    const { 
      addressLine1, 
      addressLine2, 
      city, 
      state, 
      postalCode, 
      country, 
      isActive, 
      displayOrder 
    } = requestBody;

    // Build update object with only provided fields
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (addressLine1 !== undefined) {
      if (!addressLine1?.trim()) {
        return NextResponse.json({ 
          error: "Address line 1 cannot be empty",
          code: "INVALID_FIELD" 
        }, { status: 400 });
      }
      updates.addressLine1 = addressLine1.trim();
    }

    if (addressLine2 !== undefined) {
      updates.addressLine2 = addressLine2?.trim() || null;
    }

    if (city !== undefined) {
      if (!city?.trim()) {
        return NextResponse.json({ 
          error: "City cannot be empty",
          code: "INVALID_FIELD" 
        }, { status: 400 });
      }
      updates.city = city.trim();
    }

    if (state !== undefined) {
      if (!state?.trim()) {
        return NextResponse.json({ 
          error: "State cannot be empty",
          code: "INVALID_FIELD" 
        }, { status: 400 });
      }
      updates.state = state.trim();
    }

    if (postalCode !== undefined) {
      if (!postalCode?.trim()) {
        return NextResponse.json({ 
          error: "Postal code cannot be empty",
          code: "INVALID_FIELD" 
        }, { status: 400 });
      }
      updates.postalCode = postalCode.trim();
    }

    if (country !== undefined) {
      if (!country?.trim()) {
        return NextResponse.json({ 
          error: "Country cannot be empty",
          code: "INVALID_FIELD" 
        }, { status: 400 });
      }
      updates.country = country.trim();
    }

    if (isActive !== undefined) {
      updates.isActive = Boolean(isActive);
    }

    if (displayOrder !== undefined) {
      updates.displayOrder = parseInt(displayOrder) || 0;
    }

    const updated = await db.update(footerAddresses)
      .set(updates)
      .where(eq(footerAddresses.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Footer address not found' }, { status: 404 });
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
      .from(footerAddresses)
      .where(eq(footerAddresses.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ error: 'Footer address not found' }, { status: 404 });
    }

    const deleted = await db.delete(footerAddresses)
      .where(eq(footerAddresses.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Footer address not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Footer address deleted successfully',
      deletedRecord: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}