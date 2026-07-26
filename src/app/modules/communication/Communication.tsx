import { useEffect, useState } from "react";
import { Mail, MessageSquare, Bell, Heart, X, Trash2, Check } from "lucide-react";
import { Badge } from "../../components/shared/Badge";
import { ComingSoonCard } from "../../components/shared/ComingSoonCard";
import { SectionHeader } from "../../components/shared/SectionHeader";
import { useAuth } from "../../context/AuthContext";
import {
  listAnnouncements, createAnnouncement, setAnnouncementActive, deleteAnnouncement,
  listPrayerRequests, createPrayerRequest, setPrayerRequestStatus, deletePrayerRequest,
  type Announcement, type PrayerRequest,
} from "../../services/communicationService";

function timeAgo(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function AnnouncementModal({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: (title: string, body: string) => Promise<void> }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!title.trim() || !body.trim()) {
      setError("Title and message are required.");
      return;
    }
    try {
      setSaving(true);
      await onSubmit(title, body);
    } catch (err) {
      console.error(err);
      setError("Something went wrong posting this. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">Post Announcement</h2>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>
        {error && <div className="mb-4 border border-rose-200 bg-rose-50 text-rose-700 rounded-lg p-3 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full border border-border bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Sunday Service Update"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              className="mt-1 w-full border border-border bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onCancel} className="px-3 py-2 text-sm rounded-lg border border-border hover:bg-muted/60 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {saving ? "Posting..." : "Post Announcement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PrayerRequestModal({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: (name: string, isPrivate: boolean, request: string) => Promise<void> }) {
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [request, setRequest] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!request.trim()) {
      setError("Please enter the prayer request.");
      return;
    }
    try {
      setSaving(true);
      await onSubmit(name, isPrivate, request);
    } catch (err) {
      console.error(err);
      setError("Something went wrong saving this. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">Add Prayer Request</h2>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>
        {error && <div className="mb-4 border border-rose-200 bg-rose-50 text-rose-700 rounded-lg p-3 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full border border-border bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="optional"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Request</label>
            <textarea
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              rows={3}
              className="mt-1 w-full border border-border bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="rounded border-border" />
            Keep name private (shows as "Anonymous")
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onCancel} className="px-3 py-2 text-sm rounded-lg border border-border hover:bg-muted/60 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {saving ? "Saving..." : "Add Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Communication() {
  const { profile } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showPrayerModal, setShowPrayerModal] = useState(false);

  async function load() {
    if (!profile?.church_id) return;
    setLoading(true);
    setLoadError("");

    const [announcementsResult, prayerResult] = await Promise.allSettled([
      listAnnouncements(profile.church_id),
      listPrayerRequests(profile.church_id),
    ]);

    if (announcementsResult.status === "fulfilled") setAnnouncements(announcementsResult.value);
    else console.error(announcementsResult.reason);

    if (prayerResult.status === "fulfilled") setPrayerRequests(prayerResult.value);
    else console.error(prayerResult.reason);

    if (announcementsResult.status === "rejected" || prayerResult.status === "rejected") {
      setLoadError("Some data could not be loaded. Please refresh and try again.");
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.church_id]);

  async function handlePostAnnouncement(title: string, body: string) {
    if (!profile?.church_id) return;
    const created = await createAnnouncement({ churchId: profile.church_id, createdBy: profile.id, title, body });
    setAnnouncements((prev) => [created, ...prev]);
    setShowAnnouncementModal(false);
  }

  async function handleArchiveAnnouncement(id: string) {
    const updated = await setAnnouncementActive(id, false);
    setAnnouncements((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  }

  async function handleDeleteAnnouncement(id: string) {
    await deleteAnnouncement(id);
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  }

  async function handleAddPrayerRequest(name: string, isPrivate: boolean, request: string) {
    if (!profile?.church_id) return;
    const created = await createPrayerRequest({ churchId: profile.church_id, requesterName: name || undefined, isPrivate, request });
    setPrayerRequests((prev) => [created, ...prev]);
    setShowPrayerModal(false);
  }

  async function handleMarkAnswered(id: string) {
    const updated = await setPrayerRequestStatus(id, "answered");
    setPrayerRequests((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  async function handleDeletePrayerRequest(id: string) {
    await deletePrayerRequest(id);
    setPrayerRequests((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-6">
      {loadError && <div className="border border-rose-200 bg-rose-50 text-rose-700 rounded-lg p-3 text-sm">{loadError}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ComingSoonCard icon={Mail} title="Email Broadcasts" note="Needs an email provider (e.g. Resend) wired up server-side" />
        <ComingSoonCard icon={MessageSquare} title="SMS Alerts" note="Needs an SMS provider (e.g. Twilio) wired up server-side" />
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center text-primary">
              <Bell size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Announcements</p>
              <p className="text-xs text-muted-foreground">{announcements.filter((a) => a.is_active).length} active</p>
            </div>
          </div>
          <button
            onClick={() => setShowAnnouncementModal(true)}
            className="w-full text-sm font-medium text-primary border border-primary/30 rounded-lg py-2 hover:bg-accent transition-colors"
          >
            Post Announcement
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <SectionHeader title="Announcements" />
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
          ) : announcements.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No announcements yet.</p>
          ) : (
            <div className="space-y-3">
              {announcements.map((a) => (
                <div key={a.id} className="py-3 border-b border-border last:border-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{a.title}</p>
                    {!a.is_active && <Badge variant="default">Archived</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{a.body}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span>{timeAgo(a.created_at)}</span>
                    {a.is_active && (
                      <button onClick={() => handleArchiveAnnouncement(a.id)} className="text-primary hover:text-primary/80">Archive</button>
                    )}
                    <button onClick={() => handleDeleteAnnouncement(a.id)} className="text-rose-600 hover:text-rose-700">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-foreground">Prayer Requests</h2>
            <button
              onClick={() => setShowPrayerModal(true)}
              className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              + Add Request
            </button>
          </div>
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
          ) : prayerRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No prayer requests yet.</p>
          ) : (
            <div className="space-y-3">
              {prayerRequests.map((p) => (
                <div key={p.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Heart size={14} className={`shrink-0 mt-0.5 ${p.status === "answered" ? "text-emerald-500" : "text-rose-500"}`} />
                  <div className="flex-1">
                    <p className={`text-sm text-foreground ${p.status === "answered" ? "line-through opacity-60" : ""}`}>{p.request}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {p.is_private ? "Anonymous" : p.requester_name || "Anonymous"} · {timeAgo(p.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {p.status === "open" ? (
                      <button onClick={() => handleMarkAnswered(p.id)} className="text-muted-foreground hover:text-emerald-600" title="Mark answered">
                        <Check size={14} />
                      </button>
                    ) : (
                      <Badge variant="success">Answered</Badge>
                    )}
                    <button onClick={() => handleDeletePrayerRequest(p.id)} className="text-muted-foreground hover:text-rose-600" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAnnouncementModal && (
        <AnnouncementModal onCancel={() => setShowAnnouncementModal(false)} onSubmit={handlePostAnnouncement} />
      )}

      {showPrayerModal && (
        <PrayerRequestModal onCancel={() => setShowPrayerModal(false)} onSubmit={handleAddPrayerRequest} />
      )}
    </div>
  );
}
