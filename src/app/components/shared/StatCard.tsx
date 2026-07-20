import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function StatCard({
  label,
  value,
  sub,
  trend,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  trend?: "up" | "down" | "neutral";
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-semibold text-foreground mt-1">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-xs">
        {trend === "up" && <ArrowUpRight size={13} className="text-emerald-600" />}
        {trend === "down" && <ArrowDownRight size={13} className="text-rose-500" />}
        <span className={trend === "up" ? "text-emerald-600" : trend === "down" ? "text-rose-500" : "text-muted-foreground"}>
          {sub}
        </span>
      </div>
    </div>
  );
}
