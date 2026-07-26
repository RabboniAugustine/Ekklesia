import { useEffect, useState } from "react";
import { BarChart2, DollarSign, Users, Star, Download, FileText } from "lucide-react";
import { StatCard } from "../../components/shared/StatCard";
import { SectionHeader } from "../../components/shared/SectionHeader";
import { ComingSoonCard } from "../../components/shared/ComingSoonCard";
import { useAuth } from "../../context/AuthContext";
import {
  getYtdStats, getMinistryEngagement,
  exportMembershipCsv, exportAttendanceCsv, exportMinistryEngagementCsv,
  type YtdStats, type MinistryEngagement,
} from "../../services/reportService";

const AVAILABLE_REPORTS = [
  { label: "Attendance Report (CSV)", key: "attendance" as const },
  { label: "Membership Report (CSV)", key: "membership" as const },
  { label: "Ministry Engagement (CSV)", key: "ministry" as const },
];

const NOT_YET_AVAILABLE = [
  "Annual Giving Statement", "Donor Receipts (Tax-Compliant)", "Expense & Budget Report",
  "Visitor Conversion Report", "Volunteer Hours Log",
];

export function Reports() {
  const { profile } = useAuth();
  const churchId = profile?.church_id;

  const [stats, setStats] = useState<YtdStats | null>(null);
  const [engagement, setEngagement] = useState<MinistryEngagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    if (!churchId) return;
    setLoading(true);
    setLoadError("");

    Promise.all([getYtdStats(churchId), getMinistryEngagement(churchId)])
      .then(([s, e]) => { setStats(s); setEngagement(e); })
      .catch((err) => {
        console.error(err);
        setLoadError("Could not load report data. Please refresh and try again.");
      })
      .finally(() => setLoading(false));
  }, [churchId]);

  async function handleExport(key: "attendance" | "membership" | "ministry") {
    if (!churchId) return;
    try {
      setExporting(key);
      if (key === "attendance") await exportAttendanceCsv(churchId);
      if (key === "membership") await exportMembershipCsv(churchId);
      if (key === "ministry") await exportMinistryEngagementCsv(churchId);
    } catch (err) {
      console.error(err);
      setLoadError("Could not generate that export. Please try again.");
    } finally {
      setExporting(null);
    }
  }

  const maxEngagement = Math.max(1, ...engagement.map((e) => e.memberCount));

  return (
    <div className="space-y-6">
      {loadError && <div className="border border-rose-200 bg-rose-50 text-rose-700 rounded-lg p-3 text-sm">{loadError}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Avg. Attendance"
          value={loading ? "—" : String(stats?.avgAttendance ?? 0)}
          sub="Per service, YTD"
          trend="neutral"
          icon={BarChart2}
          color="bg-blue-50 text-primary"
        />
        <ComingSoonCard icon={DollarSign} title="YTD Giving" note="Not tracked yet — needs the Finance module" />
        <StatCard
          label="New Members"
          value={loading ? "—" : String(stats?.newMembersYtd ?? 0)}
          sub="YTD"
          trend="up"
          icon={Users}
          color="bg-violet-50 text-violet-700"
        />
        <StatCard
          label="Baptisms"
          value={loading ? "—" : String(stats?.baptismsYtd ?? 0)}
          sub="YTD"
          trend="up"
          icon={Star}
          color="bg-amber-50 text-amber-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComingSoonCard icon={DollarSign} title="Giving Report" note="Not tracked yet — needs the Finance module" />

        <div className="bg-card border border-border rounded-lg p-6">
          <SectionHeader title="Ministry Engagement" />
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
          ) : engagement.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No active ministries yet.</p>
          ) : (
            <div className="space-y-4 mt-2">
              {engagement.map((m) => (
                <div key={m.name}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-foreground">{m.name}</span>
                    <span className="text-muted-foreground">{m.memberCount} on roster</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${(m.memberCount / maxEngagement) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-foreground">Available Reports</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {AVAILABLE_REPORTS.map((r) => (
            <button
              key={r.key}
              onClick={() => handleExport(r.key)}
              disabled={exporting === r.key}
              className="flex items-center gap-3 p-3.5 rounded-lg border border-border bg-muted/30 hover:bg-accent hover:border-primary/30 transition-all text-left group disabled:opacity-50"
            >
              <Download size={15} className="text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
              <span className="text-sm text-foreground">{exporting === r.key ? "Preparing..." : r.label}</span>
            </button>
          ))}

          {NOT_YET_AVAILABLE.map((r) => (
            <div
              key={r}
              className="flex items-center gap-3 p-3.5 rounded-lg border border-dashed border-border text-left opacity-60"
            >
              <FileText size={15} className="text-muted-foreground shrink-0" />
              <div>
                <span className="text-sm text-foreground">{r}</span>
                <p className="text-xs text-muted-foreground">Needs a module not built yet</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
