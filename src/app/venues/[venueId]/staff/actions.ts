"use server";

import { refresh } from "next/cache";
import { venueNow } from "@/lib/changelog";
import { getStaff, saveStaff } from "@/lib/demo-data";
import { canManageStaff } from "@/lib/permissions";
import { ROLES, type Role } from "@/lib/roles";
import { getSessionUser } from "@/lib/session";
import {
  hasStaffErrors,
  lastManagerBlock,
  MAX_STAFF_NAME,
  normaliseEmail,
  validateNewStaff,
  type StaffErrors,
  type StaffMember,
} from "@/lib/staff";

export type AddStaffResult = { ok: true; id: string } | { ok: false; errors: StaffErrors; message?: string };
export type StaffChangeResult = { ok: true } | { ok: false; message: string };

const NOT_ALLOWED = "Only F&B managers can manage staff.";

/** The signed-in manager, or null if they may not manage staff. */
async function manager() {
  const user = await getSessionUser();
  return canManageStaff(user.role) ? user : null;
}

/** Adds an account. They log in with this email from any venue. */
export async function addStaff(input: { name: string; email: string; role: string }): Promise<AddStaffResult> {
  const user = await manager();
  if (!user) return { ok: false, errors: {}, message: NOT_ALLOWED };
  const staff = await getStaff();
  const errors = validateNewStaff(input, staff);
  if (hasStaffErrors(errors)) return { ok: false, errors };
  const role = input.role as Role;
  const member: StaffMember = {
    id: `s-${crypto.randomUUID().slice(0, 8)}`,
    name: input.name.trim().slice(0, MAX_STAFF_NAME),
    email: normaliseEmail(input.email),
    role,
    disabled: false,
    history: [{ at: venueNow(), by: user.name, text: `Account added as ${role}` }],
  };
  await saveStaff([...staff, member]);
  refresh();
  return { ok: true, id: member.id };
}

/** Loads the account to change, refusing the manager's own (they'd lock themselves out). */
async function target(id: string) {
  const user = await manager();
  if (!user) return { error: NOT_ALLOWED } as { error: string };
  const staff = await getStaff();
  const member = staff.find((s) => s.id === id);
  if (!member) return { error: "This account no longer exists." } as { error: string };
  if (member.email === normaliseEmail(user.email)) {
    return { error: "You can't change your own account. Ask another F&B manager." } as { error: string };
  }
  return { user, staff, member };
}

export async function changeRole(id: string, role: string): Promise<StaffChangeResult> {
  const found = await target(id);
  if ("error" in found) return { ok: false, message: found.error };
  const { user, staff, member } = found;
  if (!ROLES.includes(role as Role)) return { ok: false, message: "Choose a role." };
  const next = role as Role;
  if (next === member.role) return { ok: true };
  const blocked = lastManagerBlock(member, { role: next }, staff);
  if (blocked) return { ok: false, message: blocked };
  const change = { at: venueNow(), by: user.name, text: `Role changed from ${member.role} to ${next}` };
  await saveStaff(staff.map((s) => (s.id === id ? { ...s, role: next, history: [...s.history, change] } : s)));
  refresh();
  return { ok: true };
}

/** Disables (can't log in; name kept on records) or re-enables an account. */
export async function setStaffDisabled(id: string, disabled: boolean): Promise<StaffChangeResult> {
  const found = await target(id);
  if ("error" in found) return { ok: false, message: found.error };
  const { user, staff, member } = found;
  if (member.disabled === disabled) return { ok: true };
  const blocked = lastManagerBlock(member, { disabled }, staff);
  if (blocked) return { ok: false, message: blocked };
  const change = { at: venueNow(), by: user.name, text: disabled ? "Account disabled" : "Account enabled" };
  await saveStaff(staff.map((s) => (s.id === id ? { ...s, disabled, history: [...s.history, change] } : s)));
  refresh();
  return { ok: true };
}
