export type NavModule =
  | "dashboard"
  | "attendance"
  | "members"
  | "events"
  | "finance"
  | "ministries"
  | "communication"
  | "reports"
  | "settings";

export type { AppRole, UserProfile } from "./services/authService";
