import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, account } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate required fields
    if (!email) {
      return NextResponse.json({ 
        error: "Email is required",
        code: "MISSING_EMAIL",
        debug: {
          receivedFields: Object.keys(await request.json())
        }
      }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ 
        error: "Password is required",
        code: "MISSING_PASSWORD",
        debug: {
          receivedFields: Object.keys(await request.json())
        }
      }, { status: 400 });
    }

    console.log('🔍 Testing authentication for email:', email);

    // Step 1: Look up user by email
    const userResult = await db.select()
      .from(user)
      .where(eq(user.email, email.toLowerCase().trim()))
      .limit(1);

    console.log('👤 User lookup result:', userResult.length > 0 ? 'Found' : 'Not found');

    if (userResult.length === 0) {
      return NextResponse.json({
        success: false,
        error: "User not found",
        code: "USER_NOT_FOUND",
        debug: {
          step: "user_lookup",
          searchedEmail: email.toLowerCase().trim(),
          userFound: false,
          accountChecked: false,
          passwordVerified: false
        }
      }, { status: 404 });
    }

    const foundUser = userResult[0];
    console.log('✅ User found:', { id: foundUser.id, email: foundUser.email, name: foundUser.name });

    // Step 2: Look up account with providerId 'credential'
    const accountResult = await db.select()
      .from(account)
      .where(and(
        eq(account.userId, foundUser.id),
        eq(account.providerId, 'credential')
      ))
      .limit(1);

    console.log('🔐 Account lookup result:', accountResult.length > 0 ? 'Found' : 'Not found');

    if (accountResult.length === 0) {
      return NextResponse.json({
        success: false,
        error: "Credential account not found",
        code: "CREDENTIAL_ACCOUNT_NOT_FOUND",
        debug: {
          step: "account_lookup",
          searchedEmail: email.toLowerCase().trim(),
          userFound: true,
          userId: foundUser.id,
          accountChecked: true,
          credentialAccountFound: false,
          passwordVerified: false
        }
      }, { status: 404 });
    }

    const foundAccount = accountResult[0];
    console.log('✅ Credential account found:', { 
      id: foundAccount.id, 
      userId: foundAccount.userId, 
      providerId: foundAccount.providerId,
      hasPassword: !!foundAccount.password 
    });

    // Step 3: Verify password exists in account
    if (!foundAccount.password) {
      return NextResponse.json({
        success: false,
        error: "No password hash found in account",
        code: "NO_PASSWORD_HASH",
        debug: {
          step: "password_check",
          searchedEmail: email.toLowerCase().trim(),
          userFound: true,
          userId: foundUser.id,
          accountChecked: true,
          credentialAccountFound: true,
          passwordHashExists: false,
          passwordVerified: false
        }
      }, { status: 400 });
    }

    // Step 4: Compare password with bcrypt
    console.log('🔒 Comparing password with hash...');
    const passwordMatch = await bcrypt.compare(password, foundAccount.password);
    console.log('🔓 Password verification result:', passwordMatch ? 'Match' : 'No match');

    if (!passwordMatch) {
      return NextResponse.json({
        success: false,
        error: "Invalid password",
        code: "INVALID_PASSWORD",
        debug: {
          step: "password_verification",
          searchedEmail: email.toLowerCase().trim(),
          userFound: true,
          userId: foundUser.id,
          accountChecked: true,
          credentialAccountFound: true,
          passwordHashExists: true,
          passwordVerified: false
        }
      }, { status: 401 });
    }

    // Step 5: Success - return user info without password
    const { password: _, ...userWithoutPassword } = foundUser;
    
    console.log('🎉 Authentication test successful for user:', foundUser.email);

    return NextResponse.json({
      success: true,
      message: "Authentication test successful",
      user: userWithoutPassword,
      debug: {
        step: "complete",
        searchedEmail: email.toLowerCase().trim(),
        userFound: true,
        userId: foundUser.id,
        accountChecked: true,
        credentialAccountFound: true,
        passwordHashExists: true,
        passwordVerified: true,
        accountDetails: {
          accountId: foundAccount.id,
          providerId: foundAccount.providerId,
          createdAt: foundAccount.createdAt,
          updatedAt: foundAccount.updatedAt
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error('🚨 Authentication test error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error during authentication test: ' + error,
      code: "INTERNAL_ERROR",
      debug: {
        step: "error",
        errorType: error?.constructor?.name || 'Unknown',
        errorMessage: error?.message || 'Unknown error'
      }
    }, { status: 500 });
  }
}