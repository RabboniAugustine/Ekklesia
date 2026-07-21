import { useEffect, useMemo, useState } from "react";
import { Plus, Users, X, UserPlus, Trash2, Heart } from "lucide-react";
import { Badge } from "../../components/shared/Badge";
import { useAuth } from "../../context/AuthContext";
import { listMembers, type MemberRecord } from "../../services/memberService";
import {
  listMinistries,
  createMinistry,
  updateMinistry,
  setMinistryStatus,
  listRoster,
  addRosterMember,
  removeRosterMember,
  type MinistryRecord,
  type RosterEntry,
} from "../../services/ministryService";

const CARD_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-pink-100 text-pink-700",
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
  "bg-amber-100 text-amber-700",
  "bg-red-100 text-red-700",
];

function memberName(m: { first_name: string; last_name: string } | null) {
  return m ? `${m.first_name} ${m.last_name}` : "No leader assigned";
}

type FormState = {
  name: string;
  description: string;
  leaderMemberId: string;
  status: string;
};

const EMPTY_FORM: FormState = { name: "", description: "", leaderMemberId: "", status: "active" };

function MinistryFormModal({
  title,
  initial,
  submitLabel,
  members,
  showStatus,
  onCancel,
  onSubmit,
  extraAction,
}: {
  title: string;
  initial: FormState;
  submitLabel: string;
  members: MemberRecord[];
  showStatus?: boolean;
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
    if (!form.name.trim()) {
      setError("Ministry name is required.");
      return;
    }
    try {
      setSaving(true);
      await onSubmit(form);
    } catch (err) {
      console.error(err);
      setError("Something went wrong saving this ministry. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>

        {error && <div className="mb-4 border border-rose-200 bg-rose-50 text-rose-700 rounded-lg p-3 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="mt-1 w-full border border-border bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Worship & Arts"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="mt-1 w-full border border-border bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              rows={2}
              placeholder="optional"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Leader</label>
            <select
              value={form.leaderMemberId}
              onChange={(e) => setForm((f) => ({ ...f, leaderMemberId: e.target.value }))}
              className="mt-1 w-full border border-border bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">No leader assigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
              ))}
            </select>
          </div>

          {showStatus && (
            <div>
              <label className="text-sm font-medium text-foreground">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="mt-1 w-full border border-border bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div>{extraAction}</div>
            <div className="flex gap-2">
              <button type="button" onClick={onCancel} className="px-3 py-2 text-sm rounded-lg border border-border hover:bg-muted/60 transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {saving ? "Saving..." : submitLabel}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function RosterModal({
  ministry,
  members,
  onClose,
}: {
  ministry: MinistryRecord;
  members: MemberRecord[];
  onClose: () => void;
}) {
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      setRoster(await listRoster(ministry.id));
    } catch (err) {
      console.error(err);
      setError("Could not load the roster.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ministry.id]);

  const availableMembers = useMemo(() => {
    const already = new Set(roster.map((r) => r.member_id));
    return members.filter((m) => !already.has(m.id));
  }, [members, roster]);

  async function handleAdd() {
    if (!selectedMemberId) return;
    try {
      const entry = await addRosterMember(ministry.id, selectedMemberId, roleTitle);
      setRoster((prev) => [...prev, entry]);
      setSelectedMemberId("");
      setRoleTitle("");
    } catch (err) {
      console.error(err);
      setError("Could not add that member to the roster.");
    }
  }

  async function handleRemove(id: string) {
    try {
      await removeRosterMember(id);
      setRoster((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
      setError("Could not remove that member.");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">{ministry.name} — Roster</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>

        {error && <div className="mb-4 border border-rose-200 bg-rose-50 text-rose-700 rounded-lg p-3 text-sm">{error}</div>}

        <div className="flex gap-2 mb-4">
          <select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="flex-1 border border-border bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Select a member...</option>
            {availableMembers.map((m) => (
              <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
            ))}
          </select>
          <input
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            placeholder="Role (optional)"
            className="w-36 border border-border bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={handleAdd}
            disabled={!selectedMemberId}
            className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <UserPlus size={14} /> Add
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-6">Loading roster...</p>
        ) : roster.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No one on this roster yet.</p>
        ) : (
          <div className="space-y-1">
            {roster.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{memberName(r.member)}</p>
                  {r.role_title && <p className="text-xs text-muted-foreground">{r.role_title}</p>}
                </div>
                <button onClick={() => handleRemove(r.id)} className="text-muted-foreground hover:text-rose-600 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function Ministries() {
  const { profile } = useAuth();
  const [ministries, setMinistries] = useState<MinistryRecord[]>([]);
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<MinistryRecord | null>(null);
  const [viewingRoster, setViewingRoster] = useState<MinistryRecord | null>(null);

  async function load() {
    if (!profile?.church_id) return;
    try {
      setLoading(true);
      setLoadError("");
      const [ministryList, memberList] = await Promise.all([
        listMinistries(profile.church_id),
        listMembers(profile.church_id),
      ]);
      setMinistries(ministryList);
      setMembers(memberList);
    } catch (err) {
      console.error(err);
      setLoadError("Could not load ministries. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.church_id]);

  async function handleCreate(form: FormState) {
    if (!profile?.church_id) return;
    const created = await createMinistry({
      churchId: profile.church_id,
      name: form.name,
      description: form.description || undefined,
      leaderMemberId: form.leaderMemberId || null,
    });
    setMinistries((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    setShowAdd(false);
  }

  async function handleUpdate(form: FormState) {
    if (!editing) return;
    const updated = await updateMinistry(editing.id, {
      name: form.name,
      description: form.description,
      leaderMemberId: form.leaderMemberId || null,
      status: form.status,
    });
    setMinistries((prev) =>
      prev.map((m) => (m.id === updated.id ? { ...updated, member_count: m.member_count } : m)).sort((a, b) => a.name.localeCompare(b.name))
    );
    setEditing(null);
  }

  async function handleArchive() {
    if (!editing) return;
    const updated = await setMinistryStatus(editing.id, "inactive");
    setMinistries((prev) => prev.map((m) => (m.id === updated.id ? { ...updated, member_count: m.member_count } : m)));
    setEditing(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div />
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus size={14} /> New Ministry
        </button>
      </div>

      {loadError && <div className="border border-rose-200 bg-rose-50 text-rose-700 rounded-lg p-3 text-sm">{loadError}</div>}

      {loading && <div className="bg-card border border-border rounded-lg p-8 text-center text-sm text-muted-foreground">Loading ministries...</div>}

      {!loading && ministries.length === 0 && (
        <div className="bg-card border border-border rounded-lg p-8 text-center text-sm text-muted-foreground">
          No ministries yet. Add your first one.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {ministries.map((m, i) => (
          <div
            key={m.id}
            onClick={() => setViewingRoster(m)}
            className="bg-card border border-border rounded-lg p-5 hover:shadow-sm transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${CARD_COLORS[i % CARD_COLORS.length]}`}>
                  <Heart size={18} />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{memberName(m.leader)}</p>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setEditing(m); }}
                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors shrink-0"
              >
                Edit
              </button>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5"><Users size={13} />{m.member_count} on roster</span>
              <Badge variant={m.status === "active" ? "info" : "warning"}>{m.status === "active" ? "Active" : "Inactive"}</Badge>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <MinistryFormModal
          title="New Ministry"
          initial={EMPTY_FORM}
          submitLabel="Create Ministry"
          members={members}
          onCancel={() => setShowAdd(false)}
          onSubmit={handleCreate}
        />
      )}

      {editing && (
        <MinistryFormModal
          title={`Edit ${editing.name}`}
          initial={{
            name: editing.name,
            description: editing.description ?? "",
            leaderMemberId: editing.leader_member_id ?? "",
            status: editing.status,
          }}
          submitLabel="Save Changes"
          members={members}
          showStatus
          onCancel={() => setEditing(null)}
          onSubmit={handleUpdate}
          extraAction={
            editing.status === "active" && (
              <button type="button" onClick={handleArchive} className="text-sm text-rose-600 hover:text-rose-700">
                Mark Inactive
              </button>
            )
          }
        />
      )}

      {viewingRoster && (
        <RosterModal
          ministry={ministries.find((m) => m.id === viewingRoster.id) ?? viewingRoster}
          members={members}
          onClose={() => {
            setViewingRoster(null);
            load(); // refresh member_count after roster edits
          }}
        />
      )}
    </div>
  );
}
