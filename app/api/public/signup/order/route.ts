import { NextRequest } from 'next/server';
import { db } from '@/db';
import { subscriptionPlan } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { successResponse, errorResponse } from '@/lib/api-response';
import Razorpay from 'razorpay';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { planId } = body;

    if (!planId) {
      return errorResponse('Plan ID is required', 400);
    }

    // Verify plan
    const [plan] = await db
      .select()
      .from(subscriptionPlan)
      .where(eq(subscriptionPlan.id, planId))
      .limit(1);

    if (!plan) {
      return errorResponse('Plan not found', 404);
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: 'rzp_test_T0iBBSGAyaK3r3',
      key_secret: '3X3n9Xir5R4t52z5yZalRYvM',
    });

    const amountInPaise = Math.round(Number(plan.price) * 100);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${crypto.randomUUID().slice(0, 10)}`,
    };

    const order = await razorpay.orders.create(options);

    return successResponse({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      plan: {
        id: plan.id,
        name: plan.name,
        price: plan.price
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    return errorResponse('Failed to create Razorpay order', 500);
  }
}
