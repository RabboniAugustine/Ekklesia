import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Users, Layers } from "lucide-react";
import { StatCard } from "../../components/shared/StatCard";
import { SectionHeader } from "../../components/shared/SectionHeader";
import { givingData, recentDonations } from "../../data/mockData";

export function Finance() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Monthly Income" value="$80,700" sub="+12.4% vs June" trend="up" icon={TrendingUp} color="bg-emerald-50 text-emerald-700" />
        <StatCard label="Monthly Expenses" value="$34,200" sub="-3.1% vs June" trend="down" icon={TrendingDown} color="bg-rose-50 text-rose-600" />
        <StatCard label="Total Donors" value="312" sub="+18 this month" trend="up" icon={Users} color="bg-blue-50 text-primary" />
        <StatCard label="Building Fund" value="$218,440" sub="72% of $300K goal" trend="neutral" icon={Layers} color="bg-amber-50 text-amber-700" />
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <SectionHeader title="Giving Overview — July 2026" />
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={givingData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,79,214,0.07)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#5c6b8a" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#5c6b8a" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="tithes" name="Tithes" fill="#1a4fd6" radius={[3, 3, 0, 0]} />
            <Bar dataKey="offerings" name="Offerings" fill="#0ea5e9" radius={[3, 3, 0, 0]} />
            <Bar dataKey="special" name="Special" fill="#6366f1" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <SectionHeader title="Recent Donations" action="Export" />
          <div className="space-y-1">
            {recentDonations.map((d, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-primary text-xs font-semibold">
                    {d.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{d.name}</p>
                    <p className="text-xs text-muted-foreground">{d.fund}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">${d.amount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{d.method} · {d.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <SectionHeader title="Fund Balances" />
          <div className="space-y-4">
            {[
              { name: "General Fund", balance: 48200, budget: 60000 },
              { name: "Building Fund", balance: 218440, budget: 300000 },
              { name: "Missions Fund", balance: 22100, budget: 30000 },
              { name: "Youth Ministry", balance: 7400, budget: 12000 },
              { name: "Benevolence", balance: 5800, budget: 8000 },
            ].map(f => {
              const pct = Math.round((f.balance / f.budget) * 100);
              return (
                <div key={f.name}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-foreground font-medium">{f.name}</span>
                    <span className="text-muted-foreground">${f.balance.toLocaleString()} <span className="text-xs">/ ${f.budget.toLocaleString()}</span></span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
