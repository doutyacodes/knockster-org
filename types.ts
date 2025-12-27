
export enum SecurityLevel {
  L1 = 'L1',
  L2 = 'L2',
  L3 = 'L3',
  L4 = 'L4'
}

export enum InvitationStatus {
  ACTIVE = 'Active',
  UPCOMING = 'Upcoming',
  EXPIRED = 'Expired',
  REVOKED = 'Revoked'
}

export interface Invitation {
  id: string;
  employeeName: string;
  employeePhone: string;
  guestName: string;
  guestPhone: string;
  validFrom: string;
  validTo: string;
  securityLevel: SecurityLevel;
  status: InvitationStatus;
  createdAt: string;
}

export interface Guard {
  id: string;
  username: string;
  status: 'Active' | 'Inactive';
  shiftStart: string;
  shiftEnd: string;
  lastActive: string;
  device: string;
}

export interface ScanLog {
  id: string;
  guestName: string;
  scanTime: string;
  result: 'Success' | 'Failure';
  securityLevel: SecurityLevel;
  reason?: string;
}

export interface Alert {
  id: string;
  type: 'OTP_FAILURE' | 'EXPIRATION' | 'UNAUTHORIZED_ATTEMPT';
  message: string;
  timestamp: string;
  severity: 'High' | 'Medium' | 'Low';
}
