import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { BarChart2, DollarSign, Users, Star, Download, FileText } from "lucide-react";
import { StatCard } from "../../components/shared/StatCard";
import { SectionHeader } from "../../components/shared/SectionHeader";
import { givingData, ministries } from "../../data/mockData";

export function Reports() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Avg. Attendance" value="387" sub="Jan–Jul 2026" trend="up" icon={BarChart2} color="bg-blue-50 text-primary" />
        <StatCard label="YTD Giving" value="$487.4K" sub="vs $412K last year" trend="up" icon={DollarSign} color="bg-emerald-50 text-emerald-700" />
        <StatCard label="New Members" value="144" sub="YTD 2026" trend="up" icon={Users} color="bg-violet-50 text-violet-700" />
        <StatCard label="Baptisms" value="14" sub="YTD 2026" trend="up" icon={Star} color="bg-amber-50 text-amber-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <SectionHeader title="Giving Report — 2026" />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={givingData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="giveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a4fd6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1a4fd6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,79,214,0.07)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#5c6b8a" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#5c6b8a" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="tithes" stroke="#1a4fd6" strokeWidth={2} fill="url(#giveGrad)" name="Tithes" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <SectionHeader title="Ministry Engagement" />
          <div className="space-y-4 mt-2">
            {ministries.map((m) => {
              const pct = Math.round((m.members / 50) * 100);
              return (
                <div key={m.name}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-foreground">{m.name}</span>
                    <span className="text-muted-foreground">{m.members} members</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-foreground">Available Reports</h2>
          <button className="flex items-center gap-1.5 text-xs font-medium text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-accent transition-colors">
            <Download size={13} /> Export All
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            "Monthly Attendance Report", "Annual Giving Statement", "Donor Receipts (Tax-Compliant)",
            "Membership Growth Analysis", "Ministry Engagement Summary", "Expense & Budget Report",
            "Visitor Conversion Report", "Volunteer Hours Log", "Custom Report Builder",
          ].map(r => (
            <button key={r} className="flex items-center gap-3 p-3.5 rounded-lg border border-border bg-muted/30 hover:bg-accent hover:border-primary/30 transition-all text-left group">
              <FileText size={15} className="text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
              <span className="text-sm text-foreground">{r}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
