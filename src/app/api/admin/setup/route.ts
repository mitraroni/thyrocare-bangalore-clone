import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, account } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    // Check if any users already exist in the system
    const existingUsers = await db.select().from(user).limit(1);
    
    if (existingUsers.length > 0) {
      return NextResponse.json({ 
        error: 'System already setup',
        code: 'SYSTEM_ALREADY_SETUP' 
      }, { status: 400 });
    }

    const requestBody = await request.json();
    const { name, email, password } = requestBody;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ 
        error: 'Name is required',
        code: 'MISSING_NAME' 
      }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ 
        error: 'Email is required',
        code: 'MISSING_EMAIL' 
      }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ 
        error: 'Password is required',
        code: 'MISSING_PASSWORD' 
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        error: 'Valid email is required',
        code: 'INVALID_EMAIL' 
      }, { status: 400 });
    }

    // Validate password strength (minimum 8 characters)
    if (password.length < 8) {
      return NextResponse.json({ 
        error: 'Password must be at least 8 characters long',
        code: 'PASSWORD_TOO_SHORT' 
      }, { status: 400 });
    }

    // Generate unique ID for the user
    const userId = nanoid();
    
    // Hash the password with bcrypt (salt rounds 12)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the user record
    const newUser = await db.insert(user).values({
      id: userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    // Create the account record with hashed password
    await db.insert(account).values({
      id: nanoid(),
      accountId: userId,
      providerId: 'credential',
      userId: userId,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Return success response without password
    const { password: _, ...userResponse } = {
      ...newUser[0],
      message: 'Admin user created successfully'
    };

    return NextResponse.json({
      message: 'Admin user created successfully',
      user: {
        id: newUser[0].id,
        name: newUser[0].name,
        email: newUser[0].email,
        emailVerified: newUser[0].emailVerified,
        createdAt: newUser[0].createdAt,
        updatedAt: newUser[0].updatedAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    
    // Handle unique constraint violations (duplicate email)
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ 
        error: 'Email already exists',
        code: 'EMAIL_EXISTS' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

// Only allow POST method
export async function GET() {
  return NextResponse.json({ 
    error: 'Method not allowed',
    code: 'METHOD_NOT_ALLOWED' 
  }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ 
    error: 'Method not allowed',
    code: 'METHOD_NOT_ALLOWED' 
  }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ 
    error: 'Method not allowed',
    code: 'METHOD_NOT_ALLOWED' 
  }, { status: 405 });
}