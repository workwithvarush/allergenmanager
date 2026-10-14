import { connection } from "next/server";
import { ROLES, type Role } from "@/lib/roles";

export type SessionUser = {
  name: string;
  role: Role;
  email: string;
};

/**
 * PLACEHOLDER — every request is treated as this signed-in user until the
 * authentication approach is decided (see the login dialog). Replace with a
 * real session lookup; nothing here is secure.
 *
 * For demos, set DEMO_ROLE (e.g. `DEMO_ROLE="F&B Manager" npm run dev`) to
 * see the app as another role.
 */
export async function getSessionUser(): Promise<SessionUser> {
  // A real session is read per request (cookies), never at build time; behave the same.
  await connection();
  const demoRole = ROLES.find((role) => role === process.env.DEMO_ROLE);
  return { name: "Jamie Baker", role: demoRole ?? "Supervisor", email: "jamie.baker@nottinghamvenues.com" };
}
