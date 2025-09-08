import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { announcements } from '@/db/schema';
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

      const announcement = await db.select()
        .from(announcements)
        .where(eq(announcements.id, parseInt(id)))
        .limit(1);

      if (announcement.length === 0) {
        return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
      }

      return NextResponse.json(announcement[0]);
    }

    // List with pagination, search, filtering, and sorting
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    let query = db.select().from(announcements);

    // Build where conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(announcements.title, `%${search}%`),
          like(announcements.content, `%${search}%`)
        )
      );
    }

    if (type) {
      conditions.push(eq(announcements.type, type));
    }

    if (status) {
      conditions.push(eq(announcements.status, status));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const sortField = announcements[sort as keyof typeof announcements] || announcements.createdAt;
    if (order === 'asc') {
      query = query.orderBy(asc(sortField));
    } else {
      query = query.orderBy(desc(sortField));
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

    // Security check: reject if user ID provided in body
    if ('userId' in requestBody || 'user_id' in requestBody || 'authorId' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { title, content, type, startDate, endDate, status } = requestBody;

    // Validate required fields
    if (!title) {
      return NextResponse.json({ 
        error: "Title is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ 
        error: "Content is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!startDate) {
      return NextResponse.json({ 
        error: "Start date is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Validate type
    if (type && !['info', 'warning', 'success'].includes(type)) {
      return NextResponse.json({ 
        error: "Type must be one of: info, warning, success",
        code: "INVALID_TYPE" 
      }, { status: 400 });
    }

    // Validate status
    if (status && !['active', 'inactive'].includes(status)) {
      return NextResponse.json({ 
        error: "Status must be either 'active' or 'inactive'",
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    // Validate date format and logic
    const startDateObj = new Date(startDate);
    if (isNaN(startDateObj.getTime())) {
      return NextResponse.json({ 
        error: "Start date must be a valid ISO date",
        code: "INVALID_START_DATE" 
      }, { status: 400 });
    }

    if (endDate) {
      const endDateObj = new Date(endDate);
      if (isNaN(endDateObj.getTime())) {
        return NextResponse.json({ 
          error: "End date must be a valid ISO date",
          code: "INVALID_END_DATE" 
        }, { status: 400 });
      }

      if (endDateObj <= startDateObj) {
        return NextResponse.json({ 
          error: "End date must be after start date",
          code: "INVALID_DATE_RANGE" 
        }, { status: 400 });
      }
    }

    // Sanitize and prepare data
    const insertData = {
      title: title.trim(),
      content: content.trim(),
      type: type || 'info',
      startDate: startDate,
      endDate: endDate || null,
      status: status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newAnnouncement = await db.insert(announcements)
      .values(insertData)
      .returning();

    return NextResponse.json(newAnnouncement[0], { status: 201 });
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
      .from(announcements)
      .where(eq(announcements.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    const { title, content, type, startDate, endDate, status } = requestBody;
    const updates: any = {};

    // Validate and sanitize fields if provided
    if (title !== undefined) {
      if (!title.trim()) {
        return NextResponse.json({ 
          error: "Title cannot be empty",
          code: "INVALID_TITLE" 
        }, { status: 400 });
      }
      updates.title = title.trim();
    }

    if (content !== undefined) {
      if (!content.trim()) {
        return NextResponse.json({ 
          error: "Content cannot be empty",
          code: "INVALID_CONTENT" 
        }, { status: 400 });
      }
      updates.content = content.trim();
    }

    if (type !== undefined) {
      if (!['info', 'warning', 'success'].includes(type)) {
        return NextResponse.json({ 
          error: "Type must be one of: info, warning, success",
          code: "INVALID_TYPE" 
        }, { status: 400 });
      }
      updates.type = type;
    }

    if (status !== undefined) {
      if (!['active', 'inactive'].includes(status)) {
        return NextResponse.json({ 
          error: "Status must be either 'active' or 'inactive'",
          code: "INVALID_STATUS" 
        }, { status: 400 });
      }
      updates.status = status;
    }

    if (startDate !== undefined) {
      const startDateObj = new Date(startDate);
      if (isNaN(startDateObj.getTime())) {
        return NextResponse.json({ 
          error: "Start date must be a valid ISO date",
          code: "INVALID_START_DATE" 
        }, { status: 400 });
      }
      updates.startDate = startDate;
    }

    if (endDate !== undefined) {
      if (endDate) {
        const endDateObj = new Date(endDate);
        if (isNaN(endDateObj.getTime())) {
          return NextResponse.json({ 
            error: "End date must be a valid ISO date",
            code: "INVALID_END_DATE" 
          }, { status: 400 });
        }

        // Check against existing or new start date
        const currentStartDate = updates.startDate || existingRecord[0].startDate;
        const startDateObj = new Date(currentStartDate);
        
        if (endDateObj <= startDateObj) {
          return NextResponse.json({ 
            error: "End date must be after start date",
            code: "INVALID_DATE_RANGE" 
          }, { status: 400 });
        }
      }
      updates.endDate = endDate || null;
    }

    // Always update updatedAt
    updates.updatedAt = new Date().toISOString();

    const updated = await db.update(announcements)
      .set(updates)
      .where(eq(announcements.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
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
      .from(announcements)
      .where(eq(announcements.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    const deleted = await db.delete(announcements)
      .where(eq(announcements.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Announcement deleted successfully',
      deletedAnnouncement: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}