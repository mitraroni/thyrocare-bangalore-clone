import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { testimonials } from '@/db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const sortParam = searchParams.get('sort');
    const orderParam = searchParams.get('order');
    const ratingParam = searchParams.get('rating');
    
    // Validate and set pagination parameters
    const limit = limitParam ? Math.min(parseInt(limitParam), 50) : 10;
    const offset = offsetParam ? parseInt(offsetParam) : 0;
    
    if (limitParam && isNaN(limit)) {
      return NextResponse.json({ 
        error: "Invalid limit parameter",
        code: "INVALID_LIMIT" 
      }, { status: 400 });
    }
    
    if (offsetParam && isNaN(offset)) {
      return NextResponse.json({ 
        error: "Invalid offset parameter",
        code: "INVALID_OFFSET" 
      }, { status: 400 });
    }
    
    // Validate rating parameter
    let ratingFilter = null;
    if (ratingParam) {
      const rating = parseInt(ratingParam);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        return NextResponse.json({ 
          error: "Rating must be between 1 and 5",
          code: "INVALID_RATING" 
        }, { status: 400 });
      }
      ratingFilter = rating;
    }
    
    // Validate sort parameter
    const validSortFields = ['createdAt', 'rating', 'name'];
    const sortField = sortParam && validSortFields.includes(sortParam) ? sortParam : 'rating';
    const sortOrder = orderParam === 'asc' ? 'asc' : 'desc';
    
    if (sortParam && !validSortFields.includes(sortParam)) {
      return NextResponse.json({ 
        error: "Invalid sort field. Valid options: createdAt, rating, name",
        code: "INVALID_SORT_FIELD" 
      }, { status: 400 });
    }
    
    // Build query
    let query = db.select({
      id: testimonials.id,
      name: testimonials.name,
      designation: testimonials.designation,
      company: testimonials.company,
      content: testimonials.content,
      rating: testimonials.rating,
      imageUrl: testimonials.imageUrl,
      status: testimonials.status,
      createdAt: testimonials.createdAt,
      updatedAt: testimonials.updatedAt
    }).from(testimonials);
    
    // Always filter for active testimonials
    let whereConditions = [eq(testimonials.status, 'active')];
    
    // Add rating filter if specified
    if (ratingFilter) {
      whereConditions.push(eq(testimonials.rating, ratingFilter));
    }
    
    // Apply where conditions
    query = query.where(and(...whereConditions));
    
    // Apply sorting - default is rating desc, then createdAt desc
    if (sortField === 'rating') {
      if (sortOrder === 'desc') {
        query = query.orderBy(desc(testimonials.rating), desc(testimonials.createdAt));
      } else {
        query = query.orderBy(asc(testimonials.rating), desc(testimonials.createdAt));
      }
    } else if (sortField === 'createdAt') {
      if (sortOrder === 'desc') {
        query = query.orderBy(desc(testimonials.createdAt));
      } else {
        query = query.orderBy(asc(testimonials.createdAt));
      }
    } else if (sortField === 'name') {
      if (sortOrder === 'desc') {
        query = query.orderBy(desc(testimonials.name), desc(testimonials.rating));
      } else {
        query = query.orderBy(asc(testimonials.name), desc(testimonials.rating));
      }
    }
    
    // Apply pagination
    const results = await query.limit(limit).offset(offset);
    
    return NextResponse.json(results, { status: 200 });
    
  } catch (error) {
    console.error('GET testimonials error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}