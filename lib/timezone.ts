import { DateTime } from 'luxon';

/**
 * Timezone utility for converting between UTC and IST (Asia/Kolkata)
 *
 * Database stores everything in UTC
 * Display to users in IST
 */

export const IST_ZONE = 'Asia/Kolkata';

/**
 * Convert a UTC Date to IST formatted string
 * @param date - UTC Date object from database
 * @returns ISO string in IST timezone (YYYY-MM-DD HH:mm:ss)
 */
export function toIST(date: Date | null | undefined): string | null {
  if (!date) return null;

  return DateTime.fromJSDate(date, { zone: 'utc' })
    .setZone(IST_ZONE)
    .toFormat('yyyy-MM-dd HH:mm:ss');
}

/**
 * Convert a UTC Date to IST Date object
 * @param date - UTC Date object from database
 * @returns Date object representing the same moment in IST
 */
export function toISTDate(date: Date | null | undefined): Date | null {
  if (!date) return null;

  return DateTime.fromJSDate(date, { zone: 'utc' })
    .setZone(IST_ZONE)
    .toJSDate();
}

/**
 * Convert an IST string or Date to UTC Date for database storage
 * @param istInput - Date string or Date object from user input (assumed to be IST)
 * @returns UTC Date object for database
 */
export function fromIST(istInput: string | Date): Date {
  if (istInput instanceof Date) {
    // If it's already a Date object, convert from IST to UTC
    return DateTime.fromJSDate(istInput, { zone: IST_ZONE })
      .toUTC()
      .toJSDate();
  }

  // Parse ISO string as IST and convert to UTC
  return DateTime.fromISO(istInput, { zone: IST_ZONE })
    .toUTC()
    .toJSDate();
}

/**
 * Get current time in IST as formatted string
 * @returns Current IST time (YYYY-MM-DD HH:mm:ss)
 */
export function nowIST(): string {
  return DateTime.now().setZone(IST_ZONE).toFormat('yyyy-MM-dd HH:mm:ss');
}

/**
 * Get current time in UTC as Date object (for database)
 * @returns Current UTC time as Date
 */
export function nowUTC(): Date {
  return DateTime.utc().toJSDate();
}

/**
 * Convert a UTC Date to IST formatted string for display (with date only)
 * @param date - UTC Date object from database
 * @returns Date string in IST (YYYY-MM-DD)
 */
export function toISTDateOnly(date: Date | null | undefined): string | null {
  if (!date) return null;

  return DateTime.fromJSDate(date, { zone: 'utc' })
    .setZone(IST_ZONE)
    .toFormat('yyyy-MM-dd');
}

/**
 * Convert a UTC Date to IST formatted string for display (with time only)
 * @param date - UTC Date object from database
 * @returns Time string in IST (HH:mm:ss)
 */
export function toISTTimeOnly(date: Date | null | undefined): string | null {
  if (!date) return null;

  return DateTime.fromJSDate(date, { zone: 'utc' })
    .setZone(IST_ZONE)
    .toFormat('HH:mm:ss');
}

/**
 * Convert an object's date fields from UTC to IST
 * Useful for converting database results before sending to frontend
 * @param obj - Object with date fields
 * @param dateFields - Array of field names that contain dates
 * @returns New object with converted date fields
 */
export function convertDatesToIST<T extends Record<string, any>>(
  obj: T,
  dateFields: (keyof T)[]
): T {
  const converted = { ...obj };

  for (const field of dateFields) {
    if (converted[field] instanceof Date) {
      converted[field] = toIST(converted[field] as Date) as any;
    }
  }

  return converted;
}

/**
 * Convert an array of objects' date fields from UTC to IST
 * @param array - Array of objects with date fields
 * @param dateFields - Array of field names that contain dates
 * @returns New array with converted date fields
 */
export function convertArrayDatesToIST<T extends Record<string, any>>(
  array: T[],
  dateFields: (keyof T)[]
): T[] {
  return array.map(obj => convertDatesToIST(obj, dateFields));
}

/**
 * Parse time string (HH:mm or HH:mm:ss) and create UTC Date for today
 * Used for shift times that don't have a specific date
 * @param timeString - Time in format HH:mm or HH:mm:ss
 * @returns UTC Date object
 */
export function parseTimeToUTC(timeString: string): Date {
  const [hours, minutes, seconds = '0'] = timeString.split(':');

  return DateTime.utc()
    .set({
      hour: parseInt(hours),
      minute: parseInt(minutes),
      second: parseInt(seconds),
      millisecond: 0
    })
    .toJSDate();
}

/**
 * Format a Date object to time string (HH:mm:ss)
 * @param date - Date object or string
 * @returns Time string in IST (HH:mm:ss)
 */
export function formatTimeIST(date: Date | string | null | undefined): string | null {
  if (!date) return null;

  // Handle both Date objects and string inputs
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return DateTime.fromJSDate(dateObj)
    .setZone(IST_ZONE)
    .toFormat('HH:mm:ss');
}
