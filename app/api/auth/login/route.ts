import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { orgAdmin } from '@/db/schema';
import { verifyPassword, generateToken } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    // Find org admin by email
    const [admin] = await db
      .select()
      .from(orgAdmin)
      .where(eq(orgAdmin.email, email))
      .limit(1);

    if (!admin) {
      return unauthorizedResponse('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, admin.passwordHash);

    if (!isValidPassword) {
      return unauthorizedResponse('Invalid credentials');
    }

    // Generate JWT token
    const token = generateToken({
      id: admin.id,
      email: admin.email,
      role: 'orgadmin',
      organizationNodeId: admin.organizationNodeId,
    });

    // Return success with token and user data
    return successResponse({
      token,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        organizationNodeId: admin.organizationNodeId,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('An error occurred during login', 500);
  }
}
