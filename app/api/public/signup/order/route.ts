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

    // Credentials come from the environment. They were previously hardcoded
    // here and in signup/verify, which committed a live key secret to git
    // history — rotate the key pair in the Razorpay dashboard, because the old
    // secret must be treated as compromised regardless of this change.
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay credentials are not configured');
      return errorResponse('Payments are not configured', 500);
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
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
