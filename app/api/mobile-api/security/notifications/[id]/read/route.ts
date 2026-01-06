import { NextRequest } from 'next/server';
import { db } from '@/db';
import { notifications, notificationReads } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from '@/lib/api-response';
import { nowUTC } from '@/lib/timezone';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * POST /api/mobile-api/security/notifications/[id]/read
 * Mark a notification as read for the authenticated security personnel
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the request
    const authResult = await authenticateRequest(request);
    if (!authResult.authenticated || authResult.role !== 'guard') {
      return unauthorizedResponse('Authentication required');
    }

    const securityPersonnelId = authResult.userId;
    const notificationId = params.id;

    // Check if notification exists and is for security personnel
    const notification = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.recipientType, 'security')
        )
      )
      .limit(1);

    if (!notification || notification.length === 0) {
      return notFoundResponse('Notification not found');
    }

    // Check if already marked as read by this security personnel
    const existingRead = await db
      .select()
      .from(notificationReads)
      .where(
        and(
          eq(notificationReads.notificationId, notificationId),
          eq(notificationReads.securityPersonnelId, securityPersonnelId)
        )
      )
      .limit(1);

    if (existingRead.length > 0) {
      return successResponse(
        { message: 'Notification already marked as read' },
        'Notification already marked as read'
      );
    }

    // Insert read record
    await db.insert(notificationReads).values({
      id: crypto.randomUUID(),
      notificationId: notificationId,
      securityPersonnelId: securityPersonnelId,
      readAt: nowUTC(),
    });

    return successResponse(
      { message: 'Notification marked as read' },
      'Notification marked as read'
    );
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return serverErrorResponse('Failed to mark notification as read');
  }
}
