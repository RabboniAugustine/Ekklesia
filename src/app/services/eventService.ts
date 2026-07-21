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
  status: string;
  series_id: string | null;
  created_at: string;
};

const EVENT_COLUMNS =
  "id, church_id, title, description, location, event_type, start_at, end_at, capacity, status, series_id, created_at";

export async function listUpcomingEvents(churchId: string, limit?: number) {
  let query = supabase
    .from("events")
    .select(EVENT_COLUMNS)
    .eq("church_id", churchId)
    .neq("status", "cancelled")
    .gte("start_at", new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()) // include events from the last 6h
    .order("start_at", { ascending: true });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as EventRecord[];
}

export async function listPastEvents(churchId: string, limit = 10) {
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_COLUMNS)
    .eq("church_id", churchId)
    .lt("start_at", new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString())
    .order("start_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as EventRecord[];
}

type CreateEventParams = {
  churchId: string;
  createdBy?: string;
  title: string;
  description?: string;
  location?: string;
  eventType: string;
  startAt: string;
  endAt?: string;
  capacity?: number | null;
};

export async function createEvent(params: CreateEventParams) {
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

export type RepeatFrequency = "weekly" | "biweekly" | "monthly";

function addOccurrence(date: Date, frequency: RepeatFrequency, index: number) {
  const d = new Date(date);
  if (frequency === "weekly") d.setDate(d.getDate() + 7 * index);
  else if (frequency === "biweekly") d.setDate(d.getDate() + 14 * index);
  else if (frequency === "monthly") d.setMonth(d.getMonth() + index);
  return d;
}

/** Creates a series of events sharing a series_id, one per occurrence. */
export async function createEventSeries(
  params: CreateEventParams & { frequency: RepeatFrequency; occurrences: number }
) {
  const seriesId = crypto.randomUUID();
  const startDate = new Date(params.startAt);
  const endDate = params.endAt ? new Date(params.endAt) : null;
  const durationMs = endDate ? endDate.getTime() - startDate.getTime() : null;

  const rows = Array.from({ length: params.occurrences }, (_, i) => {
    const occurrenceStart = addOccurrence(startDate, params.frequency, i);
    const occurrenceEnd = durationMs != null ? new Date(occurrenceStart.getTime() + durationMs) : null;
    return {
      church_id: params.churchId,
      created_by: params.createdBy ?? null,
      title: params.title.trim(),
      description: params.description?.trim() || null,
      location: params.location?.trim() || null,
      event_type: params.eventType,
      start_at: occurrenceStart.toISOString(),
      end_at: occurrenceEnd ? occurrenceEnd.toISOString() : null,
      capacity: params.capacity ?? null,
      series_id: seriesId,
    };
  });

  const { data, error } = await supabase.from("events").insert(rows).select();
  if (error) throw error;
  return (data ?? []) as EventRecord[];
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
