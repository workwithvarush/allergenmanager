import { ROLES, type Role } from "@/lib/roles";

/** One change to a staff account, newest last. */
export type StaffChange = {
  /** UK local time, "2026-10-15T14:02". */
  at: string;
  /** Who made the change. */
  by: string;
  text: string;
};

/**
 * A person who can log in. Accounts are shared across venues, as people
 * move between them. Disabled accounts are kept (their names stay on change
 * logs and archives) but can't log in.
 */
export type StaffMember = {
  id: string;
  name: string;
  /** Lower-cased @nottinghamvenues.com address; the login. */
  email: string;
  role: Role;
  disabled: boolean;
  history: StaffChange[];
};

export const STAFF_EMAIL_DOMAIN = "nottinghamvenues.com";
export const MAX_STAFF_NAME = 60;
export const MAX_STAFF_EMAIL = 100;

export const normaliseEmail = (email: string) => email.trim().toLowerCase();

export type StaffErrors = { name?: string; email?: string; role?: string };

/** Checks a new account against the existing ones. */
export function validateNewStaff(
  input: { name: string; email: string; role: string },
  staff: readonly StaffMember[],
): StaffErrors {
  const errors: StaffErrors = {};
  const name = input.name.trim();
  const email = normaliseEmail(input.email);
  if (!name) errors.name = "Enter their name";
  else if (name.length > MAX_STAFF_NAME) errors.name = `Keep the name to ${MAX_STAFF_NAME} characters`;
  if (!email) errors.email = "Enter their work email";
  else if (email.length > MAX_STAFF_EMAIL) errors.email = `Keep the email to ${MAX_STAFF_EMAIL} characters`;
  else if (!new RegExp(`^[^\\s@]+@${STAFF_EMAIL_DOMAIN.replace(".", "\\.")}$`).test(email)) {
    errors.email = `Use a ${STAFF_EMAIL_DOMAIN} address`;
  } else {
    const existing = staff.find((s) => s.email === email);
    if (existing) {
      errors.email = existing.disabled
        ? `${existing.name} already has this email — their account is disabled. Enable it instead.`
        : `${existing.name} already has this email`;
    }
  }
  if (!ROLES.includes(input.role as Role)) errors.role = "Choose a role";
  return errors;
}

export const hasStaffErrors = (errors: StaffErrors) => Object.keys(errors).length > 0;

/**
 * Why a change to `member` would leave nobody able to manage staff, or null.
 * The last active F&B Manager can't be demoted or disabled.
 */
export function lastManagerBlock(
  member: StaffMember,
  change: { role?: Role; disabled?: boolean },
  staff: readonly StaffMember[],
): string | null {
  if (member.role !== "F&B Manager" || member.disabled) return null;
  const losesAccess = (change.role !== undefined && change.role !== "F&B Manager") || change.disabled === true;
  if (!losesAccess) return null;
  const others = staff.filter((s) => s.id !== member.id && s.role === "F&B Manager" && !s.disabled);
  return others.length === 0 ? "There must always be at least one active F&B Manager to manage staff." : null;
}
