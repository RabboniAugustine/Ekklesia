import { Plus, MapPin, CircleDot } from "lucide-react";
import { upcomingEvents } from "../../data/mockData";

export function Events() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Church Calendar — July 2026</h2>
        <button className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <Plus size={14} /> New Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {upcomingEvents.map((e) => {
            const pct = Math.round((e.rsvp / e.capacity) * 100);
            const typeColors: Record<string, string> = {
              service: "bg-blue-50 border-blue-200",
              study: "bg-emerald-50 border-emerald-200",
              rehearsal: "bg-amber-50 border-amber-200",
              outreach: "bg-violet-50 border-violet-200",
              meeting: "bg-slate-50 border-slate-200",
            };
            return (
              <div key={e.id} className={`bg-card border rounded-lg p-5 flex items-start gap-4 ${typeColors[e.type] || "border-border"}`}>
                <div className="bg-primary text-primary-foreground rounded-lg w-12 h-12 flex flex-col items-center justify-center shrink-0">
                  <span className="text-xs font-medium leading-tight">{e.date.split(" ")[0]}</span>
                  <span className="text-lg font-bold leading-tight">{e.date.split(" ")[1].replace(",", "")}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{e.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{e.time} · <span className="inline-flex items-center gap-1"><MapPin size={11} />{e.location}</span></p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{e.rsvp}/{e.capacity} RSVPs</span>
                  </div>
                </div>
                <button className="text-xs font-medium text-primary hover:text-primary/80 transition-colors shrink-0">
                  Manage
                </button>
              </div>
            );
          })}
        </div>

        <div className="space-y-5">
          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Room Bookings</h3>
            <div className="space-y-2.5">
              {[
                { room: "Main Sanctuary", booked: "9AM–12PM, Jul 6" },
                { room: "Room 204", booked: "6–8PM, Jul 8" },
                { room: "Music Room", booked: "7–9PM, Jul 9" },
                { room: "Conference Room", booked: "10AM–12PM, Jul 14" },
              ].map(r => (
                <div key={r.room} className="flex items-center gap-2.5 py-2 border-b border-border last:border-0">
                  <MapPin size={13} className="text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.room}</p>
                    <p className="text-xs text-muted-foreground">{r.booked}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Recurring Services</h3>
            <div className="space-y-2.5">
              {[
                { name: "Sunday Service", freq: "Every Sunday, 9AM & 11AM" },
                { name: "Midweek Prayer", freq: "Every Wednesday, 6PM" },
                { name: "Youth Service", freq: "Every Friday, 6:30PM" },
              ].map(s => (
                <div key={s.name} className="flex items-start gap-2.5 py-2 border-b border-border last:border-0">
                  <CircleDot size={13} className="text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.freq}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
