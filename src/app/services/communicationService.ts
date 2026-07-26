import { supabase } from "./supabaseClient";

export type Announcement = {
  id: string;
  church_id: string;
  title: string;
  body: string;
  is_active: boolean;
  created_at: string;
};

const ANNOUNCEMENT_COLUMNS = "id, church_id, title, body, is_active, created_at";

export async function listAnnouncements(churchId: string) {
  const { data, error } = await supabase
    .from("announcements")
    .select(ANNOUNCEMENT_COLUMNS)
    .eq("church_id", churchId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Announcement[];
}

export async function createAnnouncement(params: { churchId: string; createdBy?: string; title: string; body: string }) {
  const { data, error } = await supabase
    .from("announcements")
    .insert({
      church_id: params.churchId,
      created_by: params.createdBy ?? null,
      title: params.title.trim(),
      body: params.body.trim(),
    })
    .select(ANNOUNCEMENT_COLUMNS)
    .single();

  if (error) throw error;
  return data as Announcement;
}

export async function setAnnouncementActive(id: string, isActive: boolean) {
  const { data, error } = await supabase
    .from("announcements")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(ANNOUNCEMENT_COLUMNS)
    .single();

  if (error) throw error;
  return data as Announcement;
}

export async function deleteAnnouncement(id: string) {
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) throw error;
}

export type PrayerRequest = {
  id: string;
  church_id: string;
  requester_name: string | null;
  is_private: boolean;
  request: string;
  status: string;
  created_at: string;
};

const PRAYER_COLUMNS = "id, church_id, requester_name, is_private, request, status, created_at";

export async function listPrayerRequests(churchId: string) {
  const { data, error } = await supabase
    .from("prayer_requests")
    .select(PRAYER_COLUMNS)
    .eq("church_id", churchId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as PrayerRequest[];
}

export async function createPrayerRequest(params: {
  churchId: string;
  requesterName?: string;
  isPrivate: boolean;
  request: string;
}) {
  const { data, error } = await supabase
    .from("prayer_requests")
    .insert({
      church_id: params.churchId,
      requester_name: params.requesterName?.trim() || null,
      is_private: params.isPrivate,
      request: params.request.trim(),
    })
    .select(PRAYER_COLUMNS)
    .single();

  if (error) throw error;
  return data as PrayerRequest;
}

export async function setPrayerRequestStatus(id: string, status: "open" | "answered") {
  const { data, error } = await supabase
    .from("prayer_requests")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(PRAYER_COLUMNS)
    .single();

  if (error) throw error;
  return data as PrayerRequest;
}

export async function deletePrayerRequest(id: string) {
  const { error } = await supabase.from("prayer_requests").delete().eq("id", id);
  if (error) throw error;
}
