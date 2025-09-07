import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { labInfo } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const isActive = searchParams.get('is_active');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    // Single record by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const record = await db.select()
        .from(labInfo)
        .where(eq(labInfo.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json({ error: 'Lab info not found' }, { status: 404 });
      }

      return NextResponse.json(record[0]);
    }

    // List with filtering
    let query = db.select().from(labInfo);
    let conditions = [];

    if (search) {
      conditions.push(
        or(
          like(labInfo.name, `%${search}%`),
          like(labInfo.address, `%${search}%`)
        )
      );
    }

    if (isActive !== null && isActive !== undefined) {
      conditions.push(eq(labInfo.isActive, isActive === 'true'));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const sortColumn = sort === 'name' ? labInfo.name :
                      sort === 'address' ? labInfo.address :
                      sort === 'createdAt' ? labInfo.createdAt :
                      sort === 'updatedAt' ? labInfo.updatedAt :
                      labInfo.createdAt;

    query = query.orderBy(order === 'asc' ? asc(sortColumn) : desc(sortColumn));

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

    const { name, address, phone, email, timings, mapUrl } = requestBody;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ 
        error: "Name is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!address) {
      return NextResponse.json({ 
        error: "Address is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!phone) {
      return NextResponse.json({ 
        error: "Phone is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ 
        error: "Email is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!timings) {
      return NextResponse.json({ 
        error: "Timings are required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedData = {
      name: name.trim(),
      address: address.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      timings: timings.trim(),
      mapUrl: mapUrl?.trim() || null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newRecord = await db.insert(labInfo)
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
      .from(labInfo)
      .where(eq(labInfo.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ error: 'Lab info not found' }, { status: 404 });
    }

    const { name, address, phone, email, timings, mapUrl, isActive } = requestBody;

    // Build update object with only provided fields
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (name !== undefined) {
      if (!name) {
        return NextResponse.json({ 
          error: "Name cannot be empty",
          code: "INVALID_FIELD" 
        }, { status: 400 });
      }
      updates.name = name.trim();
    }

    if (address !== undefined) {
      if (!address) {
        return NextResponse.json({ 
          error: "Address cannot be empty",
          code: "INVALID_FIELD" 
        }, { status: 400 });
      }
      updates.address = address.trim();
    }

    if (phone !== undefined) {
      if (!phone) {
        return NextResponse.json({ 
          error: "Phone cannot be empty",
          code: "INVALID_FIELD" 
        }, { status: 400 });
      }
      updates.phone = phone.trim();
    }

    if (email !== undefined) {
      if (!email) {
        return NextResponse.json({ 
          error: "Email cannot be empty",
          code: "INVALID_FIELD" 
        }, { status: 400 });
      }
      updates.email = email.trim().toLowerCase();
    }

    if (timings !== undefined) {
      if (!timings) {
        return NextResponse.json({ 
          error: "Timings cannot be empty",
          code: "INVALID_FIELD" 
        }, { status: 400 });
      }
      updates.timings = timings.trim();
    }

    if (mapUrl !== undefined) {
      updates.mapUrl = mapUrl?.trim() || null;
    }

    if (isActive !== undefined) {
      updates.isActive = Boolean(isActive);
    }

    const updated = await db.update(labInfo)
      .set(updates)
      .where(eq(labInfo.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Failed to update lab info' }, { status: 500 });
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
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

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
      .from(labInfo)
      .where(eq(labInfo.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ error: 'Lab info not found' }, { status: 404 });
    }

    const deleted = await db.delete(labInfo)
      .where(eq(labInfo.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Failed to delete lab info' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Lab info deleted successfully',
      deletedRecord: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}