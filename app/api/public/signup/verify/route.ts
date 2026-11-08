import { NextRequest } from 'next/server';
import { db } from '@/db';
import { organizationNode, orgAdmin, organizationPlan, visitorType, subscriptionPlan, billingRecord } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { successResponse, errorResponse } from '@/lib/api-response';
import { hashPassword } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      planId,
      orgName,
      orgType,
      imageUrl,
      adminEmail,
      adminPassword,
    } = body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !planId || !orgName || !orgType || !imageUrl || !adminEmail || !adminPassword) {
      return errorResponse('All fields are required', 400);
    }

    // Verify signature. The key secret comes from the environment — it used to
    // be hardcoded here, so the old value is in git history and must be rotated.
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error('RAZORPAY_KEY_SECRET is not configured');
      return errorResponse('Payments are not configured', 500);
    }

    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    // timingSafeEqual over the hex digests: both are the same fixed length, so
    // comparing them this way avoids leaking information through compare time.
    const expected = Buffer.from(generatedSignature, 'utf8');
    const received = Buffer.from(String(razorpaySignature), 'utf8');
    if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
      return errorResponse('Payment signature verification failed', 400);
    }

    // Validate plan
    const [plan] = await db.select().from(subscriptionPlan).where(eq(subscriptionPlan.id, planId)).limit(1);
    if (!plan) return errorResponse('Plan not found', 404);

    // Create Organization Node
    const [newOrg] = await db.insert(organizationNode).values({
      name: orgName,
      type: orgType,
      imageUrl: imageUrl,
      status: 'active'
    }).$returningId();

    const orgId = newOrg.id;

    // Create Org Admin
    const hashedPassword = await hashPassword(adminPassword);
    const [newAdmin] = await db.insert(orgAdmin).values({
      organizationNodeId: orgId,
      email: adminEmail,
      passwordHash: hashedPassword,
      status: 'active',
      canManageHierarchy: true
    }).$returningId();

    // Assign Plan
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1); // 1 year plan

    await db.insert(organizationPlan).values({
      organizationNodeId: orgId,
      subscriptionPlanId: planId,
      startDate: startDate,
      endDate: endDate,
      status: 'active'
    });

    // Create Billing Record
    await db.insert(billingRecord).values({
      organizationNodeId: orgId,
      subscriptionPlanId: planId,
      paymentReference: razorpayPaymentId,
      amount: plan.price,
      status: 'paid'
    });

    // Seed Visitor Types
    const defaultVisitorTypes = [
      { name: 'Guest', defaultSecurityLevel: 1 },
      { name: 'Interview', defaultSecurityLevel: 2 },
      { name: 'Vendor', defaultSecurityLevel: 3 },
      { name: 'Delivery', defaultSecurityLevel: 1 },
      { name: 'VIP', defaultSecurityLevel: 4 },
    ];

    for (const vt of defaultVisitorTypes) {
      await db.insert(visitorType).values({
        organizationNodeId: orgId,
        name: vt.name,
        defaultSecurityLevel: vt.defaultSecurityLevel
      });
    }

    return successResponse({
      message: 'Signup successful',
      organizationId: orgId,
      adminId: newAdmin.id
    }, 201);

  } catch (error) {
    console.error('Signup verify error:', error);
    return errorResponse('Failed to complete signup process', 500);
  }
}
