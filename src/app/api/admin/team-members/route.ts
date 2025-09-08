import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { teamMembers } from '@/db/schema';
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

      const teamMember = await db.select()
        .from(teamMembers)
        .where(eq(teamMembers.id, parseInt(id)))
        .limit(1);

      if (teamMember.length === 0) {
        return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
      }

      return NextResponse.json(teamMember[0]);
    }

    // List with pagination, search, filtering, and sorting
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const sort = searchParams.get('sort') || 'orderPosition';
    const order = searchParams.get('order') || 'asc';

    let query = db.select().from(teamMembers);
    const conditions = [];

    // Search functionality
    if (search) {
      const searchCondition = or(
        like(teamMembers.name, `%${search}%`),
        like(teamMembers.designation, `%${search}%`),
        like(teamMembers.bio, `%${search}%`),
        like(teamMembers.email, `%${search}%`)
      );
      conditions.push(searchCondition);
    }

    // Status filter
    if (status && (status === 'active' || status === 'inactive')) {
      conditions.push(eq(teamMembers.status, status));
    }

    // Apply conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Sorting
    const validSortFields = ['id', 'name', 'designation', 'orderPosition', 'status', 'createdAt', 'updatedAt'];
    const sortField = validSortFields.includes(sort) ? sort : 'orderPosition';
    const sortOrder = order === 'desc' ? desc : asc;

    query = query.orderBy(sortOrder(teamMembers[sortField as keyof typeof teamMembers]));

    // Pagination
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
      name, 
      designation, 
      bio, 
      imageUrl, 
      email, 
      phone, 
      socialLinks, 
      orderPosition,
      status 
    } = requestBody;

    // Security check: reject if user ID provided in body
    if ('userId' in requestBody || 'user_id' in requestBody || 'authorId' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({ 
        error: "Name is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!designation || !designation.trim()) {
      return NextResponse.json({ 
        error: "Designation is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Email validation if provided
    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return NextResponse.json({ 
          error: "Invalid email format",
          code: "INVALID_EMAIL" 
        }, { status: 400 });
      }
    }

    // Status validation
    if (status && status !== 'active' && status !== 'inactive') {
      return NextResponse.json({ 
        error: "Status must be either 'active' or 'inactive'",
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    // Social links validation if provided
    if (socialLinks) {
      try {
        if (typeof socialLinks === 'string') {
          JSON.parse(socialLinks);
        }
      } catch {
        return NextResponse.json({ 
          error: "Social links must be valid JSON",
          code: "INVALID_JSON" 
        }, { status: 400 });
      }
    }

    // Prepare insert data
    const insertData = {
      name: name.trim(),
      designation: designation.trim(),
      bio: bio?.trim() || null,
      imageUrl: imageUrl?.trim() || null,
      email: email?.trim().toLowerCase() || null,
      phone: phone?.trim() || null,
      socialLinks: socialLinks || null,
      orderPosition: orderPosition || 0,
      status: status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newTeamMember = await db.insert(teamMembers)
      .values(insertData)
      .returning();

    return NextResponse.json(newTeamMember[0], { status: 201 });
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

    // Check if team member exists
    const existingTeamMember = await db.select()
      .from(teamMembers)
      .where(eq(teamMembers.id, parseInt(id)))
      .limit(1);

    if (existingTeamMember.length === 0) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    const { 
      name, 
      designation, 
      bio, 
      imageUrl, 
      email, 
      phone, 
      socialLinks, 
      orderPosition,
      status 
    } = requestBody;

    // Validate fields if provided
    if (name !== undefined && (!name || !name.trim())) {
      return NextResponse.json({ 
        error: "Name cannot be empty",
        code: "INVALID_FIELD" 
      }, { status: 400 });
    }

    if (designation !== undefined && (!designation || !designation.trim())) {
      return NextResponse.json({ 
        error: "Designation cannot be empty",
        code: "INVALID_FIELD" 
      }, { status: 400 });
    }

    // Email validation if provided
    if (email !== undefined && email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return NextResponse.json({ 
          error: "Invalid email format",
          code: "INVALID_EMAIL" 
        }, { status: 400 });
      }
    }

    // Status validation
    if (status !== undefined && status !== 'active' && status !== 'inactive') {
      return NextResponse.json({ 
        error: "Status must be either 'active' or 'inactive'",
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    // Social links validation if provided
    if (socialLinks !== undefined && socialLinks) {
      try {
        if (typeof socialLinks === 'string') {
          JSON.parse(socialLinks);
        }
      } catch {
        return NextResponse.json({ 
          error: "Social links must be valid JSON",
          code: "INVALID_JSON" 
        }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (name !== undefined) updateData.name = name.trim();
    if (designation !== undefined) updateData.designation = designation.trim();
    if (bio !== undefined) updateData.bio = bio?.trim() || null;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl?.trim() || null;
    if (email !== undefined) updateData.email = email?.trim().toLowerCase() || null;
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    if (socialLinks !== undefined) updateData.socialLinks = socialLinks || null;
    if (orderPosition !== undefined) updateData.orderPosition = orderPosition;
    if (status !== undefined) updateData.status = status;

    const updated = await db.update(teamMembers)
      .set(updateData)
      .where(eq(teamMembers.id, parseInt(id)))
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

    // Check if team member exists before deleting
    const existingTeamMember = await db.select()
      .from(teamMembers)
      .where(eq(teamMembers.id, parseInt(id)))
      .limit(1);

    if (existingTeamMember.length === 0) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    const deleted = await db.delete(teamMembers)
      .where(eq(teamMembers.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Team member deleted successfully',
      teamMember: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}