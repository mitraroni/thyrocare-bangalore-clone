import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { faqs } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single FAQ by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const faq = await db.select()
        .from(faqs)
        .where(eq(faqs.id, parseInt(id)))
        .limit(1);

      if (faq.length === 0) {
        return NextResponse.json({ 
          error: 'FAQ not found' 
        }, { status: 404 });
      }

      return NextResponse.json(faq[0]);
    }

    // List FAQs with pagination, search, filtering, and sorting
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const isActive = searchParams.get('is_active');
    const sort = searchParams.get('sort') || 'sortOrder';
    const order = searchParams.get('order') || 'asc';

    let query = db.select().from(faqs);
    
    const conditions = [];

    // Filter by is_active
    if (isActive !== null && isActive !== undefined) {
      conditions.push(eq(faqs.isActive, isActive === 'true'));
    }

    // Search across question and answer fields
    if (search) {
      conditions.push(
        or(
          like(faqs.question, `%${search}%`),
          like(faqs.answer, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Sorting
    const sortColumn = sort === 'sortOrder' ? faqs.sortOrder :
                      sort === 'question' ? faqs.question :
                      sort === 'createdAt' ? faqs.createdAt :
                      sort === 'updatedAt' ? faqs.updatedAt :
                      faqs.sortOrder;

    if (order === 'desc') {
      query = query.orderBy(desc(sortColumn));
    } else {
      query = query.orderBy(asc(sortColumn));
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
    const requestBody = await request.json();
    const { question, answer, sortOrder, isActive } = requestBody;

    // Validate required fields
    if (!question) {
      return NextResponse.json({ 
        error: "Question is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!answer) {
      return NextResponse.json({ 
        error: "Answer is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedQuestion = question.trim();
    const sanitizedAnswer = answer.trim();

    if (!sanitizedQuestion) {
      return NextResponse.json({ 
        error: "Question cannot be empty",
        code: "INVALID_FIELD_VALUE" 
      }, { status: 400 });
    }

    if (!sanitizedAnswer) {
      return NextResponse.json({ 
        error: "Answer cannot be empty",
        code: "INVALID_FIELD_VALUE" 
      }, { status: 400 });
    }

    const insertData = {
      question: sanitizedQuestion,
      answer: sanitizedAnswer,
      sortOrder: sortOrder !== undefined ? sortOrder : 0,
      isActive: isActive !== undefined ? isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newFaq = await db.insert(faqs)
      .values(insertData)
      .returning();

    return NextResponse.json(newFaq[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const requestBody = await request.json();
    const { question, answer, sortOrder, isActive } = requestBody;

    // Check if record exists
    const existingFaq = await db.select()
      .from(faqs)
      .where(eq(faqs.id, parseInt(id)))
      .limit(1);

    if (existingFaq.length === 0) {
      return NextResponse.json({ 
        error: 'FAQ not found' 
      }, { status: 404 });
    }

    // Validate fields if provided
    if (question !== undefined) {
      const sanitizedQuestion = question.trim();
      if (!sanitizedQuestion) {
        return NextResponse.json({ 
          error: "Question cannot be empty",
          code: "INVALID_FIELD_VALUE" 
        }, { status: 400 });
      }
    }

    if (answer !== undefined) {
      const sanitizedAnswer = answer.trim();
      if (!sanitizedAnswer) {
        return NextResponse.json({ 
          error: "Answer cannot be empty",
          code: "INVALID_FIELD_VALUE" 
        }, { status: 400 });
      }
    }

    // Prepare update data
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (question !== undefined) {
      updates.question = question.trim();
    }
    if (answer !== undefined) {
      updates.answer = answer.trim();
    }
    if (sortOrder !== undefined) {
      updates.sortOrder = sortOrder;
    }
    if (isActive !== undefined) {
      updates.isActive = isActive;
    }

    const updatedFaq = await db.update(faqs)
      .set(updates)
      .where(eq(faqs.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedFaq[0]);

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if record exists
    const existingFaq = await db.select()
      .from(faqs)
      .where(eq(faqs.id, parseInt(id)))
      .limit(1);

    if (existingFaq.length === 0) {
      return NextResponse.json({ 
        error: 'FAQ not found' 
      }, { status: 404 });
    }

    const deletedFaq = await db.delete(faqs)
      .where(eq(faqs.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'FAQ deleted successfully',
      deletedRecord: deletedFaq[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}