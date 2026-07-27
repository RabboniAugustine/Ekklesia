import type { NavModule } from "./types";

// Which modules each role can access. "settings" is always included for
// every role (My Account needs to be reachable by everyone) so it's added
// automatically in getAccessibleModules rather than listed per-role here.
//
// This is a starting point based on typical church-office responsibilities -
// adjust freely if a role should see more or less.
const ROLE_ACCESS: Record<string, NavModule[]> = {
  super_admin: ["dashboard", "attendance", "members", "events", "finance", "ministries", "communication", "reports"],
  admin: ["dashboard", "attendance", "members", "events", "finance", "ministries", "communication", "reports"],
  pastor: ["dashboard", "attendance", "members", "events", "ministries", "communication", "reports"],
  finance: ["dashboard", "finance", "reports"],
  ministry_leader: ["dashboard", "members", "events", "ministries", "communication"],
  usher: ["members", "attendance"],
};

export function getAccessibleModules(role: string | undefined): NavModule[] {
  const base = (role && ROLE_ACCESS[role]) || [];
  return [...base, "settings"];
}

export function canAccessModule(role: string | undefined, module: NavModule): boolean {
  return getAccessibleModules(role).includes(module);
}
