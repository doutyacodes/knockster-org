import { db } from './index';
import * as schema from './schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Create SuperAdmin
    console.log('Creating SuperAdmin...');
    const hashedPassword = await bcrypt.hash('SuperAdmin@123', 10);
    const superAdminId = crypto.randomUUID();
    await db.insert(schema.superAdmin).values({
      id: superAdminId,
      email: 'superadmin@knockster.io',
      passwordHash: hashedPassword,
      twoFactorEnabled: false,
    });
    console.log('✅ SuperAdmin created: superadmin@knockster.io');

    // 2. Create Subscription Plans
    console.log('Creating subscription plans...');
    const planIds = {
      l1: crypto.randomUUID(),
      l2: crypto.randomUUID(),
      l3: crypto.randomUUID(),
      l4: crypto.randomUUID(),
    };

    await db.insert(schema.subscriptionPlan).values([
      {
        id: planIds.l1,
        name: 'Basic L1',
        allowL1: true,
        allowL2: false,
        allowL3: false,
        allowL4: false,
        maxGuards: 5,
        maxGuestPasses: 100,
        price: '99.00',
      },
      {
        id: planIds.l2,
        name: 'Standard L2',
        allowL1: true,
        allowL2: true,
        allowL3: false,
        allowL4: false,
        maxGuards: 10,
        maxGuestPasses: 250,
        price: '249.00',
      },
      {
        id: planIds.l3,
        name: 'Premium L3',
        allowL1: true,
        allowL2: true,
        allowL3: true,
        allowL4: false,
        maxGuards: 25,
        maxGuestPasses: 500,
        price: '499.00',
      },
      {
        id: planIds.l4,
        name: 'Enterprise L4',
        allowL1: true,
        allowL2: true,
        allowL3: true,
        allowL4: true,
        maxGuards: 100,
        maxGuestPasses: 2000,
        price: '999.00',
      },
    ]);
    console.log('✅ Created 4 subscription plans');

    // 3. Create Sample Organization Hierarchy
    console.log('Creating organization hierarchy...');

    // Root: Tech Park
    const techParkId = crypto.randomUUID();
    await db.insert(schema.organizationNode).values({
      id: techParkId,
      name: 'Silicon Valley Tech Park',
      type: 'techpark',
      status: 'active',
    });

    // Level 1: Blocks
    const blockAId = crypto.randomUUID();
    await db.insert(schema.organizationNode).values({
      id: blockAId,
      parentId: techParkId,
      name: 'Block A',
      type: 'block',
      status: 'active',
    });

    const blockBId = crypto.randomUUID();
    await db.insert(schema.organizationNode).values({
      id: blockBId,
      parentId: techParkId,
      name: 'Block B',
      type: 'block',
      status: 'active',
    });

    // Level 2: Buildings
    const building1Id = crypto.randomUUID();
    await db.insert(schema.organizationNode).values({
      id: building1Id,
      parentId: blockAId,
      name: 'Building 1',
      type: 'building',
      status: 'active',
    });

    // Level 3: Companies
    const companyXId = crypto.randomUUID();
    await db.insert(schema.organizationNode).values({
      id: companyXId,
      parentId: building1Id,
      name: 'TechCorp Inc',
      type: 'company',
      status: 'active',
    });

    // Level 4: Gates
    const gateMainId = crypto.randomUUID();
    await db.insert(schema.organizationNode).values({
      id: gateMainId,
      parentId: companyXId,
      name: 'Main Entrance',
      type: 'gate',
      status: 'active',
    });

    const gateParkingId = crypto.randomUUID();
    await db.insert(schema.organizationNode).values({
      id: gateParkingId,
      parentId: companyXId,
      name: 'Parking Gate',
      type: 'gate',
      status: 'active',
    });

    console.log('✅ Organization hierarchy created');

    // 4. Assign Plans to Organizations
    console.log('Assigning subscription plans...');
    await db.insert(schema.organizationPlan).values([
      {
        id: crypto.randomUUID(),
        organizationNodeId: techParkId,
        subscriptionPlanId: planIds.l4, // Enterprise L4
        startDate: new Date(),
        status: 'active',
      },
      {
        id: crypto.randomUUID(),
        organizationNodeId: companyXId,
        subscriptionPlanId: planIds.l3, // Premium L3
        startDate: new Date(),
        status: 'active',
      },
    ]);
    console.log('✅ Subscription plans assigned');

    // 5. Create Org Admins
    console.log('Creating org admins...');
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const orgAdmin1Id = crypto.randomUUID();
    await db.insert(schema.orgAdmin).values({
      id: orgAdmin1Id,
      organizationNodeId: companyXId,
      email: 'admin@techcorp.com',
      passwordHash: adminPassword,
      status: 'active',
    });
    console.log('✅ Org admins created');

    // 6. Create Security Personnel
    console.log('Creating security personnel...');
    const guardPassword = await bcrypt.hash('Guard@123', 10);
    const guard1Id = crypto.randomUUID();
    await db.insert(schema.securityPersonnel).values({
      id: guard1Id,
      organizationNodeId: gateMainId,
      username: 'guard_main_001',
      passwordHash: guardPassword,
      shiftStartTime: '08:00',
      shiftEndTime: '16:00',
      status: 'active',
      lastActive: new Date(),
    });

    const guard2Id = crypto.randomUUID();
    await db.insert(schema.securityPersonnel).values({
      id: guard2Id,
      organizationNodeId: gateParkingId,
      username: 'guard_parking_001',
      passwordHash: guardPassword,
      shiftStartTime: '16:00',
      shiftEndTime: '00:00',
      status: 'active',
      lastActive: new Date(),
    });
    console.log('✅ Security personnel created');

    // 7. Create Sample Guests
    console.log('Creating sample guests...');
    const guest1Id = crypto.randomUUID();
    await db.insert(schema.guest).values({
      id: guest1Id,
      phone: '+1234567890',
      name: 'John Doe',
    });

    const guest2Id = crypto.randomUUID();
    await db.insert(schema.guest).values({
      id: guest2Id,
      phone: '+0987654321',
      name: 'Jane Smith',
    });
    console.log('✅ Sample guests created');

    // 8. Create Sample Invitations
    console.log('Creating sample invitations...');
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const invitation1Id = crypto.randomUUID();
    await db.insert(schema.guestInvitation).values({
      id: invitation1Id,
      organizationNodeId: companyXId,
      guestId: guest1Id,
      employeeName: 'Alice Johnson',
      employeePhone: '+1111111111',
      validFrom: now,
      validTo: tomorrow,
      requestedSecurityLevel: 3,
      status: 'active',
      createdByOrgAdminId: orgAdmin1Id,
    });
    console.log('✅ Sample invitations created');

    // 9. Create QR Session for invitation
    const qrExpiry = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes
    await db.insert(schema.guestQrSession).values({
      id: crypto.randomUUID(),
      invitationId: invitation1Id,
      rotatingKey: 'QR_' + Math.random().toString(36).substring(7),
      expiresAt: qrExpiry,
    });
    console.log('✅ QR sessions created');

    // 10. Create Geo Location for gates
    console.log('Creating geo locations...');
    await db.insert(schema.geoGateLocation).values([
      {
        id: crypto.randomUUID(),
        organizationNodeId: gateMainId,
        latitude: '37.33874',
        longitude: '-121.88514',
      },
      {
        id: crypto.randomUUID(),
        organizationNodeId: gateParkingId,
        latitude: '37.33900',
        longitude: '-121.88600',
      },
    ]);
    console.log('✅ Geo locations created');

    // 11. Create Audit Logs
    console.log('Creating audit logs...');
    await db.insert(schema.auditLog).values([
      {
        id: crypto.randomUUID(),
        actorType: 'SuperAdmin',
        actorId: superAdminId,
        action: 'SYSTEM_INITIALIZED',
        metadata: { message: 'Database seeded successfully' },
      },
      {
        id: crypto.randomUUID(),
        actorType: 'OrgAdmin',
        actorId: orgAdmin1Id,
        action: 'INVITATION_CREATED',
        metadata: { invitationId: invitation1Id, guestPhone: '+1234567890' },
      },
    ]);
    console.log('✅ Audit logs created');

    console.log('\n🎉 Database seeding completed successfully!\n');
    console.log('📝 Test Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('SuperAdmin:');
    console.log('  Email: superadmin@knockster.io');
    console.log('  Password: SuperAdmin@123');
    console.log('\nOrg Admin:');
    console.log('  Email: admin@techcorp.com');
    console.log('  Password: Admin@123');
    console.log('\nSecurity Guard:');
    console.log('  Username: guard_main_001');
    console.log('  Password: Guard@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }

  process.exit(0);
}

seed();
