import { useEffect, useMemo, useState } from "react";
import { Plus, MapPin, X, Minus } from "lucide-react";
import { ComingSoonCard } from "../../components/shared/ComingSoonCard";
import { useAuth } from "../../context/AuthContext";
import {
  listUpcomingEvents,
  createEvent,
  updateEvent,
  cancelEvent,
  setRsvpCount,
  type EventRecord,
} from "../../services/eventService";

const EVENT_TYPES = [
  { value: "service", label: "Service" },
  { value: "study", label: "Bible Study" },
  { value: "rehearsal", label: "Rehearsal" },
  { value: "outreach", label: "Outreach" },
  { value: "meeting", label: "Meeting" },
  { value: "other", label: "Other" },
];

const TYPE_STYLES: Record<string, string> = {
  service: "bg-blue-50 border-blue-200",
  study: "bg-emerald-50 border-emerald-200",
  rehearsal: "bg-amber-50 border-amber-200",
  outreach: "bg-violet-50 border-violet-200",
  meeting: "bg-slate-50 border-slate-200",
  other: "bg-slate-50 border-slate-200",
};

function typeLabel(value: string) {
  return EVENT_TYPES.find((t) => t.value === value)?.label ?? value;
}

function toLocalInputValue(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDateBadge(iso: string) {
  const d = new Date(iso);
  return {
    month: d.toLocaleDateString(undefined, { month: "short" }),
    day: d.getDate(),
  };
}

function formatTimeRange(startIso: string, endIso: string | null) {
  const opts: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };
  const start = new Date(startIso).toLocaleTimeString(undefined, opts);
  if (!endIso) return start;
  return `${start} – ${new Date(endIso).toLocaleTimeString(undefined, opts)}`;
}

type FormState = {
  title: string;
  description: string;
  location: string;
  eventType: string;
  startAt: string;
  endAt: string;
  capacity: string;
};

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  location: "",
  eventType: "service",
  startAt: "",
  endAt: "",
  capacity: "",
};

