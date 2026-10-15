"use server";

import { getStaff } from "@/lib/demo-data";
import { normaliseEmail } from "@/lib/staff";

/**
 * The part of logging in that exists so far: a disabled account can't log in.
 * Emails not in the staff list are still let through until authentication is
 * decided (see lib/session.ts).
 */
export async function checkLogin(email: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const member = (await getStaff()).find((s) => s.email === normaliseEmail(email));
  if (member?.disabled) {
    return { ok: false, message: "This account has been disabled. Ask an F&B manager to enable it." };
  }
  return { ok: true };
}
