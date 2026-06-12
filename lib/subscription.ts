import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { organizationPlan, subscriptionPlan, securityPersonnel, guestInvitation } from '@/db/schema';

export async function getOrganizationActivePlan(organizationNodeId: string) {
  const [activePlan] = await db
    .select({
      id: organizationPlan.id,
      planId: subscriptionPlan.id,
      planName: subscriptionPlan.name,
      allowL1: subscriptionPlan.allowL1,
      allowL2: subscriptionPlan.allowL2,
      allowL3: subscriptionPlan.allowL3,
      allowL4: subscriptionPlan.allowL4,
      maxGuards: subscriptionPlan.maxGuards,
      maxGuestPasses: subscriptionPlan.maxGuestPasses,
    })
    .from(organizationPlan)
    .innerJoin(subscriptionPlan, eq(organizationPlan.subscriptionPlanId, subscriptionPlan.id))
    .where(
      and(
        eq(organizationPlan.organizationNodeId, organizationNodeId),
        eq(organizationPlan.status, 'active')
      )
    )
    .limit(1);

  return activePlan || null;
}

export async function checkCanCreateGuard(organizationNodeId: string) {
  const plan = await getOrganizationActivePlan(organizationNodeId);
  if (!plan) return { allowed: false, error: 'No active subscription plan found.' };

  const personnel = await db
    .select({ id: securityPersonnel.id })
    .from(securityPersonnel)
    .where(eq(securityPersonnel.organizationNodeId, organizationNodeId));

  if (personnel.length >= plan.maxGuards) {
    return { allowed: false, error: `Maximum guards limit (${plan.maxGuards}) reached for your plan.` };
  }

  return { allowed: true };
}

export async function checkCanCreateInvitation(organizationNodeId: string, securityLevel: number) {
  const plan = await getOrganizationActivePlan(organizationNodeId);
  if (!plan) return { allowed: false, error: 'No active subscription plan found.' };

  // Check security level
  if (securityLevel === 1 && !plan.allowL1) return { allowed: false, error: 'Your plan does not allow L1 security level.' };
  if (securityLevel === 2 && !plan.allowL2) return { allowed: false, error: 'Your plan does not allow L2 security level.' };
  if (securityLevel === 3 && !plan.allowL3) return { allowed: false, error: 'Your plan does not allow L3 security level.' };
  if (securityLevel === 4 && !plan.allowL4) return { allowed: false, error: 'Your plan does not allow L4 security level.' };

  // Check limits
  const date = new Date();
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  // In a real app, you might want to filter by the current billing cycle. 
  // We'll just do a basic count for now or assume passes are monthly.
  const passes = await db
    .select({ id: guestInvitation.id })
    .from(guestInvitation)
    .where(eq(guestInvitation.organizationNodeId, organizationNodeId));

  // If you want strictly monthly, add a date filter above. For now, total passes vs maxGuestPasses
  if (passes.length >= plan.maxGuestPasses) {
    return { allowed: false, error: `Maximum guest passes limit (${plan.maxGuestPasses}) reached for your plan.` };
  }

  return { allowed: true };
}
