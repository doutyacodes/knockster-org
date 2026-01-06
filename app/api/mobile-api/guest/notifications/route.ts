import { NextRequest } from 'next/server';
import { db } from '@/db';
import { notifications, notificationReads } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';
import { convertDatesToIST } from '@/lib/timezone';

export const dynamic = 'force-dynamic';

/**
 * GET /api/mobile-api/guest/notifications
 * Get all notifications for guests (broadcast) and mark which ones this guest has read
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const authResult = await authenticateRequest(request);
    if (!authResult.authenticated || authResult.role !== 'guest') {
      return unauthorizedResponse('Authentication required');
    }

    const guestId = authResult.userId;

    // Get all notifications for guests
    const allNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.recipientType, 'guest'))
      .orderBy(desc(notifications.sentAt));

    // Get all read statuses for this guest
    const readStatuses = await db
      .select()
      .from(notificationReads)
      .where(eq(notificationReads.guestId, guestId));

    // Create a map of read notification IDs for quick lookup
    const readNotificationIds = new Set(readStatuses.map((r) => r.notificationId));

    // Map notifications with isRead status
    const notificationsWithReadStatus = allNotifications.map((notification) => {
      const readRecord = readStatuses.find((r) => r.notificationId === notification.id);
      return {
        id: notification.id,
        title: notification.title,
        body: notification.body,
        type: notification.notificationType,
        relatedEntityId: notification.relatedEntityId,
        isRead: readNotificationIds.has(notification.id),
        sentAt: notification.sentAt,
        readAt: readRecord?.readAt || null,
      };
    });

    // Convert timestamps to IST
    const formattedNotifications = notificationsWithReadStatus.map((notification) =>
      convertDatesToIST(notification, ['sentAt', 'readAt'])
    );

    // Get unread count
    const unreadCount = notificationsWithReadStatus.filter((n) => !n.isRead).length;

    return successResponse({
      notifications: formattedNotifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return serverErrorResponse('Failed to fetch notifications');
  }
}
