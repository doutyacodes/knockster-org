import { NextRequest } from 'next/server';
import { db } from '@/db';
import { appConfig } from '@/db/schema';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

/**
 * GET /api/mobile-api/security/app-config
 * Check app configuration for security app (maintenance mode & force update)
 * No authentication required - must be accessible even when user is logged out
 */
export async function GET(request: NextRequest) {
  try {
    // Get the app configuration (should only have one row)
    const config = await db.select().from(appConfig).limit(1);

    if (!config || config.length === 0) {
      // If no config exists, return default values
      return successResponse({
        maintenance: false,
        maintenanceMessage: null,
        forceUpdate: false,
        minVersion: null,
      });
    }

    const appConfigData = config[0];

    return successResponse({
      maintenance: appConfigData.securityAppMaintenance,
      maintenanceMessage: appConfigData.securityAppMaintenanceMessage,
      forceUpdate: appConfigData.securityAppForceUpdate,
      minVersion: appConfigData.securityAppMinVersion,
    });
  } catch (error) {
    console.error('Error fetching security app config:', error);
    return serverErrorResponse('Failed to fetch app configuration');
  }
}
