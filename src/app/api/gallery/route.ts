import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { gallery } from '@/db/schema';
import { eq, like, and, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse pagination parameters with defaults optimized for gallery grid
    const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Parse filter parameters
    const category = searchParams.get('category');
    
    // Validate pagination parameters
    if (isNaN(limit) || limit < 1) {
      return NextResponse.json({ 
        error: "Invalid limit parameter. Must be a positive integer.",
        code: "INVALID_LIMIT" 
      }, { status: 400 });
    }
    
    if (isNaN(offset) || offset < 0) {
      return NextResponse.json({ 
        error: "Invalid offset parameter. Must be a non-negative integer.",
        code: "INVALID_OFFSET" 
      }, { status: 400 });
    }

    // Build base query - only active gallery items
    let query = db.select().from(gallery);
    
    // Apply filters
    let whereConditions = [eq(gallery.status, 'active')];
    
    if (category) {
      whereConditions.push(eq(gallery.category, category));
    }
    
    // Apply all conditions
    if (whereConditions.length > 0) {
      query = query.where(and(...whereConditions));
    }
    
    // Apply sorting: orderPosition ASC, then createdAt DESC
    query = query
      .orderBy(asc(gallery.orderPosition), desc(gallery.createdAt))
      .limit(limit)
      .offset(offset);

    const results = await query;

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}