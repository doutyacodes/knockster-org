import { NextRequest } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { guest, guestDevice, notificationTokens } from '@/db/schema';
import { generateToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import crypto from 'crypto';

// POST /api/mobile-api/guest/login - Guest login with phone number (OTP-less for now)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, name, deviceInfo, deviceToken, platform } = body;

    if (!phone) {
      return errorResponse('Phone number is required', 400);
    }

    // Find or create guest by phone
    let guestData = await db
      .select()
      .from(guest)
      .where(eq(guest.phone, phone))
      .limit(1);

    let guestUser;

    if (guestData.length === 0) {
      // Create new guest
      if (!name) {
        return errorResponse('Name is required for new guests', 400);
      }

      const newGuestId = crypto.randomUUID();
      await db.insert(guest).values({
        id: newGuestId,
        phone,
        name,
      });

      guestUser = {
        id: newGuestId,
        phone,
        name,
        createdAt: new Date(),
      };
    } else {
      guestUser = guestData[0];

      // Update name if provided and different
      if (name && name !== guestUser.name) {
        await db
          .update(guest)
          .set({ name })
          .where(eq(guest.id, guestUser.id));
        guestUser.name = name;
      }
    }

    // Register/update device if provided
    if (deviceInfo) {
      const { deviceModel, osVersion } = deviceInfo;

      // Check if device already exists for this guest
      const existingDevice = await db
        .select()
        .from(guestDevice)
        .where(eq(guestDevice.guestId, guestUser.id))
        .limit(1);

      if (existingDevice.length > 0) {
        // Update existing device
        await db
          .update(guestDevice)
          .set({
            deviceModel: deviceModel || existingDevice[0].deviceModel,
            osVersion: osVersion || existingDevice[0].osVersion,
            lastActive: new Date(),
          })
          .where(eq(guestDevice.guestId, guestUser.id));
      } else {
        // Insert new device
        await db.insert(guestDevice).values({
          id: crypto.randomUUID(),
          guestId: guestUser.id,
          deviceModel: deviceModel || 'unknown',
          osVersion: osVersion || 'unknown',
          lastActive: new Date(),
        });
      }
    }

    // Store device notification token if provided
    if (deviceToken) {
      try {
        // Check if token already exists for this guest
        const existingToken = await db
          .select({
            id: notificationTokens.id,
            isActive: notificationTokens.isActive,
          })
          .from(notificationTokens)
          .where(
            and(
              eq(notificationTokens.guestId, guestUser.id),
              eq(notificationTokens.deviceToken, deviceToken)
            )
          )
          .limit(1);

        if (existingToken.length > 0) {
          // Token exists - update if inactive
          if (!existingToken[0].isActive) {
            await db
              .update(notificationTokens)
              .set({ isActive: true })
              .where(eq(notificationTokens.id, existingToken[0].id));
          }
        } else {
          // Insert new token with platform (defaults to 'android' if not provided)
          await db.insert(notificationTokens).values({
            id: crypto.randomUUID(),
            guestId: guestUser.id,
            deviceToken: deviceToken,
            platform: platform || 'android',
            isActive: true,
          });
        }
      } catch (notifError) {
        // Silently fail notification token registration
        console.error('Failed to register notification token:', notifError);
      }
    }

    // Generate JWT token
    const token = generateToken({
      id: guestUser.id,
      phone: guestUser.phone,
      role: 'guest',
    });

    return successResponse({
      token,
      guest: {
        id: guestUser.id,
        name: guestUser.name,
        phone: guestUser.phone,
      },
    }, 'Login successful');

  } catch (error) {
    console.error('Guest login error:', error);
    return errorResponse('Login failed', 500);
  }
}