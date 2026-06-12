import { NextResponse } from 'next/server';
import { db } from '@/db';
import { subscriptionPlan } from '@/db/schema';
import { successResponse, errorResponse } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const plans = await db.select().from(subscriptionPlan);
    return successResponse(plans);
  } catch (error) {
    console.error('Fetch plans error:', error);
    return errorResponse('Failed to fetch plans', 500);
  }
}
