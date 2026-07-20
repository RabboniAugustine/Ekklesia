import {
  AreaChart, Area, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { Users, BarChart2, DollarSign, Heart, Calendar, MapPin } from "lucide-react";
import { StatCard } from "../../components/shared/StatCard";
import { SectionHeader } from "../../components/shared/SectionHeader";
import { Badge } from "../../components/shared/Badge";
import {
  attendanceData, memberDistribution, recentDonations, upcomingEvents, prayerRequests,
} from "../../data/mockData";

export function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Members" value="776" sub="+22 this month" trend="up" icon={Users} color="bg-blue-50 text-primary" />
        <StatCard label="Sunday Attendance" value="410" sub="+5.1% vs last week" trend="up" icon={BarChart2} color="bg-violet-50 text-violet-700" />
        <StatCard label="Monthly Giving" value="$80,700" sub="+12.4% vs June" trend="up" icon={DollarSign} color="bg-emerald-50 text-emerald-700" />
        <StatCard label="Active Ministries" value="12" sub="2 new this quarter" trend="up" icon={Heart} color="bg-rose-50 text-rose-600" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
          <SectionHeader title="Attendance Trends" action="Full report" />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={attendanceData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a4fd6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1a4fd6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,79,214,0.07)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#5c6b8a" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#5c6b8a" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid rgba(26,79,214,0.12)", fontSize: 12 }} />
              <Area type="monotone" dataKey="attendance" stroke="#1a4fd6" strokeWidth={2} fill="url(#attGrad)" />
              <Area type="monotone" dataKey="new" stroke="#0ea5e9" strokeWidth={2} fill="none" strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-5 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-3 h-0.5 bg-primary inline-block" />Attendance</div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-3 h-0.5 bg-sky-400 inline-block" style={{ borderTop: "2px dashed #0ea5e9", background: "none" }} />New Members</div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <SectionHeader title="Member Status" />
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
        </div>
      </div>

      {/* Recent activity + upcoming events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <SectionHeader title="Recent Donations" action="View all" />
          <div className="space-y-3">
            {recentDonations.map((d, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-primary text-xs font-semibold">
                    {d.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{d.name}</p>
                    <p className="text-xs text-muted-foreground">{d.fund} · {d.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">${d.amount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{d.method}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <SectionHeader title="Upcoming Events" action="Calendar" />
          <div className="space-y-3">
            {upcomingEvents.map((e) => {
              const pct = Math.round((e.rsvp / e.capacity) * 100);
              const typeColors: Record<string, string> = {
                service: "info", study: "success", rehearsal: "warning", outreach: "success", meeting: "default",
              };
              return (
                <div key={e.id} className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
                  <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-primary shrink-0">
                    <Calendar size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-foreground leading-tight">{e.title}</p>
                      <Badge variant={typeColors[e.type] as any}>{pct}%</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{e.date} · {e.time}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin size={10} />{e.location}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Prayer requests */}
      <div className="bg-card border border-border rounded-lg p-6">
        <SectionHeader title="Prayer Requests" action="View all" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {prayerRequests.map((p, i) => (
            <div key={i} className="flex items-start gap-3 p-3.5 rounded-lg bg-muted/60">
              <Heart size={15} className="text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-foreground">{p.request}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {p.private ? "Anonymous" : p.name} · {p.date}
                  {p.private && <span className="ml-2 text-amber-600 font-medium">Private</span>}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
