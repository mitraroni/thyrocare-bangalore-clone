import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { testimonials } from '@/db/schema';
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

    // Single testimonial fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const testimonial = await db.select()
        .from(testimonials)
        .where(eq(testimonials.id, parseInt(id)))
        .limit(1);

      if (testimonial.length === 0) {
        return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
      }

      return NextResponse.json(testimonial[0]);
    }

    // List testimonials with pagination, search, filtering, and sorting
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const rating = searchParams.get('rating');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    let query = db.select().from(testimonials);

    // Build where conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(testimonials.name, `%${search}%`),
          like(testimonials.designation, `%${search}%`),
          like(testimonials.company, `%${search}%`),
          like(testimonials.content, `%${search}%`)
        )
      );
    }

    if (status && (status === 'active' || status === 'inactive')) {
      conditions.push(eq(testimonials.status, status));
    }

    if (rating) {
      const ratingNum = parseInt(rating);
      if (!isNaN(ratingNum) && ratingNum >= 1 && ratingNum <= 5) {
        conditions.push(eq(testimonials.rating, ratingNum));
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Add sorting
    const validSortFields = ['createdAt', 'updatedAt', 'name', 'rating', 'status'];
    if (validSortFields.includes(sort)) {
      const sortColumn = testimonials[sort as keyof typeof testimonials];
      if (sortColumn) {
        query = query.orderBy(order === 'asc' ? asc(sortColumn) : desc(sortColumn));
      }
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
      designation, 
      company, 
      content, 
      rating, 
      imageUrl, 
      status 
    } = requestBody;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({ 
        error: "Name is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!content || !content.trim()) {
      return NextResponse.json({ 
        error: "Content is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Validate rating if provided
    if (rating !== undefined && (isNaN(parseInt(rating)) || parseInt(rating) < 1 || parseInt(rating) > 5)) {
      return NextResponse.json({ 
        error: "Rating must be between 1 and 5",
        code: "INVALID_RATING" 
      }, { status: 400 });
    }

    // Validate status if provided
    if (status && status !== 'active' && status !== 'inactive') {
      return NextResponse.json({ 
        error: "Status must be either 'active' or 'inactive'",
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    const testimonialData = {
      name: name.trim(),
      designation: designation?.trim() || null,
      company: company?.trim() || null,
      content: content.trim(),
      rating: rating ? parseInt(rating) : 5,
      imageUrl: imageUrl?.trim() || null,
      status: status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newTestimonial = await db.insert(testimonials)
      .values(testimonialData)
      .returning();

    return NextResponse.json(newTestimonial[0], { status: 201 });
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

    const { 
      name, 
      designation, 
      company, 
      content, 
      rating, 
      imageUrl, 
      status 
    } = requestBody;

    // Check if testimonial exists
    const existingTestimonial = await db.select()
      .from(testimonials)
      .where(eq(testimonials.id, parseInt(id)))
      .limit(1);

    if (existingTestimonial.length === 0) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
    }

    // Validate fields if provided
    if (name !== undefined && (!name || !name.trim())) {
      return NextResponse.json({ 
        error: "Name cannot be empty if provided",
        code: "INVALID_NAME" 
      }, { status: 400 });
    }

    if (content !== undefined && (!content || !content.trim())) {
      return NextResponse.json({ 
        error: "Content cannot be empty if provided",
        code: "INVALID_CONTENT" 
      }, { status: 400 });
    }

    if (rating !== undefined && (isNaN(parseInt(rating)) || parseInt(rating) < 1 || parseInt(rating) > 5)) {
      return NextResponse.json({ 
        error: "Rating must be between 1 and 5",
        code: "INVALID_RATING" 
      }, { status: 400 });
    }

    if (status !== undefined && status !== 'active' && status !== 'inactive') {
      return NextResponse.json({ 
        error: "Status must be either 'active' or 'inactive'",
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    // Build update object with only provided fields
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (name !== undefined) updates.name = name.trim();
    if (designation !== undefined) updates.designation = designation?.trim() || null;
    if (company !== undefined) updates.company = company?.trim() || null;
    if (content !== undefined) updates.content = content.trim();
    if (rating !== undefined) updates.rating = parseInt(rating);
    if (imageUrl !== undefined) updates.imageUrl = imageUrl?.trim() || null;
    if (status !== undefined) updates.status = status;

    const updatedTestimonial = await db.update(testimonials)
      .set(updates)
      .where(eq(testimonials.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedTestimonial[0]);
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

    // Check if testimonial exists before deleting
    const existingTestimonial = await db.select()
      .from(testimonials)
      .where(eq(testimonials.id, parseInt(id)))
      .limit(1);

    if (existingTestimonial.length === 0) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
    }

    const deletedTestimonial = await db.delete(testimonials)
      .where(eq(testimonials.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Testimonial deleted successfully',
      testimonial: deletedTestimonial[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}