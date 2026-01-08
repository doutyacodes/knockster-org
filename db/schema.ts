import {
  mysqlTable,
  varchar,
  boolean,
  timestamp,
  int,
  decimal,
  json,
  mysqlEnum,
  text
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// ==================== TABLES ====================

// 1. SuperAdmin
export const superAdmin = mysqlTable('super_admin', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  twoFactorEnabled: boolean('two_factor_enabled').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. Organization Node (Hierarchical Tree)
export const organizationNode = mysqlTable('organization_node', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  parentId: varchar('parent_id', { length: 36 }),
  name: varchar('name', { length: 255 }).notNull(),
  type: mysqlEnum('type', ['techpark', 'block', 'building', 'company', 'gate', 'custom']).notNull(),
  planOverrideLevel: int('plan_override_level'),
  status: mysqlEnum('status', ['active', 'suspended']).default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 3. Subscription Plan
export const subscriptionPlan = mysqlTable('subscription_plan', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 100 }).notNull(),
  allowL1: boolean('allow_l1').default(true).notNull(),
  allowL2: boolean('allow_l2').default(false).notNull(),
  allowL3: boolean('allow_l3').default(false).notNull(),
  allowL4: boolean('allow_l4').default(false).notNull(),
  maxGuards: int('max_guards').notNull(),
  maxGuestPasses: int('max_guest_passes').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 4. Organization Plan (Bridge: org → plan)
export const organizationPlan = mysqlTable('organization_plan', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationNodeId: varchar('organization_node_id', { length: 36 }).notNull(),
  subscriptionPlanId: varchar('subscription_plan_id', { length: 36 }).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  status: mysqlEnum('status', ['active', 'expired', 'cancelled']).default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 5. Org Admin
export const orgAdmin = mysqlTable('org_admin', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationNodeId: varchar('organization_node_id', { length: 36 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  status: mysqlEnum('status', ['active', 'disabled']).default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 6. Security Personnel
export const securityPersonnel = mysqlTable('security_personnel', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationNodeId: varchar('organization_node_id', { length: 36 }).notNull(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  shiftStartTime: varchar('shift_start_time', { length: 5 }), // HH:MM format
  shiftEndTime: varchar('shift_end_time', { length: 5 }), // HH:MM format
  status: mysqlEnum('status', ['active', 'disabled']).default('active').notNull(),
  lastActive: timestamp('last_active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 7. Guard Device
export const guardDevice = mysqlTable('guard_device', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  securityPersonnelId: varchar('security_personnel_id', { length: 36 }).notNull(),
  deviceModel: varchar('device_model', { length: 100 }),
  osVersion: varchar('os_version', { length: 50 }),
  lastActive: timestamp('last_active'),
  forceLogout: boolean('force_logout').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 8. Guest
export const guest = mysqlTable('guest', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  phone: varchar('phone', { length: 20 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 9. Guest Device
export const guestDevice = mysqlTable('guest_device', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  guestId: varchar('guest_id', { length: 36 }).notNull(),
  deviceModel: varchar('device_model', { length: 100 }),
  osVersion: varchar('os_version', { length: 50 }),
  lastActive: timestamp('last_active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 10. Guest Invitation
export const guestInvitation = mysqlTable('guest_invitation', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationNodeId: varchar('organization_node_id', { length: 36 }).notNull(),
  guestId: varchar('guest_id', { length: 36 }).notNull(),
  employeeName: varchar('employee_name', { length: 255 }).notNull(),
  employeePhone: varchar('employee_phone', { length: 20 }).notNull(),
  validFrom: timestamp('valid_from').notNull(),
  validTo: timestamp('valid_to').notNull(),
  requestedSecurityLevel: int('requested_security_level').notNull(), // 1-4 for L1-L4
  status: mysqlEnum('status', ['pending', 'active', 'expired', 'revoked']).default('pending').notNull(),
  createdByOrgAdminId: varchar('created_by_org_admin_id', { length: 36 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 11. Guest QR Session
export const guestQrSession = mysqlTable('guest_qr_session', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  invitationId: varchar('invitation_id', { length: 36 }).notNull(),
  rotatingKey: text('rotating_key').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 12. Guest OTP
export const guestOtp = mysqlTable('guest_otp', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  invitationId: varchar('invitation_id', { length: 36 }).notNull(),
  otpCode: varchar('otp_code', { length: 6 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  verified: boolean('verified').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 13. Invitation Scan Event
export const invitationScanEvent = mysqlTable('invitation_scan_event', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  invitationId: varchar('invitation_id', { length: 36 }).notNull(),
  scannedBySecurityPersonnelId: varchar('scanned_by_security_personnel_id', { length: 36 }).notNull(),
  usedSecurityLevel: int('used_security_level').notNull(), // 1-4
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  success: boolean('success').notNull(),
  failureReason: text('failure_reason'),
});

// 14. App Config (Maintenance & Force Update)
export const appConfig = mysqlTable('app_config', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  guestAppMaintenance: boolean('guest_app_maintenance').default(false).notNull(),
  guestAppMaintenanceMessage: text('guest_app_maintenance_message'),
  securityAppMaintenance: boolean('security_app_maintenance').default(false).notNull(),
  securityAppMaintenanceMessage: text('security_app_maintenance_message'),
  guestAppForceUpdate: boolean('guest_app_force_update').default(false).notNull(),
  guestAppMinVersion: varchar('guest_app_min_version', { length: 20 }),
  securityAppForceUpdate: boolean('security_app_force_update').default(false).notNull(),
  securityAppMinVersion: varchar('security_app_min_version', { length: 20 }),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 15. Notification Tokens
export const notificationTokens = mysqlTable('notification_tokens', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  guestId: varchar('guest_id', { length: 36 }),
  securityPersonnelId: varchar('security_personnel_id', { length: 36 }),
  deviceToken: text('device_token').notNull(),
  platform: mysqlEnum('platform', ['ios', 'android']).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 16. Notifications (Broadcast to all guests or all security)
export const notifications = mysqlTable('notifications', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: varchar('title', { length: 255 }).notNull(),
  body: text('body').notNull(),
  recipientType: mysqlEnum('recipient_type', ['guest', 'security']).notNull(),
  notificationType: mysqlEnum('notification_type', ['invitation', 'scan', 'alert', 'system', 'general']).notNull(),
  relatedEntityId: varchar('related_entity_id', { length: 36 }),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
});

// 17. Notification Reads (Track which user read which notification)
export const notificationReads = mysqlTable('notification_reads', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  notificationId: varchar('notification_id', { length: 36 }).notNull(),
  guestId: varchar('guest_id', { length: 36 }),
  securityPersonnelId: varchar('security_personnel_id', { length: 36 }),
  readAt: timestamp('read_at').defaultNow().notNull(),
});

// 18. Audit Log
export const auditLog = mysqlTable('audit_log', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  actorType: mysqlEnum('actor_type', ['SuperAdmin', 'OrgAdmin', 'Guard', 'System']).notNull(),
  actorId: varchar('actor_id', { length: 36 }).notNull(),
  action: varchar('action', { length: 255 }).notNull(),
  metadata: json('metadata'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// 19. Billing Record
export const billingRecord = mysqlTable('billing_record', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationNodeId: varchar('organization_node_id', { length: 36 }).notNull(),
  subscriptionPlanId: varchar('subscription_plan_id', { length: 36 }).notNull(),
  paymentReference: varchar('payment_reference', { length: 255 }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  status: mysqlEnum('status', ['pending', 'paid', 'failed', 'refunded']).default('pending').notNull(),
});

// 20. Geo Gate Location (Optional)
export const geoGateLocation = mysqlTable('geo_gate_location', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationNodeId: varchar('organization_node_id', { length: 36 }).notNull(),
  latitude: decimal('latitude', { precision: 10, scale: 8 }).notNull(),
  longitude: decimal('longitude', { precision: 11, scale: 8 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==================== RELATIONS ====================

export const organizationNodeRelations = relations(organizationNode, ({ one, many }) => ({
  parent: one(organizationNode, {
    fields: [organizationNode.parentId],
    references: [organizationNode.id],
    relationName: 'children',
  }),
  children: many(organizationNode, {
    relationName: 'children',
  }),
  orgAdmins: many(orgAdmin),
  securityPersonnel: many(securityPersonnel),
  guestInvitations: many(guestInvitation),
  organizationPlans: many(organizationPlan),
  billingRecords: many(billingRecord),
  geoGateLocation: one(geoGateLocation),
}));

export const subscriptionPlanRelations = relations(subscriptionPlan, ({ many }) => ({
  organizationPlans: many(organizationPlan),
  billingRecords: many(billingRecord),
}));

export const organizationPlanRelations = relations(organizationPlan, ({ one }) => ({
  organizationNode: one(organizationNode, {
    fields: [organizationPlan.organizationNodeId],
    references: [organizationNode.id],
  }),
  subscriptionPlan: one(subscriptionPlan, {
    fields: [organizationPlan.subscriptionPlanId],
    references: [subscriptionPlan.id],
  }),
}));

export const orgAdminRelations = relations(orgAdmin, ({ one, many }) => ({
  organizationNode: one(organizationNode, {
    fields: [orgAdmin.organizationNodeId],
    references: [organizationNode.id],
  }),
  createdInvitations: many(guestInvitation),
}));

export const securityPersonnelRelations = relations(securityPersonnel, ({ one, many }) => ({
  organizationNode: one(organizationNode, {
    fields: [securityPersonnel.organizationNodeId],
    references: [organizationNode.id],
  }),
  guardDevices: many(guardDevice),
  scanEvents: many(invitationScanEvent),
  notificationTokens: many(notificationTokens),
  notificationReads: many(notificationReads),
}));

export const guardDeviceRelations = relations(guardDevice, ({ one }) => ({
  securityPersonnel: one(securityPersonnel, {
    fields: [guardDevice.securityPersonnelId],
    references: [securityPersonnel.id],
  }),
}));

export const guestRelations = relations(guest, ({ many }) => ({
  invitations: many(guestInvitation),
  devices: many(guestDevice),
  notificationTokens: many(notificationTokens),
  notificationReads: many(notificationReads),
}));

export const guestDeviceRelations = relations(guestDevice, ({ one }) => ({
  guest: one(guest, {
    fields: [guestDevice.guestId],
    references: [guest.id],
  }),
}));

export const guestInvitationRelations = relations(guestInvitation, ({ one, many }) => ({
  organizationNode: one(organizationNode, {
    fields: [guestInvitation.organizationNodeId],
    references: [organizationNode.id],
  }),
  guest: one(guest, {
    fields: [guestInvitation.guestId],
    references: [guest.id],
  }),
  createdBy: one(orgAdmin, {
    fields: [guestInvitation.createdByOrgAdminId],
    references: [orgAdmin.id],
  }),
  qrSessions: many(guestQrSession),
  otps: many(guestOtp),
  scanEvents: many(invitationScanEvent),
}));

export const guestQrSessionRelations = relations(guestQrSession, ({ one }) => ({
  invitation: one(guestInvitation, {
    fields: [guestQrSession.invitationId],
    references: [guestInvitation.id],
  }),
}));

export const guestOtpRelations = relations(guestOtp, ({ one }) => ({
  invitation: one(guestInvitation, {
    fields: [guestOtp.invitationId],
    references: [guestInvitation.id],
  }),
}));

export const invitationScanEventRelations = relations(invitationScanEvent, ({ one }) => ({
  invitation: one(guestInvitation, {
    fields: [invitationScanEvent.invitationId],
    references: [guestInvitation.id],
  }),
  scannedBy: one(securityPersonnel, {
    fields: [invitationScanEvent.scannedBySecurityPersonnelId],
    references: [securityPersonnel.id],
  }),
}));

export const notificationTokensRelations = relations(notificationTokens, ({ one }) => ({
  guest: one(guest, {
    fields: [notificationTokens.guestId],
    references: [guest.id],
  }),
  securityPersonnel: one(securityPersonnel, {
    fields: [notificationTokens.securityPersonnelId],
    references: [securityPersonnel.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ many }) => ({
  reads: many(notificationReads),
}));

export const notificationReadsRelations = relations(notificationReads, ({ one }) => ({
  notification: one(notifications, {
    fields: [notificationReads.notificationId],
    references: [notifications.id],
  }),
  guest: one(guest, {
    fields: [notificationReads.guestId],
    references: [guest.id],
  }),
  securityPersonnel: one(securityPersonnel, {
    fields: [notificationReads.securityPersonnelId],
    references: [securityPersonnel.id],
  }),
}));

export const billingRecordRelations = relations(billingRecord, ({ one }) => ({
  organizationNode: one(organizationNode, {
    fields: [billingRecord.organizationNodeId],
    references: [organizationNode.id],
  }),
  subscriptionPlan: one(subscriptionPlan, {
    fields: [billingRecord.subscriptionPlanId],
    references: [subscriptionPlan.id],
  }),
}));

export const geoGateLocationRelations = relations(geoGateLocation, ({ one }) => ({
  organizationNode: one(organizationNode, {
    fields: [geoGateLocation.organizationNodeId],
    references: [organizationNode.id],
  }),
}));
