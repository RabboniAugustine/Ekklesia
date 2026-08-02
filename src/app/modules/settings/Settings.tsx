import { useEffect, useState } from "react";
import { Settings as SettingsIcon, Mail, MessageSquare, DollarSign, Save, UserPlus, X, Dices, Copy } from "lucide-react";
import { Badge } from "../../components/shared/Badge";
import { SectionHeader } from "../../components/shared/SectionHeader";
import { ComingSoonCard } from "../../components/shared/ComingSoonCard";
import { useAuth } from "../../context/AuthContext";
import {
  getChurch, updateChurchName,
  listTeamProfiles, updateProfileRole, setProfileActive, updateOwnName, updateOwnPassword,
  createTeamMember, ROLES, type ChurchRecord, type TeamProfile,
} from "../../services/settingsService";

const ADMIN_ROLES = ["super_admin", "admin", "pastor"];

function roleLabel(value: string) {
  return ROLES.find((r) => r.value === value)?.label ?? value;
}

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function CreateAccountModal({ onCancel, onCreated }: { onCancel: () => void; onCreated: () => void }) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("usher");
  const [password, setPassword] = useState(generatePassword());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !fullName.trim()) {
      setError("Name and email are required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    try {
      setSaving(true);
      await createTeamMember({ email, fullName, role, password });
      setCreated(true);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Could not create the account. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (created) {
    return (
      <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-lg">
          <h2 className="text-base font-semibold text-foreground mb-2">Account Created</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Share these sign-in details with {fullName} yourself (in person, a call, or a secure message).
            They can change their password anytime from My Account.
          </p>
          <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-2 mb-4">
            <div className="text-sm"><span className="text-muted-foreground">Email:</span> <span className="font-medium text-foreground">{email}</span></div>
            <div className="flex items-center justify-between">
              <div className="text-sm"><span className="text-muted-foreground">Password:</span> <span className="font-mono font-medium text-foreground">{password}</span></div>
              <button onClick={handleCopy} className="text-primary hover:text-primary/80 flex items-center gap-1 text-xs">
                <Copy size={12} /> {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
          <button
            onClick={onCreated}
            className="w-full px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">Create Team Member Account</h2>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>
        {error && <div className="mb-4 border border-rose-200 bg-rose-50 text-rose-700 rounded-lg p-3 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Full name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full border border-border bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-border bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full border border-border bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Initial password</label>
            <div className="flex gap-2 mt-1">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 border border-border bg-background rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="button"
                onClick={() => setPassword(generatePassword())}
                className="px-3 border border-border rounded-lg hover:bg-muted/60 transition-colors text-muted-foreground"
                title="Generate new password"
              >
                <Dices size={16} />
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">You'll see this password once after creating the account, to share with them yourself.</p>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onCancel} className="px-3 py-2 text-sm rounded-lg border border-border hover:bg-muted/60 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {saving ? "Creating..." : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
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
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  async function reloadTeam() {
    if (!profile?.church_id) return;
    try {
      setTeam(await listTeamProfiles(profile.church_id));
    } catch (err) {
      console.error(err);
    }
  }

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

  async function handleChangePassword() {
    setPasswordError("");
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    try {
      setChangingPassword(true);
      await updateOwnPassword(newPassword);
      setNewPassword("");
      setSaveMessage("Password changed.");
    } catch (err) {
      console.error(err);
      setPasswordError("Could not change your password. Please try again.");
    } finally {
      setChangingPassword(false);
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

        <div className="border-t border-border mt-5 pt-5">
          <label className="text-sm font-medium text-foreground">Change password</label>
          {passwordError && <p className="text-sm text-rose-600 mt-1">{passwordError}</p>}
          <div className="flex gap-2 mt-1 max-w-sm">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="flex-1 border border-border bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={handleChangePassword}
              disabled={changingPassword || !newPassword}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              {changingPassword ? "Saving..." : "Update"}
            </button>
          </div>
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
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-foreground">Team</h2>
          {isAdmin && (
            <button
              onClick={() => setShowCreateAccount(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <UserPlus size={14} /> Create Account
            </button>
          )}
        </div>
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
            Click a status badge to toggle active/deactivated. New accounts get a password you set and share
            with them directly; they can change it anytime from My Account.
          </p>
        )}
      </div>

      {showCreateAccount && (
        <CreateAccountModal
          onCancel={() => setShowCreateAccount(false)}
          onCreated={() => {
            setShowCreateAccount(false);
            reloadTeam();
          }}
        />
      )}

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
