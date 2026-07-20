import { Plus, Users } from "lucide-react";
import { Badge } from "../../components/shared/Badge";
import { SectionHeader } from "../../components/shared/SectionHeader";
import { ministries } from "../../data/mockData";

export function Ministries() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div />
        <button className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <Plus size={14} /> New Ministry
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {ministries.map((m) => (
          <div key={m.name} className="bg-card border border-border rounded-lg p-5 hover:shadow-sm transition-shadow cursor-pointer">
            <div className="flex items-start gap-3 mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${m.color}`}>
                <m.icon size={18} />
              </div>
              <div>
                <p className="font-semibold text-foreground">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.leader}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5"><Users size={13} />{m.members} members</span>
              <Badge variant="info">Active</Badge>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <SectionHeader title="Volunteer Scheduling" action="View roster" />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2 pr-6">Volunteer</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2 pr-6">Ministry</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2 pr-6">Role</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2 pr-6">Next Shift</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Abena Frimpong", ministry: "Children's", role: "Teacher", shift: "Jul 6, 9AM", confirmed: true },
                { name: "Kwame Adu", ministry: "Media", role: "Camera", shift: "Jul 6, 8AM", confirmed: true },
                { name: "Priscilla Yeboah", ministry: "Worship", role: "Vocals", shift: "Jul 6, 8AM", confirmed: false },
                { name: "James Ofori", ministry: "Worship", role: "Guitar", shift: "Jul 6, 8AM", confirmed: true },
                { name: "Sarah Boateng", ministry: "Outreach", role: "Coordinator", shift: "Jul 12, 8AM", confirmed: false },
              ].map((v, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="py-3 pr-6 text-sm font-medium text-foreground">{v.name}</td>
                  <td className="py-3 pr-6 text-sm text-muted-foreground">{v.ministry}</td>
                  <td className="py-3 pr-6 text-sm text-muted-foreground">{v.role}</td>
                  <td className="py-3 pr-6 text-sm text-muted-foreground">{v.shift}</td>
                  <td className="py-3">
                    <Badge variant={v.confirmed ? "success" : "warning"}>
                      {v.confirmed ? "Confirmed" : "Pending"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
