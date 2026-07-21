import { supabase } from "./supabaseClient";

export type MinistryRecord = {
  id: string;
  church_id: string;
  name: string;
  description: string | null;
  leader_member_id: string | null;
  status: string;
  created_at: string;
  member_count: number;
};

const MINISTRY_COLUMNS = "id, church_id, name, description, leader_member_id, status, created_at";

export async function listMinistries(churchId: string): Promise<MinistryRecord[]> {
  const { data: ministries, error } = await supabase
    .from("ministries")
    .select(MINISTRY_COLUMNS)
    .eq("church_id", churchId)
    .order("name", { ascending: true });

  if (error) throw error;

  const list = (ministries ?? []) as Array<Omit<MinistryRecord, "member_count">>;
  if (list.length === 0) return [];

  const ids = list.map((m) => m.id);
  const { data: rosterRows, error: rosterError } = await supabase
    .from("ministry_members")
    .select("ministry_id")
    .in("ministry_id", ids);

  if (rosterError) throw rosterError;

  const counts = new Map<string, number>();
  for (const row of rosterRows ?? []) {
    counts.set(row.ministry_id, (counts.get(row.ministry_id) ?? 0) + 1);
  }

  return list.map((m) => ({ ...m, member_count: counts.get(m.id) ?? 0 }));
}

export async function createMinistry(params: {
  churchId: string;
  name: string;
  description?: string;
  leaderMemberId?: string | null;
}) {
  const { data, error } = await supabase
    .from("ministries")
    .insert({
      church_id: params.churchId,
      name: params.name.trim(),
      description: params.description?.trim() || null,
      leader_member_id: params.leaderMemberId || null,
    })
    .select(MINISTRY_COLUMNS)
    .single();

  if (error) throw error;
  return { ...(data as Omit<MinistryRecord, "member_count">), member_count: 0 };
}

export async function updateMinistry(
  id: string,
  params: Partial<{ name: string; description: string | null; leaderMemberId: string | null; status: string }>
) {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (params.name !== undefined) payload.name = params.name.trim();
  if (params.description !== undefined) payload.description = params.description?.trim() || null;
  if (params.leaderMemberId !== undefined) payload.leader_member_id = params.leaderMemberId || null;
  if (params.status !== undefined) payload.status = params.status;

  const { data, error } = await supabase
    .from("ministries")
    .update(payload)
    .eq("id", id)
    .select(MINISTRY_COLUMNS)
    .single();

  if (error) throw error;
  return data as Omit<MinistryRecord, "member_count">;
}

export async function setMinistryStatus(id: string, status: "active" | "inactive") {
  return updateMinistry(id, { status });
}

export type RosterEntry = {
  id: string;
  ministry_id: string;
  member_id: string;
  role_title: string | null;
  created_at: string;
};

export async function listRoster(ministryId: string): Promise<RosterEntry[]> {
  const { data, error } = await supabase
    .from("ministry_members")
    .select("id, ministry_id, member_id, role_title, created_at")
    .eq("ministry_id", ministryId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as RosterEntry[];
}

export async function addRosterMember(ministryId: string, memberId: string, roleTitle?: string) {
  const { data, error } = await supabase
    .from("ministry_members")
    .insert({ ministry_id: ministryId, member_id: memberId, role_title: roleTitle?.trim() || null })
    .select("id, ministry_id, member_id, role_title, created_at")
    .single();

  if (error) throw error;
  return data as RosterEntry;
}

export async function removeRosterMember(id: string) {
  const { error } = await supabase.from("ministry_members").delete().eq("id", id);
  if (error) throw error;
}
