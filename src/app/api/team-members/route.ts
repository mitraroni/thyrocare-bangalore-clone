import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { teamMembers } from '@/db/schema';
import { eq, like, and, or, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let query = db.select({
      id: teamMembers.id,
      name: teamMembers.name,
      designation: teamMembers.designation,
      bio: teamMembers.bio,
      imageUrl: teamMembers.imageUrl,
      socialLinks: teamMembers.socialLinks,
      orderPosition: teamMembers.orderPosition
    }).from(teamMembers);

    // Always filter for active team members only
    let whereCondition = eq(teamMembers.status, 'active');

    // Add search functionality if search parameter is provided
    if (search) {
      const searchCondition = or(
        like(teamMembers.name, `%${search}%`),
        like(teamMembers.designation, `%${search}%`)
      );
      whereCondition = and(whereCondition, searchCondition);
    }

    query = query.where(whereCondition);

    // Default sorting: by orderPosition ascending, then by name ascending
    query = query.orderBy(asc(teamMembers.orderPosition), asc(teamMembers.name));

    const results = await query;

    // Parse socialLinks JSON for each team member
    const formattedResults = results.map(member => ({
      ...member,
      socialLinks: member.socialLinks ? 
        (typeof member.socialLinks === 'string' ? 
          JSON.parse(member.socialLinks) : 
          member.socialLinks) : 
        null
    }));

    return NextResponse.json(formattedResults);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}