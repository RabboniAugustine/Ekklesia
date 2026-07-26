import { useEffect, useState } from "react";
import { Settings as SettingsIcon, Mail, MessageSquare, DollarSign, Save } from "lucide-react";
import { Badge } from "../../components/shared/Badge";
import { SectionHeader } from "../../components/shared/SectionHeader";
import { ComingSoonCard } from "../../components/shared/ComingSoonCard";
import { useAuth } from "../../context/AuthContext";
import {
  getChurch, updateChurchName,
  listTeamProfiles, updateProfileRole, setProfileActive, updateOwnName,
  ROLES, type ChurchRecord, type TeamProfile,
} from "../../services/settingsService";

const ADMIN_ROLES = ["super_admin", "admin", "pastor"];

function roleLabel(value: string) {
  return ROLES.find((r) => r.value === value)?.label ?? value;
}

export function Settings() {
  const { profile, refresh } = useAuth();
  const isAdmin = !!profile && ADMIN_ROLES.includes(profile.role);

  const [church, setChurch] = useState<ChurchRecord | null>(null);
  const [churchNameDraft, setChurchNameDraft] = useState("");
  const [team, setTeam] = useState<TeamProfile[]>([]);
  const [myName, setMyName] = useState(profile?.full_name ?? "");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile?.church_id) return;
    setLoading(true);
    setLoadError("");

    Promise.all([getChurch(profile.church_id), listTeamProfiles(profile.church_id)])
      .then(([churchData, teamData]) => {
        setChurch(churchData);
        setChurchNameDraft(churchData.name);
        setTeam(teamData);
      })
      .catch((err) => {
        console.error(err);
        setLoadError("Could not load settings. Please refresh and try again.");
      })
      .finally(() => setLoading(false));
  }, [profile?.church_id]);

  async function handleSaveMyName() {
    if (!profile || !myName.trim()) return;
    try {
      setSaving(true);
      await updateOwnName(profile.id, myName);
      await refresh();
      setSaveMessage("Profile updated.");
    } catch (err) {
      console.error(err);
      setLoadError("Could not save your name. Please try again.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(""), 2500);
    }
  }

  async function handleSaveChurchName() {
    if (!profile?.church_id || !churchNameDraft.trim()) return;
    try {
      setSaving(true);
      const updated = await updateChurchName(profile.church_id, churchNameDraft);
      setChurch(updated);
      setSaveMessage("Church profile updated.");
    } catch (err) {
      console.error(err);
      setLoadError("Could not save the church name. Please try again.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(""), 2500);
    }
  }

  async function handleRoleChange(id: string, role: string) {
    try {
      const updated = await updateProfileRole(id, role);
      setTeam((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      console.error(err);
      setLoadError("Could not update that teammate's role.");
    }
  }

  async function handleToggleActive(member: TeamProfile) {
    try {
      const updated = await setProfileActive(member.id, !member.is_active);
      setTeam((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      console.error(err);
      setLoadError("Could not update that teammate's status.");
    }
  }

  if (loading) {
    return <div className="bg-card border border-border rounded-lg p-8 text-center text-sm text-muted-foreground">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      {loadError && <div className="border border-rose-200 bg-rose-50 text-rose-700 rounded-lg p-3 text-sm">{loadError}</div>}
      {saveMessage && <div className="border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-lg p-3 text-sm">{saveMessage}</div>}

      <div className="bg-card border border-border rounded-lg p-6">
        <SectionHeader title="My Account" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground">Full name</label>
            <input
              value={myName}
              onChange={(e) => setMyName(e.target.value)}
              className="mt-1 w-full border border-border bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Email</label>
            <input
              value={profile?.email ?? ""}
              disabled
              className="mt-1 w-full border border-border bg-muted/50 rounded-lg px-3 py-2 text-sm text-muted-foreground"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleSaveMyName}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Save size={14} /> Save
          </button>
          <Badge variant="info">{roleLabel(profile?.role ?? "")}</Badge>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <SectionHeader title="Church Profile" />
        {isAdmin ? (
          <>
            <div className="max-w-sm">
              <label className="text-sm font-medium text-foreground">Church name</label>
              <input
                value={churchNameDraft}
                onChange={(e) => setChurchNameDraft(e.target.value)}
                className="mt-1 w-full border border-border bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <button
              onClick={handleSaveChurchName}
              disabled={saving}
              className="mt-4 flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <Save size={14} /> Save
            </button>
          </>
        ) : (
          <p className="text-sm text-foreground">{church?.name}</p>
        )}
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <SectionHeader title="Team" />
        {!isAdmin && (
          <p className="text-xs text-muted-foreground mb-3">Only admins, pastors, and super admins can change roles or status.</p>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2 pr-4">Name</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2 pr-4">Email</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2 pr-4">Role</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {team.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0">
                  <td className="py-3 pr-4 text-sm font-medium text-foreground">{t.full_name}</td>
                  <td className="py-3 pr-4 text-sm text-muted-foreground">{t.email ?? "—"}</td>
                  <td className="py-3 pr-4">
                    {isAdmin ? (
                      <select
                        value={t.role}
                        onChange={(e) => handleRoleChange(t.id, e.target.value)}
                        className="border border-border bg-background rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        {ROLES.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-sm text-muted-foreground">{roleLabel(t.role)}</span>
                    )}
                  </td>
                  <td className="py-3">
                    {isAdmin ? (
                      <button onClick={() => handleToggleActive(t)}>
                        <Badge variant={t.is_active ? "success" : "danger"}>{t.is_active ? "Active" : "Deactivated"}</Badge>
                      </button>
                    ) : (
                      <Badge variant={t.is_active ? "success" : "danger"}>{t.is_active ? "Active" : "Deactivated"}</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isAdmin && (
          <p className="text-xs text-muted-foreground mt-3">
            Click a status badge to toggle active/deactivated. New staff accounts still need to be created directly in Supabase Auth —
            self-service invites would need a server-side function, which isn't built yet.
          </p>
        )}
      </div>

      <div>
        <SectionHeader title="Integrations" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ComingSoonCard icon={Mail} title="Email Provider" note="Needed for Communication's Email Broadcasts" />
          <ComingSoonCard icon={MessageSquare} title="SMS Provider" note="Needed for Communication's SMS Alerts" />
          <ComingSoonCard icon={DollarSign} title="Payment Processor" note="Needed for the Finance module" />
        </div>
      </div>

      <div className="bg-card border border-dashed border-border rounded-lg p-6 flex items-start gap-3">
        <SettingsIcon size={18} className="text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          Data access is scoped per church using row-level security in Supabase — no extra configuration needed here.
          Credentials (API keys, tokens) are never stored in this app; they're managed directly in Supabase and Vercel.
        </p>
      </div>
    </div>
  );
}
