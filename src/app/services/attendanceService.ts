import { supabase } from "./supabaseClient";

export type MemberSearchResult = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  member_type: string;
  status: string;
};

export async function searchMembersByName(churchId: string, searchTerm: string) {
  const term = searchTerm.trim();

  if (!term) return [];

  const { data, error } = await supabase
    .from("members")
    .select("id, first_name, last_name, phone, email, member_type, status")
    .eq("church_id", churchId)
    .eq("status", "active")
    .or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%`)
    .order("last_name", { ascending: true })
    .limit(12);

  if (error) throw error;
  return (data ?? []) as MemberSearchResult[];
}

export async function checkInMember(params: {
  churchId: string;
  memberId: string;
  serviceName?: string;
}) {
  const { data, error } = await supabase
    .from("attendance_records")
    .insert({
      church_id: params.churchId,
      member_id: params.memberId,
      service_name: params.serviceName ?? "Sunday Service",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function registerVisitorAndCheckIn(params: {
  churchId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  serviceName?: string;
}) {
  const { data: member, error: memberError } = await supabase
    .from("members")
    .insert({
      church_id: params.churchId,
      first_name: params.firstName.trim(),
      last_name: params.lastName.trim(),
      phone: params.phone?.trim() || null,
      email: params.email?.trim() || null,
      member_type: "visitor",
      status: "active",
    })
    .select("id, first_name, last_name, phone, email, member_type, status")
    .single();

  if (memberError) throw memberError;

  const { data: attendance, error: attendanceError } = await supabase
    .from("attendance_records")
    .insert({
      church_id: params.churchId,
      member_id: member.id,
      service_name: params.serviceName ?? "Sunday Service",
    })
    .select()
    .single();

  if (attendanceError) throw attendanceError;

  return { member: member as MemberSearchResult, attendance };
}

export async function getTodayAttendanceCount(churchId: string) {
  const today = new Date().toISOString().slice(0, 10);

  const { count, error } = await supabase
    .from("attendance_records")
    .select("id", { count: "exact", head: true })
    .eq("church_id", churchId)
    .eq("service_date", today);

  if (error) throw error;
  return count ?? 0;
}
