import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { footerContacts } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse pagination parameters
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const contactTypeParam = searchParams.get('contactType');
    
    // Validate and set pagination defaults
    let limit = 10;
    let offset = 0;
    
    if (limitParam) {
      const parsedLimit = parseInt(limitParam);
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        return NextResponse.json({ 
          error: "Limit must be a positive integer",
          code: "INVALID_LIMIT" 
        }, { status: 400 });
      }
      limit = Math.min(parsedLimit, 100);
    }
    
    if (offsetParam) {
      const parsedOffset = parseInt(offsetParam);
      if (isNaN(parsedOffset) || parsedOffset < 0) {
        return NextResponse.json({ 
          error: "Offset must be a non-negative integer",
          code: "INVALID_OFFSET" 
        }, { status: 400 });
      }
      offset = parsedOffset;
    }
    
    // Validate contactType filter
    const validContactTypes = ['phone', 'email', 'fax'];
    if (contactTypeParam && !validContactTypes.includes(contactTypeParam)) {
      return NextResponse.json({ 
        error: "ContactType must be one of: phone, email, fax",
        code: "INVALID_CONTACT_TYPE" 
      }, { status: 400 });
    }
    
    // Build query
    let query = db.select({
      id: footerContacts.id,
      contactType: footerContacts.contactType,
      contactValue: footerContacts.contactValue,
      label: footerContacts.label,
      displayOrder: footerContacts.displayOrder
    }).from(footerContacts);
    
    // Apply filters
    let whereConditions = [eq(footerContacts.isActive, true)];
    
    if (contactTypeParam) {
      whereConditions.push(eq(footerContacts.contactType, contactTypeParam));
    }
    
    query = query.where(and(...whereConditions));
    
    // Apply sorting: displayOrder ascending, then by id
    query = query.orderBy(asc(footerContacts.displayOrder), asc(footerContacts.id));
    
    // Apply pagination
    query = query.limit(limit).offset(offset);
    
    // Execute query
    const results = await query;
    
    return NextResponse.json(results, { status: 200 });
    
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}