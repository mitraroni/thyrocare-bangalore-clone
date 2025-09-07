import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { footerContacts } from '@/db/schema';
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

      const contact = await db.select()
        .from(footerContacts)
        .where(eq(footerContacts.id, parseInt(id)))
        .limit(1);

      if (contact.length === 0) {
        return NextResponse.json({ error: 'Footer contact not found' }, { status: 404 });
      }

      return NextResponse.json(contact[0]);
    }

    // List with pagination, search, filtering, and sorting
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const contactType = searchParams.get('contact_type');
    const isActive = searchParams.get('is_active');
    const sort = searchParams.get('sort') || 'displayOrder';
    const order = searchParams.get('order') || 'asc';

    let query = db.select().from(footerContacts);

    // Build where conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(footerContacts.label, `%${search}%`),
          like(footerContacts.contactValue, `%${search}%`)
        )
      );
    }

    if (contactType && ['phone', 'email', 'fax'].includes(contactType)) {
      conditions.push(eq(footerContacts.contactType, contactType));
    }

    if (isActive !== null && isActive !== undefined) {
      const activeValue = isActive === 'true';
      conditions.push(eq(footerContacts.isActive, activeValue));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const sortField = sort === 'created_at' ? footerContacts.createdAt : footerContacts.displayOrder;
    const sortOrder = order === 'desc' ? desc(sortField) : asc(sortField);
    query = query.orderBy(sortOrder);

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

    const body = await request.json();
    const { contactType, contactValue, label, isActive, displayOrder } = body;

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Validate required fields
    if (!contactType) {
      return NextResponse.json({ 
        error: "Contact type is required",
        code: "MISSING_CONTACT_TYPE" 
      }, { status: 400 });
    }

    if (!['phone', 'email', 'fax'].includes(contactType)) {
      return NextResponse.json({ 
        error: "Contact type must be 'phone', 'email', or 'fax'",
        code: "INVALID_CONTACT_TYPE" 
      }, { status: 400 });
    }

    if (!contactValue?.trim()) {
      return NextResponse.json({ 
        error: "Contact value is required",
        code: "MISSING_CONTACT_VALUE" 
      }, { status: 400 });
    }

    if (!label?.trim()) {
      return NextResponse.json({ 
        error: "Label is required",
        code: "MISSING_LABEL" 
      }, { status: 400 });
    }

    // Prepare insert data with defaults and timestamps
    const insertData = {
      contactType: contactType.trim(),
      contactValue: contactValue.trim(),
      label: label.trim(),
      isActive: isActive !== undefined ? isActive : true,
      displayOrder: displayOrder !== undefined ? displayOrder : 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newContact = await db.insert(footerContacts)
      .values(insertData)
      .returning();

    return NextResponse.json(newContact[0], { status: 201 });
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

    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Check if record exists
    const existingContact = await db.select()
      .from(footerContacts)
      .where(eq(footerContacts.id, parseInt(id)))
      .limit(1);

    if (existingContact.length === 0) {
      return NextResponse.json({ error: 'Footer contact not found' }, { status: 404 });
    }

    // Validate contact type if provided
    if (body.contactType && !['phone', 'email', 'fax'].includes(body.contactType)) {
      return NextResponse.json({ 
        error: "Contact type must be 'phone', 'email', or 'fax'",
        code: "INVALID_CONTACT_TYPE" 
      }, { status: 400 });
    }

    // Validate required fields if provided
    if (body.contactValue !== undefined && !body.contactValue?.trim()) {
      return NextResponse.json({ 
        error: "Contact value cannot be empty",
        code: "EMPTY_CONTACT_VALUE" 
      }, { status: 400 });
    }

    if (body.label !== undefined && !body.label?.trim()) {
      return NextResponse.json({ 
        error: "Label cannot be empty",
        code: "EMPTY_LABEL" 
      }, { status: 400 });
    }

    // Prepare update data
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (body.contactType !== undefined) {
      updates.contactType = body.contactType.trim();
    }
    if (body.contactValue !== undefined) {
      updates.contactValue = body.contactValue.trim();
    }
    if (body.label !== undefined) {
      updates.label = body.label.trim();
    }
    if (body.isActive !== undefined) {
      updates.isActive = body.isActive;
    }
    if (body.displayOrder !== undefined) {
      updates.displayOrder = body.displayOrder;
    }

    const updatedContact = await db.update(footerContacts)
      .set(updates)
      .where(eq(footerContacts.id, parseInt(id)))
      .returning();

    if (updatedContact.length === 0) {
      return NextResponse.json({ error: 'Footer contact not found' }, { status: 404 });
    }

    return NextResponse.json(updatedContact[0]);
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
    const existingContact = await db.select()
      .from(footerContacts)
      .where(eq(footerContacts.id, parseInt(id)))
      .limit(1);

    if (existingContact.length === 0) {
      return NextResponse.json({ error: 'Footer contact not found' }, { status: 404 });
    }

    const deletedContact = await db.delete(footerContacts)
      .where(eq(footerContacts.id, parseInt(id)))
      .returning();

    if (deletedContact.length === 0) {
      return NextResponse.json({ error: 'Footer contact not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Footer contact deleted successfully',
      deletedContact: deletedContact[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}