function EventFormModal({
  title,
  initial,
  submitLabel,
  onCancel,
  onSubmit,
  extraAction,
}: {
  title: string;
  initial: FormState;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (form: FormState) => Promise<void>;
  extraAction?: React.ReactNode;
}) {
  const [form, setForm] = useState<FormState>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!form.startAt) {
      setError("Start date and time are required.");
      return;
    }

    try {
      setSaving(true);
      await onSubmit(form);
    } catch (err) {
      console.error(err);
      setError("Something went wrong saving this event. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4" onClick={onCancel}>
      <div
        className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 border border-rose-200 bg-rose-50 text-rose-700 rounded-lg p-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="mt-1 w-full border border-border bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Sunday Morning Service"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="mt-1 w-full border border-border bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="optional"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground">Starts</label>
              <input
                type="datetime-local"
                value={form.startAt}
                onChange={(e) => setForm((f) => ({ ...f, startAt: e.target.value }))}
                className="mt-1 w-full border border-border bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Ends</label>
              <input
                type="datetime-local"
                value={form.endAt}
                onChange={(e) => setForm((f) => ({ ...f, endAt: e.target.value }))}
                className="mt-1 w-full border border-border bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Location</label>
            <input
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className="mt-1 w-full border border-border bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Main Sanctuary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground">Type</label>
              <select
                value={form.eventType}
                onChange={(e) => setForm((f) => ({ ...f, eventType: e.target.value }))}
                className="mt-1 w-full border border-border bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Capacity</label>
              <input
                type="number"
                min={0}
                value={form.capacity}
                onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                className="mt-1 w-full border border-border bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="optional"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>{extraAction}</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-2 text-sm rounded-lg border border-border hover:bg-muted/60 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving..." : submitLabel}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Events() {
  const { profile } = useAuth();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<EventRecord | null>(null);

  async function load() {
    if (!profile?.church_id) return;
    try {
      setLoading(true);
      setLoadError("");
      const data = await listUpcomingEvents(profile.church_id);
      setEvents(data);
    } catch (err) {
      console.error(err);
      setLoadError("Could not load events. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.church_id]);

  const monthLabel = useMemo(() => new Date().toLocaleDateString(undefined, { month: "long", year: "numeric" }), []);

  async function handleCreate(form: FormState) {
    if (!profile?.church_id) return;
    const created = await createEvent({
      churchId: profile.church_id,
      createdBy: profile.id,
      title: form.title,
      description: form.description || undefined,
      location: form.location || undefined,
      eventType: form.eventType,
      startAt: new Date(form.startAt).toISOString(),
      endAt: form.endAt ? new Date(form.endAt).toISOString() : undefined,
      capacity: form.capacity ? Number(form.capacity) : null,
    });
    setEvents((prev) => [...prev, created].sort((a, b) => a.start_at.localeCompare(b.start_at)));
    setShowAdd(false);
  }

  async function handleUpdate(form: FormState) {
    if (!editing) return;
    const updated = await updateEvent(editing.id, {
      title: form.title,
      description: form.description,
      location: form.location,
      eventType: form.eventType,
      startAt: new Date(form.startAt).toISOString(),
      endAt: form.endAt ? new Date(form.endAt).toISOString() : null,
      capacity: form.capacity ? Number(form.capacity) : null,
    });
    setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)).sort((a, b) => a.start_at.localeCompare(b.start_at)));
    setEditing(null);
  }

  async function handleCancelEvent() {
    if (!editing) return;
    const updated = await cancelEvent(editing.id);
    setEvents((prev) => prev.filter((e) => e.id !== updated.id));
    setEditing(null);
  }

  async function adjustRsvp(ev: EventRecord, delta: number) {
    try {
      const updated = await setRsvpCount(ev.id, ev.rsvp_count + delta);
      setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Church Calendar — {monthLabel}</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus size={14} /> New Event
        </button>
      </div>

      {loadError && (
        <div className="border border-rose-200 bg-rose-50 text-rose-700 rounded-lg p-3 text-sm">
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {loading && (
            <div className="bg-card border border-border rounded-lg p-8 text-center text-sm text-muted-foreground">
              Loading events...
            </div>
          )}

          {!loading && events.length === 0 && (
            <div className="bg-card border border-border rounded-lg p-8 text-center text-sm text-muted-foreground">
              No upcoming events. Add your first one.
            </div>
          )}

          {!loading && events.map((e) => {
            const pct = e.capacity ? Math.round((e.rsvp_count / e.capacity) * 100) : null;
            const badge = formatDateBadge(e.start_at);
            return (
              <div key={e.id} className={`bg-card border rounded-lg p-5 flex items-start gap-4 ${TYPE_STYLES[e.event_type] || "border-border"}`}>
                <div className="bg-primary text-primary-foreground rounded-lg w-12 h-12 flex flex-col items-center justify-center shrink-0">
                  <span className="text-xs font-medium leading-tight">{badge.month}</span>
                  <span className="text-lg font-bold leading-tight">{badge.day}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{e.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {formatTimeRange(e.start_at, e.end_at)}
                    {e.location && <> · <span className="inline-flex items-center gap-1"><MapPin size={11} />{e.location}</span></>}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      onClick={() => adjustRsvp(e, -1)}
                      disabled={e.rsvp_count <= 0}
                      className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-40 shrink-0"
                    >
                      <Minus size={11} />
                    </button>
                    {pct !== null ? (
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                    ) : (
                      <div className="flex-1" />
                    )}
                    <button
                      onClick={() => adjustRsvp(e, 1)}
                      className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted shrink-0"
                    >
                      <Plus size={11} />
                    </button>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {e.rsvp_count}{e.capacity ? `/${e.capacity}` : ""} RSVPs
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setEditing(e)}
                  className="text-xs font-medium text-primary hover:text-primary/80 transition-colors shrink-0"
                >
                  Manage
                </button>
              </div>
            );
          })}
        </div>

        <div className="space-y-5">
          <ComingSoonCard icon={MapPin} title="Room Bookings" note="Not tracked yet — needs a rooms/scheduling module" />
          <ComingSoonCard icon={Plus} title="Recurring Services" note="Not tracked yet — each event is created individually for now" />
        </div>
      </div>

      {showAdd && (
        <EventFormModal
          title="New Event"
          initial={EMPTY_FORM}
          submitLabel="Create Event"
          onCancel={() => setShowAdd(false)}
          onSubmit={handleCreate}
        />
      )}

      {editing && (
        <EventFormModal
          title={`Edit ${editing.title}`}
          initial={{
            title: editing.title,
            description: editing.description ?? "",
            location: editing.location ?? "",
            eventType: editing.event_type,
            startAt: toLocalInputValue(editing.start_at),
            endAt: toLocalInputValue(editing.end_at),
            capacity: editing.capacity != null ? String(editing.capacity) : "",
          }}
          submitLabel="Save Changes"
          onCancel={() => setEditing(null)}
          onSubmit={handleUpdate}
          extraAction={
            <button
              type="button"
              onClick={handleCancelEvent}
              className="text-sm text-rose-600 hover:text-rose-700"
            >
              Cancel Event
            </button>
          }
        />
      )}
    </div>
  );
}
