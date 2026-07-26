import { supabase } from "./supabaseClient";

export type ChurchRecord = { id: string; name: string; created_at: string };

export async function getChurch(churchId: string) {
  const { data, error } = await supabase.from("churches").select("id, name, created_at").eq("id", churchId).single();
  if (error) throw error;
  return data as ChurchRecord;
}

export async function updateChurchName(churchId: string, name: string) {
  const { data, error } = await supabase
    .from("churches")
    .update({ name: name.trim() })
    .eq("id", churchId)
    .select("id, name, created_at")
    .single();

  if (error) throw error;
  return data as ChurchRecord;
}

export type TeamProfile = {
  id: string;
  full_name: string;
  email: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
};

export const ROLES = [
  { value: "super_admin", label: "Super Admin" },
  { value: "pastor", label: "Pastor" },
  { value: "admin", label: "Admin" },
  { value: "finance", label: "Finance" },
  { value: "ministry_leader", label: "Ministry Leader" },
  { value: "usher", label: "Usher" },
];

export async function listTeamProfiles(churchId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, is_active, created_at")
    .eq("church_id", churchId)
    .order("full_name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as TeamProfile[];
}

export async function updateProfileRole(id: string, role: string) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, full_name, email, role, is_active, created_at")
    .single();

  if (error) throw error;
  return data as TeamProfile;
}

export async function setProfileActive(id: string, isActive: boolean) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, full_name, email, role, is_active, created_at")
    .single();

  if (error) throw error;
  return data as TeamProfile;
}

export async function updateOwnName(id: string, fullName: string) {
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName.trim(), updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}
