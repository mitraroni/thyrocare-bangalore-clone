import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, account } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation - minimum 8 characters
const validatePassword = (password: string): boolean => {
  return password && password.length >= 8;
};

// Validate email format
const validateEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    let query = db.select({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }).from(user);

    if (search) {
      const searchCondition = or(
        like(user.name, `%${search}%`),
        like(user.email, `%${search}%`)
      );
      query = query.where(searchCondition);
    }

    // Apply sorting
    if (sort === 'name') {
      query = order === 'asc' ? query.orderBy(asc(user.name)) : query.orderBy(desc(user.name));
    } else if (sort === 'email') {
      query = order === 'asc' ? query.orderBy(asc(user.email)) : query.orderBy(desc(user.email));
    } else {
      query = order === 'asc' ? query.orderBy(asc(user.createdAt)) : query.orderBy(desc(user.createdAt));
    }

    const results = await query.limit(limit).offset(offset);
    return NextResponse.json(results);

  } catch (error) {
    console.error('GET users error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const requestBody = await request.json();
    const { name, email, password, emailVerified = true, image } = requestBody;

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody || 'id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({ 
        error: "Name, email, and password are required",
        code: "MISSING_REQUIRED_FIELDS" 
      }, { status: 400 });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json({ 
        error: "Invalid email format",
        code: "INVALID_EMAIL" 
      }, { status: 400 });
    }

    // Validate password strength
    if (!validatePassword(password)) {
      return NextResponse.json({ 
        error: "Password must be at least 8 characters long",
        code: "WEAK_PASSWORD" 
      }, { status: 400 });
    }

    // Check for duplicate email
    const existingUser = await db.select()
      .from(user)
      .where(eq(user.email, email.toLowerCase().trim()))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({ 
        error: "Email already exists",
        code: "DUPLICATE_EMAIL" 
      }, { status: 409 });
    }

    // Generate unique user ID and hash password
    const userId = nanoid();
    const hashedPassword = await bcrypt.hash(password, 12);
    const now = new Date();

    // Create user record
    const newUser = await db.insert(user)
      .values({
        id: userId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        emailVerified: emailVerified,
        image: image || null,
        createdAt: now,
        updatedAt: now
      })
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      });

    // Store password in account table
    await db.insert(account)
      .values({
        id: nanoid(),
        accountId: userId,
        providerId: 'credential',
        userId: userId,
        password: hashedPassword,
        createdAt: now,
        updatedAt: now
      });

    return NextResponse.json(newUser[0], { status: 201 });

  } catch (error) {
    console.error('POST users error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        error: "User ID is required",
        code: "MISSING_ID" 
      }, { status: 400 });
    }

    const requestBody = await request.json();
    const { name, email, password, emailVerified, image } = requestBody;

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody || 'id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await db.select()
      .from(user)
      .where(eq(user.id, id))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND' 
      }, { status: 404 });
    }

    // Validate email if provided
    if (email && !validateEmail(email)) {
      return NextResponse.json({ 
        error: "Invalid email format",
        code: "INVALID_EMAIL" 
      }, { status: 400 });
    }

    // Check for duplicate email if email is being changed
    if (email && email.toLowerCase().trim() !== existingUser[0].email) {
      const duplicateCheck = await db.select()
        .from(user)
        .where(eq(user.email, email.toLowerCase().trim()))
        .limit(1);

      if (duplicateCheck.length > 0) {
        return NextResponse.json({ 
          error: "Email already exists",
          code: "DUPLICATE_EMAIL" 
        }, { status: 409 });
      }
    }

    // Validate password if provided
    if (password && !validatePassword(password)) {
      return NextResponse.json({ 
        error: "Password must be at least 8 characters long",
        code: "WEAK_PASSWORD" 
      }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    };

    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email.toLowerCase().trim();
    if (emailVerified !== undefined) updateData.emailVerified = emailVerified;
    if (image !== undefined) updateData.image = image;

    // Update user record
    const updatedUser = await db.update(user)
      .set(updateData)
      .where(eq(user.id, id))
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      });

    // Update password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12);
      await db.update(account)
        .set({
          password: hashedPassword,
          updatedAt: new Date()
        })
        .where(and(eq(account.userId, id), eq(account.providerId, 'credential')));
    }

    return NextResponse.json(updatedUser[0]);

  } catch (error) {
    console.error('PUT users error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        error: "User ID is required",
        code: "MISSING_ID" 
      }, { status: 400 });
    }

    // Prevent self-deletion
    if (id === currentUser.id) {
      return NextResponse.json({ 
        error: "Cannot delete your own account",
        code: "SELF_DELETE_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await db.select()
      .from(user)
      .where(eq(user.id, id))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND' 
      }, { status: 404 });
    }

    // Delete user (cascade will handle related records)
    const deletedUser = await db.delete(user)
      .where(eq(user.id, id))
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      });

    return NextResponse.json({
      message: 'User deleted successfully',
      deletedUser: deletedUser[0]
    });

  } catch (error) {
    console.error('DELETE users error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}