import { supabase } from "./supabaseClient";

export type MemberRecord = {
  id: string;
  church_id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  member_type: string;
  status: string;
  created_at: string;
};

export async function listMembers(churchId: string) {
  const { data, error } = await supabase
    .from("members")
    .select("id, church_id, first_name, last_name, phone, email, member_type, status, created_at")
    .eq("church_id", churchId)
    .order("last_name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as MemberRecord[];
}

export async function createMember(params: {
  churchId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  memberType?: string;
}) {
  const { data, error } = await supabase
    .from("members")
    .insert({
      church_id: params.churchId,
      first_name: params.firstName.trim(),
      last_name: params.lastName.trim(),
      phone: params.phone?.trim() || null,
      email: params.email?.trim() || null,
      member_type: params.memberType ?? "member",
      status: "active",
    })
    .select()
    .single();

  if (error) throw error;
  return data as MemberRecord;
}

export async function updateMember(
  id: string,
  params: Partial<{
    firstName: string;
    lastName: string;
    phone: string | null;
    email: string | null;
    memberType: string;
    status: string;
  }>
) {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (params.firstName !== undefined) payload.first_name = params.firstName.trim();
  if (params.lastName !== undefined) payload.last_name = params.lastName.trim();
  if (params.phone !== undefined) payload.phone = params.phone?.trim() || null;
  if (params.email !== undefined) payload.email = params.email?.trim() || null;
  if (params.memberType !== undefined) payload.member_type = params.memberType;
  if (params.status !== undefined) payload.status = params.status;

  const { data, error } = await supabase
    .from("members")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as MemberRecord;
}

export async function setMemberStatus(id: string, status: "active" | "inactive" | "archived") {
  return updateMember(id, { status });
}
