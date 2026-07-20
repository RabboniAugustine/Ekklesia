import { useEffect, useMemo, useState } from "react";
import {
  AreaChart, Area, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { Users, BarChart2, DollarSign, Heart, Calendar, MessageSquare } from "lucide-react";
import { StatCard } from "../../components/shared/StatCard";
import { SectionHeader } from "../../components/shared/SectionHeader";
import { ComingSoonCard } from "../../components/shared/ComingSoonCard";
import { useAuth } from "../../context/AuthContext";
import {
  getMemberSummary, getAttendanceTrend, getLatestServiceStat,
  type MemberSummary, type MonthlyAttendance, type LatestServiceStat,
} from "../../services/dashboardService";

function pctChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? "New activity" : "No change";
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return "No change vs previous";
  return `${pct > 0 ? "+" : ""}${pct}% vs previous`;
}

export function Dashboard() {
  const { profile } = useAuth();
  const churchId = profile?.church_id;

  const [memberSummary, setMemberSummary] = useState<MemberSummary | null>(null);
  const [trend, setTrend] = useState<MonthlyAttendance[]>([]);
  const [latestService, setLatestService] = useState<LatestServiceStat | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!churchId) return;

    setLoading(true);
    setLoadError("");

    Promise.all([
      getMemberSummary(churchId),
      getAttendanceTrend(churchId),
      getLatestServiceStat(churchId),
    ])
      .then(([summary, attendanceTrend, service]) => {
        setMemberSummary(summary);
        setTrend(attendanceTrend);
        setLatestService(service);
      })
      .catch((err) => {
        console.error(err);
        setLoadError("Could not load dashboard data. Please refresh and try again.");
      })
      .finally(() => setLoading(false));
  }, [churchId]);

  const memberDistribution = useMemo(() => {
    if (!memberSummary) return [];
    return [
      { name: "Active", value: memberSummary.active, color: "#1a4fd6" },
      { name: "Inactive", value: memberSummary.inactive, color: "#dbeafe" },
      { name: "Visitors", value: memberSummary.visitors, color: "#0ea5e9" },
      { name: "Children", value: memberSummary.children, color: "#6366f1" },
    ];
  }, [memberSummary]);

  if (!churchId) {
    return (
      <div className="border border-amber-200 bg-amber-50 text-amber-800 rounded-lg p-4 text-sm">
        Your profile isn't linked to a church yet. Contact an admin to get set up.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {loadError && (
        <div className="border border-rose-200 bg-rose-50 text-rose-700 rounded-lg p-3 text-sm">
          {loadError}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Members"
          value={loading ? "—" : String(memberSummary?.total ?? 0)}
          sub={loading ? "Loading..." : `${memberSummary?.newThisMonth ?? 0} new this month`}
          trend={!loading && (memberSummary?.newThisMonth ?? 0) > 0 ? "up" : "neutral"}
          icon={Users}
          color="bg-blue-50 text-primary"
        />
        <StatCard
          label="Latest Service"
          value={loading ? "—" : String(latestService?.count ?? 0)}
          sub={
            loading
              ? "Loading..."
              : latestService?.date
                ? pctChange(latestService.count, latestService.previousCount)
                : "No check-ins recorded yet"
          }
          trend={!loading && latestService && latestService.count > latestService.previousCount ? "up" : "neutral"}
          icon={BarChart2}
          color="bg-violet-50 text-violet-700"
        />
        <ComingSoonCard icon={DollarSign} title="Monthly Giving" note="Not tracked yet — needs the Finance module" />
        <ComingSoonCard icon={Heart} title="Active Ministries" note="Not tracked yet — needs the Ministries module" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
          <SectionHeader title="Attendance Trends" />
          {loading ? (
            <p className="text-sm text-muted-foreground py-16 text-center">Loading...</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trend} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a4fd6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1a4fd6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,79,214,0.07)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#5c6b8a" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#5c6b8a" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid rgba(26,79,214,0.12)", fontSize: 12 }} />
                <Area type="monotone" dataKey="attendance" stroke="#1a4fd6" strokeWidth={2} fill="url(#attGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
          <p className="text-xs text-muted-foreground mt-2">Check-ins recorded per month, most recent {trend.length || 7} months.</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <SectionHeader title="Member Status" />
          {loading ? (
            <p className="text-sm text-muted-foreground py-16 text-center">Loading...</p>
          ) : memberSummary && memberSummary.total > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={memberDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {memberDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [v, ""]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {memberDistribution.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="text-muted-foreground">{d.name}</span>
                    </div>
                    <span className="font-medium text-foreground">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground py-16 text-center">No members yet.</p>
          )}
        </div>
      </div>

      {/* Placeholders for modules not built yet */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComingSoonCard icon={DollarSign} title="Recent Donations" note="Not tracked yet — needs the Finance module" />
        <ComingSoonCard icon={Calendar} title="Upcoming Events" note="Not tracked yet — needs the Events module" />
      </div>

      <ComingSoonCard icon={MessageSquare} title="Prayer Requests" note="Not tracked yet — needs the Communication module" />
    </div>
  );
}
