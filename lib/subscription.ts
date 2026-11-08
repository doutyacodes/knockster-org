import { eq, and, gte, lt, count } from 'drizzle-orm';
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

  // COUNT(*) rather than fetching every row just to call .length on it —
  // guard headcount is a ceiling check, the rows themselves are never used.
  const [{ used }] = await db
    .select({ used: count() })
    .from(securityPersonnel)
    .where(eq(securityPersonnel.organizationNodeId, organizationNodeId));

  if (used >= plan.maxGuards) {
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

  // `maxGuestPasses` is a per-month allowance, so count only this calendar
  // month's invitations.
  //
  // This previously counted every invitation the organisation had EVER created,
  // against the same ceiling. The effect was a slow-acting lockout: an org on a
  // 100-pass plan could issue 100 invitations in total and then never issue
  // another one, with the error message still claiming they had hit a limit
  // they were in fact renewing every month. The old code even said as much in a
  // comment. Counting per month is what the plan actually sells.
  //
  // Month boundaries are built in UTC to match how `created_at` is stored
  // (lib/timezone.ts keeps the database in UTC and converts for display only).
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const startOfNextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  const [{ used }] = await db
    .select({ used: count() })
    .from(guestInvitation)
    .where(
      and(
        eq(guestInvitation.organizationNodeId, organizationNodeId),
        gte(guestInvitation.createdAt, startOfMonth),
        lt(guestInvitation.createdAt, startOfNextMonth)
      )
    );

  if (used >= plan.maxGuestPasses) {
    return {
      allowed: false,
      error: `Monthly guest pass limit (${plan.maxGuestPasses}) reached for your plan. It resets at the start of next month.`,
    };
  }

  return { allowed: true };
}
