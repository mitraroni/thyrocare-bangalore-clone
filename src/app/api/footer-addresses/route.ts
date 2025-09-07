import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { footerAddresses } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Validate and parse pagination parameters
    const limitParam = searchParams.get('limit') || '10';
    const offsetParam = searchParams.get('offset') || '0';
    
    const limit = parseInt(limitParam);
    const offset = parseInt(offsetParam);
    
    // Validate pagination parameters
    if (isNaN(limit) || limit < 1) {
      return NextResponse.json({ 
        error: "Limit must be a valid positive integer",
        code: "INVALID_LIMIT" 
      }, { status: 400 });
    }
    
    if (isNaN(offset) || offset < 0) {
      return NextResponse.json({ 
        error: "Offset must be a valid non-negative integer",
        code: "INVALID_OFFSET" 
      }, { status: 400 });
    }
    
    // Enforce maximum limit
    const effectiveLimit = Math.min(limit, 100);
    
    // Query active addresses with sorting and pagination
    const addresses = await db.select({
      id: footerAddresses.id,
      addressLine1: footerAddresses.addressLine1,
      addressLine2: footerAddresses.addressLine2,
      city: footerAddresses.city,
      state: footerAddresses.state,
      postalCode: footerAddresses.postalCode,
      country: footerAddresses.country,
      displayOrder: footerAddresses.displayOrder
    })
    .from(footerAddresses)
    .where(eq(footerAddresses.isActive, true))
    .orderBy(asc(footerAddresses.displayOrder), asc(footerAddresses.id))
    .limit(effectiveLimit)
    .offset(offset);
    
    return NextResponse.json(addresses);
    
  } catch (error) {
    console.error('GET footer addresses error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}