import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { siteSettings } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record fetch by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const record = await db.select()
        .from(siteSettings)
        .where(eq(siteSettings.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json({ 
          error: 'Site setting not found' 
        }, { status: 404 });
      }

      return NextResponse.json(record[0]);
    }

    // List with pagination and search
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    let query = db.select().from(siteSettings);

    if (search) {
      query = query.where(
        or(
          like(siteSettings.settingKey, `%${search}%`),
          like(siteSettings.settingValue, `%${search}%`)
        )
      );
    }

    // Apply sorting
    const orderBy = order === 'asc' ? asc : desc;
    if (sort === 'settingKey') {
      query = query.orderBy(orderBy(siteSettings.settingKey));
    } else if (sort === 'settingValue') {
      query = query.orderBy(orderBy(siteSettings.settingValue));
    } else if (sort === 'updatedAt') {
      query = query.orderBy(orderBy(siteSettings.updatedAt));
    } else {
      query = query.orderBy(orderBy(siteSettings.createdAt));
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

    // Security: Check for user ID fields in request body
    if ('userId' in requestBody || 'user_id' in requestBody || 'authorId' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { settingKey, settingValue, description } = requestBody;

    // Validate required fields
    if (!settingKey) {
      return NextResponse.json({ 
        error: "Setting key is required",
        code: "MISSING_SETTING_KEY" 
      }, { status: 400 });
    }

    if (!settingValue) {
      return NextResponse.json({ 
        error: "Setting value is required",
        code: "MISSING_SETTING_VALUE" 
      }, { status: 400 });
    }

    // Check for unique settingKey
    const existingSetting = await db.select()
      .from(siteSettings)
      .where(eq(siteSettings.settingKey, settingKey.trim()))
      .limit(1);

    if (existingSetting.length > 0) {
      return NextResponse.json({ 
        error: "Setting key already exists",
        code: "DUPLICATE_SETTING_KEY" 
      }, { status: 400 });
    }

    // Prepare insert data
    const insertData = {
      settingKey: settingKey.trim(),
      settingValue: settingValue.trim(),
      description: description?.trim() || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newRecord = await db.insert(siteSettings)
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

    // Security: Check for user ID fields in request body
    if ('userId' in requestBody || 'user_id' in requestBody || 'authorId' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Check if record exists
    const existingRecord = await db.select()
      .from(siteSettings)
      .where(eq(siteSettings.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ 
        error: 'Site setting not found' 
      }, { status: 404 });
    }

    const { settingKey, settingValue, description } = requestBody;

    // Check for unique settingKey if it's being updated
    if (settingKey && settingKey.trim() !== existingRecord[0].settingKey) {
      const duplicateSetting = await db.select()
        .from(siteSettings)
        .where(eq(siteSettings.settingKey, settingKey.trim()))
        .limit(1);

      if (duplicateSetting.length > 0) {
        return NextResponse.json({ 
          error: "Setting key already exists",
          code: "DUPLICATE_SETTING_KEY" 
        }, { status: 400 });
      }
    }

    // Prepare update data (only include provided fields)
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (settingKey !== undefined) {
      if (!settingKey.trim()) {
        return NextResponse.json({ 
          error: "Setting key cannot be empty",
          code: "EMPTY_SETTING_KEY" 
        }, { status: 400 });
      }
      updates.settingKey = settingKey.trim();
    }

    if (settingValue !== undefined) {
      if (!settingValue.trim()) {
        return NextResponse.json({ 
          error: "Setting value cannot be empty",
          code: "EMPTY_SETTING_VALUE" 
        }, { status: 400 });
      }
      updates.settingValue = settingValue.trim();
    }

    if (description !== undefined) {
      updates.description = description?.trim() || null;
    }

    const updated = await db.update(siteSettings)
      .set(updates)
      .where(eq(siteSettings.id, parseInt(id)))
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

    // Check if record exists
    const existingRecord = await db.select()
      .from(siteSettings)
      .where(eq(siteSettings.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ 
        error: 'Site setting not found' 
      }, { status: 404 });
    }

    const deleted = await db.delete(siteSettings)
      .where(eq(siteSettings.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Site setting deleted successfully',
      deletedRecord: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}