/**
 * Labels for the hat a Zuppdate organiser wore when creating an event.
 *
 * Mirrors ROLE_LABELS in zuppdate/app/lib/event-creator-context.ts. Kept as a
 * plain map rather than imported across the project boundary, because Zuppgate
 * has to keep working on its own — these labels must not become a reason the
 * two apps can only be deployed together.
 *
 * The enum itself is owned by Zuppdate's schema, so an unknown value here means
 * a role was added there and not mirrored: fall back to the raw value rather
 * than showing a blank badge at a door.
 */
export const CREATOR_ROLE_LABELS: Record<string, string> = {
  PERSONAL: 'Personal',
  BUSINESS: 'Business',
  BUSINESS_MANAGER: 'Business manager',
  PROPERTY_MANAGER: 'Property manager',
  SOCIETY_ADMIN: 'Building admin',
  SOCIETY_OWNER: 'Apartment owner',
  SOCIETY_TENANT: 'Tenant',
};

export function creatorRoleLabel(role: string | null | undefined): string | null {
  if (!role) return null;
  return CREATOR_ROLE_LABELS[role] ?? role;
}

/** The shape both the guest and guard apps receive. */
export type CreatedBy = {
  role: string;
  roleLabel: string;
  name: string;
};

export function createdByPayload(
  role: string | null | undefined,
  displayName: string | null | undefined
): CreatedBy | null {
  if (!role || !displayName) return null;
  return { role, roleLabel: creatorRoleLabel(role)!, name: displayName };
}
