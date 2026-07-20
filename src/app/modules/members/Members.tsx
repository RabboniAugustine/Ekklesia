import { useEffect, useMemo, useState } from "react";
import { Search, Filter, Plus, Mail, Phone, X } from "lucide-react";
import { Badge } from "../../components/shared/Badge";
import { useAuth } from "../../context/AuthContext";
import {
  listMembers,
  createMember,
  updateMember,
  setMemberStatus,
  type MemberRecord,
} from "../../services/memberService";

const MEMBER_TYPES = [
  { value: "member", label: "Member" },
  { value: "visitor", label: "Visitor" },
  { value: "child", label: "Child" },
  { value: "staff", label: "Staff" },
  { value: "leader", label: "Leader" },
];

function typeLabel(value: string) {
  return MEMBER_TYPES.find((t) => t.value === value)?.label ?? value;
}

function initials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

type FormState = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  memberType: string;
  status: string;
};

const EMPTY_FORM: FormState = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  memberType: "member",
  status: "active",
};

function MemberFormModal({
  title,
  initial,
  submitLabel,
  onCancel,
  onSubmit,
  showStatus,
  extraAction,
}: {
  title: string;
  initial: FormState;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (form: FormState) => Promise<void>;
  showStatus?: boolean;
  extraAction?: React.ReactNode;
}) {
  const [form, setForm] = useState<FormState>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("First and last name are required.");
      return;
    }

    try {
      setSaving(true);
      await onSubmit(form);
    } catch (err) {
      console.error(err);
      setError("Something went wrong saving this member. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4" onClick={onCancel}>
      <div
        className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-lg"
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground">First name</label>
              <input
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                className="mt-1 w-full border border-border bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Last name</label>
              <input
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                className="mt-1 w-full border border-border bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="mt-1 w-full border border-border bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="optional"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="mt-1 w-full border border-border bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="optional"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground">Type</label>
              <select
                value={form.memberType}
                onChange={(e) => setForm((f) => ({ ...f, memberType: e.target.value }))}
                className="mt-1 w-full border border-border bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {MEMBER_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
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
                  <option value="archived">Archived</option>
                </select>
              </div>
            )}
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

export function Members() {
  const { profile } = useAuth();
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<MemberRecord | null>(null);

  async function load() {
    if (!profile?.church_id) return;
    try {
      setLoading(true);
      setLoadError("");
      const data = await listMembers(profile.church_id);
      setMembers(data);
    } catch (err) {
      console.error(err);
      setLoadError("Could not load members. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.church_id]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return members;
    return members.filter((m) =>
      `${m.first_name} ${m.last_name}`.toLowerCase().includes(term) ||
      (m.email ?? "").toLowerCase().includes(term) ||
      (m.phone ?? "").toLowerCase().includes(term) ||
      m.member_type.toLowerCase().includes(term)
    );
  }, [members, search]);

  const stats = useMemo(() => {
    const total = members.length;
    const active = members.filter((m) => m.status === "active").length;
    const inactive = members.filter((m) => m.status === "inactive").length;
    const visitors = members.filter((m) => m.member_type === "visitor").length;
    const children = members.filter((m) => m.member_type === "child").length;
    return [
      { label: "Active", count: active, pct: total ? Math.round((active / total) * 100) : 0, color: "bg-primary" },
      { label: "Inactive", count: inactive, pct: total ? Math.round((inactive / total) * 100) : 0, color: "bg-muted-foreground" },
      { label: "Visitors", count: visitors, pct: total ? Math.round((visitors / total) * 100) : 0, color: "bg-sky-400" },
      { label: "Children", count: children, pct: total ? Math.round((children / total) * 100) : 0, color: "bg-violet-400" },
    ];
  }, [members]);

  const recentlyAdded = useMemo(
    () => [...members].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5),
    [members]
  );

  async function handleCreate(form: FormState) {
    if (!profile?.church_id) return;
    const created = await createMember({
      churchId: profile.church_id,
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone || undefined,
      email: form.email || undefined,
      memberType: form.memberType,
    });
    setMembers((prev) => [...prev, created].sort((a, b) => a.last_name.localeCompare(b.last_name)));
    setShowAdd(false);
  }

  async function handleUpdate(form: FormState) {
    if (!editing) return;
    const updated = await updateMember(editing.id, {
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
      email: form.email,
      memberType: form.memberType,
      status: form.status,
    });
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    setEditing(null);
  }

  async function handleArchive() {
    if (!editing) return;
    const updated = await setMemberStatus(editing.id, "archived");
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    setEditing(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search members..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg bg-card hover:bg-muted/60 transition-colors text-foreground">
            <Filter size={14} /> Filter
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={14} /> Add Member
          </button>
        </div>
      </div>

      {loadError && (
        <div className="border border-rose-200 bg-rose-50 text-rose-700 rounded-lg p-3 text-sm">
          {loadError}
        </div>
      )}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Name</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 hidden md:table-cell">Type</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Contact</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Joined</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">
                  Loading members...
                </td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">
                  {members.length === 0 ? "No members yet. Add your first one." : "No members match your search."}
                </td>
              </tr>
            )}

            {!loading && filtered.map((m) => (
              <tr
                key={m.id}
                onClick={() => setEditing(m)}
                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-primary text-xs font-semibold shrink-0">
                      {initials(m.first_name, m.last_name)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{m.first_name} {m.last_name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-sm text-muted-foreground hidden md:table-cell">{typeLabel(m.member_type)}</td>
                <td className="px-5 py-3.5 hidden lg:table-cell">
                  {m.email && <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Mail size={11} />{m.email}</p>}
                  {m.phone && <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5"><Phone size={11} />{m.phone}</p>}
                  {!m.email && !m.phone && <p className="text-xs text-muted-foreground">—</p>}
                </td>
                <td className="px-5 py-3.5 text-sm text-muted-foreground hidden sm:table-cell">{formatDate(m.created_at)}</td>
                <td className="px-5 py-3.5">
                  <Badge variant={m.status === "active" ? "success" : m.status === "inactive" ? "warning" : "danger"}>
                    {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Membership Breakdown</h3>
          <div className="space-y-3">
            {stats.map(s => (
              <div key={s.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="font-medium text-foreground">{s.count}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Recently Added</h3>
          {recentlyAdded.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing yet.</p>
          ) : (
            <div className="space-y-2.5">
              {recentlyAdded.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm text-foreground">{m.first_name} {m.last_name}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(m.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAdd && (
        <MemberFormModal
          title="Add Member"
          initial={EMPTY_FORM}
          submitLabel="Add Member"
          onCancel={() => setShowAdd(false)}
          onSubmit={handleCreate}
        />
      )}

      {editing && (
        <MemberFormModal
          title={`Edit ${editing.first_name} ${editing.last_name}`}
          initial={{
            firstName: editing.first_name,
            lastName: editing.last_name,
            phone: editing.phone ?? "",
            email: editing.email ?? "",
            memberType: editing.member_type,
            status: editing.status,
          }}
          submitLabel="Save Changes"
          showStatus
          onCancel={() => setEditing(null)}
          onSubmit={handleUpdate}
          extraAction={
            editing.status !== "archived" && (
              <button
                type="button"
                onClick={handleArchive}
                className="text-sm text-rose-600 hover:text-rose-700"
              >
                Archive
              </button>
            )
          }
        />
      )}
    </div>
  );
}
