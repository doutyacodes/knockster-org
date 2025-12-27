
import { Invitation, SecurityLevel, InvitationStatus, Guard, ScanLog, Alert } from '../types';

export const mockInvitations: Invitation[] = [
  {
    id: 'INV-001',
    employeeName: 'Sarah Jenkins',
    employeePhone: '+1 555-0101',
    guestName: 'David Miller',
    guestPhone: '+1 555-0202',
    validFrom: '2024-05-20T09:00:00',
    validTo: '2024-05-20T18:00:00',
    securityLevel: SecurityLevel.L1,
    status: InvitationStatus.ACTIVE,
    createdAt: '2024-05-18T14:30:00',
  },
  {
    id: 'INV-002',
    employeeName: 'Michael Chen',
    employeePhone: '+1 555-0303',
    guestName: 'Elena Rodriguez',
    guestPhone: '+1 555-0404',
    validFrom: '2024-05-21T10:00:00',
    validTo: '2024-05-21T14:00:00',
    securityLevel: SecurityLevel.L4,
    status: InvitationStatus.UPCOMING,
    createdAt: '2024-05-19T08:15:00',
  },
  {
    id: 'INV-003',
    employeeName: 'James Wilson',
    employeePhone: '+1 555-0505',
    guestName: 'Robert Brown',
    guestPhone: '+1 555-0606',
    validFrom: '2024-05-19T08:00:00',
    validTo: '2024-05-19T20:00:00',
    securityLevel: SecurityLevel.L2,
    status: InvitationStatus.EXPIRED,
    createdAt: '2024-05-17T11:00:00',
  },
];

export const mockGuards: Guard[] = [
  {
    id: 'G-001',
    username: 'guard_john_d',
    status: 'Active',
    shiftStart: '08:00',
    shiftEnd: '16:00',
    lastActive: '2024-05-20T11:45:00',
    device: 'Samsung Tab S7 (G-001-A)',
  },
  {
    id: 'G-002',
    username: 'guard_martha_s',
    status: 'Active',
    shiftStart: '16:00',
    shiftEnd: '00:00',
    lastActive: '2024-05-20T10:15:00',
    device: 'iPad Air 4 (G-002-B)',
  },
  {
    id: 'G-003',
    username: 'guard_steve_p',
    status: 'Inactive',
    shiftStart: '00:00',
    shiftEnd: '08:00',
    lastActive: '2024-05-19T23:55:00',
    device: 'Samsung Tab S7 (G-003-C)',
  },
];

export const mockLogs: ScanLog[] = [
  {
    id: 'LOG-1001',
    guestName: 'David Miller',
    scanTime: '2024-05-20T09:12:34',
    result: 'Success',
    securityLevel: SecurityLevel.L1,
  },
  {
    id: 'LOG-1002',
    guestName: 'Unknown Caller',
    scanTime: '2024-05-20T09:45:10',
    result: 'Failure',
    securityLevel: SecurityLevel.L2,
    reason: 'OTP Verification Failed (Too many attempts)',
  },
  {
    id: 'LOG-1003',
    guestName: 'Elena Rodriguez',
    scanTime: '2024-05-20T10:30:15',
    result: 'Success',
    securityLevel: SecurityLevel.L4,
  },
];

export const mockAlerts: Alert[] = [
  {
    id: 'ALT-001',
    type: 'OTP_FAILURE',
    message: 'Repeated OTP failure at Gate 04 - Block A',
    timestamp: '2024-05-20T10:45:00',
    severity: 'High',
  },
  {
    id: 'ALT-002',
    type: 'UNAUTHORIZED_ATTEMPT',
    message: 'Expired QR scanned at Main Entry',
    timestamp: '2024-05-20T11:15:00',
    severity: 'Medium',
  },
];
