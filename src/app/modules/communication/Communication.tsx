import { Mail, MessageSquare, Bell, Heart } from "lucide-react";
import { Badge } from "../../components/shared/Badge";
import { SectionHeader } from "../../components/shared/SectionHeader";
import { prayerRequests } from "../../data/mockData";

export function Communication() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Email Broadcasts", icon: Mail, count: "4 sent this week", action: "Compose Email" },
          { label: "SMS Alerts", icon: MessageSquare, count: "2 sent today", action: "Send SMS" },
          { label: "Announcements", icon: Bell, count: "3 active", action: "Post Announcement" },
        ].map(c => (
          <div key={c.label} className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center text-primary">
                <c.icon size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{c.label}</p>
                <p className="text-xs text-muted-foreground">{c.count}</p>
              </div>
            </div>
            <button className="w-full text-sm font-medium text-primary border border-primary/30 rounded-lg py-2 hover:bg-accent transition-colors">
              {c.action}
            </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <SectionHeader title="Recent Broadcasts" action="View all" />
          <div className="space-y-3">
            {[
              { subject: "Sunday Service Update — New Worship Team", sent: "Jul 2, 2026", to: "All Members", opens: 312 },
              { subject: "Building Fund Goal — 72% Reached!", sent: "Jun 28, 2026", to: "All Members", opens: 287 },
              { subject: "Outreach Day Reminder — July 12", sent: "Jun 25, 2026", to: "Volunteers", opens: 74 },
              { subject: "Youth Camp Registration Open", sent: "Jun 20, 2026", to: "Youth Ministry", opens: 43 },
            ].map((msg, i) => (
              <div key={i} className="py-3 border-b border-border last:border-0">
                <p className="text-sm font-medium text-foreground">{msg.subject}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>To: {msg.to}</span>
                  <span>·</span>
                  <span>{msg.sent}</span>
                  <span>·</span>
                  <span className="text-emerald-600 font-medium">{msg.opens} opens</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <SectionHeader title="Prayer Requests" action="View all" />
          <div className="space-y-3">
            {prayerRequests.map((p, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Heart size={14} className="text-rose-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-foreground">{p.request}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {p.private ? "Anonymous" : p.name} · {p.date}
                  </p>
                </div>
                {p.private && <Badge variant="warning">Private</Badge>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
