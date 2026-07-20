import { supabase } from "./supabaseClient";

export type EventRecord = {
  id: string;
  church_id: string;
  title: string;
  description: string | null;
  location: string | null;
  event_type: string;
  start_at: string;
  end_at: string | null;
  capacity: number | null;
  rsvp_count: number;
  status: string;
  created_at: string;
};

export async function listUpcomingEvents(churchId: string) {
  const { data, error } = await supabase
    .from("events")
    .select("id, church_id, title, description, location, event_type, start_at, end_at, capacity, rsvp_count, status, created_at")
    .eq("church_id", churchId)
    .neq("status", "cancelled")
    .gte("start_at", new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()) // include events from the last 6h
    .order("start_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as EventRecord[];
}

export async function listPastEvents(churchId: string, limit = 10) {
  const { data, error } = await supabase
    .from("events")
    .select("id, church_id, title, description, location, event_type, start_at, end_at, capacity, rsvp_count, status, created_at")
    .eq("church_id", churchId)
    .lt("start_at", new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString())
    .order("start_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as EventRecord[];
}

export async function createEvent(params: {
  churchId: string;
  createdBy?: string;
  title: string;
  description?: string;
  location?: string;
  eventType: string;
  startAt: string;
  endAt?: string;
  capacity?: number | null;
}) {
  const { data, error } = await supabase
    .from("events")
    .insert({
      church_id: params.churchId,
      created_by: params.createdBy ?? null,
      title: params.title.trim(),
      description: params.description?.trim() || null,
      location: params.location?.trim() || null,
      event_type: params.eventType,
      start_at: params.startAt,
      end_at: params.endAt || null,
      capacity: params.capacity ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as EventRecord;
}

export async function updateEvent(
  id: string,
  params: Partial<{
    title: string;
    description: string | null;
    location: string | null;
    eventType: string;
    startAt: string;
    endAt: string | null;
    capacity: number | null;
    status: string;
  }>
) {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (params.title !== undefined) payload.title = params.title.trim();
  if (params.description !== undefined) payload.description = params.description?.trim() || null;
  if (params.location !== undefined) payload.location = params.location?.trim() || null;
  if (params.eventType !== undefined) payload.event_type = params.eventType;
  if (params.startAt !== undefined) payload.start_at = params.startAt;
  if (params.endAt !== undefined) payload.end_at = params.endAt || null;
  if (params.capacity !== undefined) payload.capacity = params.capacity;
  if (params.status !== undefined) payload.status = params.status;

  const { data, error } = await supabase
    .from("events")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as EventRecord;
}

export async function cancelEvent(id: string) {
  return updateEvent(id, { status: "cancelled" });
}

export async function setRsvpCount(id: string, rsvpCount: number) {
  const { data, error } = await supabase
    .from("events")
    .update({ rsvp_count: Math.max(0, rsvpCount), updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as EventRecord;
}
