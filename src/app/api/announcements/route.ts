import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { announcements } from '@/db/schema';
import { eq, and, lte, gte, or, isNull, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    // Get current date in ISO format for comparison
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Build the base query for active announcements
    let query = db.select().from(announcements);
    
    // Build conditions array
    const conditions = [
      eq(announcements.status, 'active'),
      lte(announcements.startDate, currentDate)
    ];
    
    // Add end date condition - either null (indefinite) or current date <= endDate
    conditions.push(
      or(
        isNull(announcements.endDate),
        gte(announcements.endDate, currentDate)
      )
    );
    
    // Add type filter if provided
    if (type) {
      // Validate type parameter
      const validTypes = ['info', 'warning', 'success'];
      if (!validTypes.includes(type)) {
        return NextResponse.json({ 
          error: "Invalid type parameter. Must be one of: info, warning, success",
          code: "INVALID_TYPE" 
        }, { status: 400 });
      }
      conditions.push(eq(announcements.type, type));
    }
    
    // Apply all conditions
    query = query.where(and(...conditions));
    
    // Sort by startDate descending (newest first)
    query = query.orderBy(desc(announcements.startDate));
    
    const results = await query;
    
    return NextResponse.json(results, { status: 200 });
    
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}