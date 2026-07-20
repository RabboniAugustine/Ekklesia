import { supabase } from "./supabaseClient";

export type AppRole =
  | "super_admin"
  | "pastor"
  | "admin"
  | "usher"
  | "finance"
  | "ministry_leader";

export type UserProfile = {
  id: string;
  church_id: string;
  full_name: string;
  email: string | null;
  role: AppRole;
  avatar_url: string | null;
  phone: string | null;
  is_active: boolean;
};

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

export async function signInWithEmailPassword(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, church_id, full_name, email, role, avatar_url, phone, is_active"
    )
    .eq("id", userId)
    .single();

  if (error) {
    throw error;
  }

  return data as UserProfile;
}