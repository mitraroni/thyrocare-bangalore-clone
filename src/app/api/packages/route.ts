import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { packages } from '@/db/schema';
import { like, and, or, desc, asc, isNull, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse pagination parameters
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const limit = limitParam ? Math.min(parseInt(limitParam), 100) : 10;
    const offset = offsetParam ? parseInt(offsetParam) : 0;
    
    // Validate pagination parameters
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
    
    // Parse search parameter
    const search = searchParams.get('search');
    
    // Parse sorting parameters
    const sortParam = searchParams.get('sort') || 'createdAt';
    const orderParam = searchParams.get('order') || 'desc';
    
    // Validate sorting parameters
    const validSortFields = ['price', 'name', 'createdAt'];
    const validOrderValues = ['asc', 'desc'];
    
    if (!validSortFields.includes(sortParam)) {
      return NextResponse.json({ 
        error: "Invalid sort parameter. Must be one of: price, name, createdAt",
        code: "INVALID_SORT" 
      }, { status: 400 });
    }
    
    if (!validOrderValues.includes(orderParam)) {
      return NextResponse.json({ 
        error: "Invalid order parameter. Must be asc or desc",
        code: "INVALID_ORDER" 
      }, { status: 400 });
    }
    
    // Build query
    let query = db.select().from(packages);
    
    // Filter for active packages where isFeatured is not explicitly false
    // This includes both true and null values
    const activeFilter = or(
      eq(packages.isFeatured, true),
      isNull(packages.isFeatured)
    );
    
    if (search) {
      const searchCondition = or(
        like(packages.name, `%${search}%`),
        like(packages.description, `%${search}%`)
      );
      
      query = query.where(and(activeFilter, searchCondition));
    } else {
      query = query.where(activeFilter);
    }
    
    // Apply sorting
    if (sortParam === 'price') {
      query = orderParam === 'desc' 
        ? query.orderBy(desc(packages.price))
        : query.orderBy(asc(packages.price));
    } else if (sortParam === 'name') {
      query = orderParam === 'desc' 
        ? query.orderBy(desc(packages.name))
        : query.orderBy(asc(packages.name));
    } else {
      query = orderParam === 'desc' 
        ? query.orderBy(desc(packages.createdAt))
        : query.orderBy(asc(packages.createdAt));
    }
    
    // Apply pagination
    const results = await query.limit(limit).offset(offset);
    
    // Transform results to include computed fields
    const transformedResults = results.map(pkg => {
      // Calculate test count from testsIncluded field
      let testCount = 0;
      if (pkg.testsIncluded) {
        const tests = pkg.testsIncluded.split(',').map(test => test.trim()).filter(test => test.length > 0);
        testCount = tests.length;
      }
      
      // Calculate discount percentage
      let discountPercentage = null;
      if (pkg.discountPrice && pkg.discountPrice < pkg.price) {
        discountPercentage = Math.round(((pkg.price - pkg.discountPrice) / pkg.price) * 100);
      }
      
      return {
        id: pkg.id,
        name: pkg.name,
        description: pkg.description || '',
        testsIncluded: pkg.testsIncluded || '',
        testCount,
        price: pkg.price,
        originalPrice: pkg.price,
        discountPrice: pkg.discountPrice,
        discountPercentage,
        isFeatured: pkg.isFeatured || false,
        createdAt: pkg.createdAt,
        updatedAt: pkg.updatedAt
      };
    });
    
    return NextResponse.json(transformedResults, { status: 200 });
    
  } catch (error) {
    console.error('GET packages error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}