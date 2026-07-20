import { useEffect, useState } from "react";
import { Attendance } from "./modules/attendance/Attendance";
import {
  Users, Calendar, DollarSign, Heart, MessageSquare, BarChart2,
  Bell, Search, ChevronRight, TrendingUp, TrendingDown,
  CheckCircle, Clock, MapPin, Phone, Mail, User, Shield,
  BookOpen, Music, Baby, Globe, Mic, FileText, Settings,
  LogOut, Menu, X, ChevronDown, Plus, Filter, Download,
  ArrowUpRight, ArrowDownRight, CircleDot, Star, Layers,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";

import { supabase } from "./services/supabaseClient";

// ─── Types ────────────────────────────────────────────────────────────────────

type NavModule =
  | "dashboard"
  | "attendance"
  | "members"
  | "events"
  | "finance"
  | "ministries"
  | "communication"
  | "reports"
  | "settings";


type AppRole =
  | "super_admin"
  | "pastor"
  | "admin"
  | "usher"
  | "finance"
  | "ministry_leader";

type UserProfile = {
  id: string;
  church_id: string;
  full_name: string;
  email: string | null;
  role: AppRole;
  avatar_url: string | null;
  phone: string | null;
  is_active: boolean;
};

async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

async function signInWithEmailPassword(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, church_id, full_name, email, role, avatar_url, phone, is_active")
    .eq("id", userId)
    .single();

  if (error) {
    throw error;
  }

  return data as UserProfile;
}

function WelcomePage({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div>
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-5">
            <Shield size={24} className="text-white" />
          </div>

          <p className="text-sm font-semibold text-primary uppercase tracking-wider">
            Church Management System
          </p>

          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mt-3 leading-tight">
            Manage your church with clarity, care, and order.
          </h1>

          <p className="text-muted-foreground mt-4 text-base leading-7">
            Track attendance, manage members, organize ministries, record giving,
            communicate with your church family, and keep leadership informed in
            one secure system.
          </p>

          <button
            onClick={onGetStarted}
            className="mt-7 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Sign In to Continue
          </button>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Attendance", text: "Ushers can check in members and visitors from the entrance.", icon: BarChart2 },
              { title: "Members", text: "Keep member records, status, contact info, and follow-ups organized.", icon: Users },
              { title: "Events", text: "Plan church services, meetings, programs, and recurring events.", icon: Calendar },
              { title: "Security", text: "Give access based on role: admin, usher, finance, pastor, and more.", icon: Shield },
            ].map((item) => (
              <div key={item.title} className="border border-border rounded-xl p-4 bg-muted/30">
                <item.icon size={20} className="text-primary mb-3" />
                <h2 className="font-semibold text-foreground">{item.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SignInPage({
  onBack,
  onSignedIn,
  externalError = "",
}: {
  onBack: () => void;
  onSignedIn: () => void;
  externalError?: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailPassword(email.trim(), password);
      onSignedIn();
    } catch (error) {
      console.error("Sign-in error:", error);
      setErrorMessage("Invalid email or password, or Supabase auth is not configured correctly.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center mb-5">
          <Shield size={22} className="text-white" />
        </div>

        <h1 className="text-2xl font-bold text-foreground">Sign in</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Access your church management dashboard.
        </p>

        {(errorMessage || externalError) && (
          <div className="mt-4 border border-rose-200 bg-rose-50 text-rose-700 rounded-lg p-3 text-sm">
            {errorMessage || externalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full border border-border bg-background rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="admin@yourchurch.org"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full border border-border bg-background rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <button
          type="button"
          onClick={onBack}
          className="mt-4 text-sm text-muted-foreground hover:text-foreground"
        >
          Back to welcome page
        </button>
      </div>
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const attendanceData = [
  { month: "Jan", attendance: 312, new: 18 },
  { month: "Feb", attendance: 298, new: 12 },
  { month: "Mar", attendance: 341, new: 24 },
  { month: "Apr", attendance: 355, new: 31 },
  { month: "May", attendance: 368, new: 19 },
  { month: "Jun", attendance: 391, new: 27 },
  { month: "Jul", attendance: 410, new: 22 },
];

const givingData = [
  { month: "Jan", tithes: 42000, offerings: 11000, special: 4500 },
  { month: "Feb", tithes: 38500, offerings: 9800, special: 2200 },
  { month: "Mar", tithes: 47200, offerings: 13400, special: 8100 },
  { month: "Apr", tithes: 44800, offerings: 12100, special: 3300 },
  { month: "May", tithes: 51300, offerings: 14700, special: 6000 },
  { month: "Jun", tithes: 49600, offerings: 13900, special: 5400 },
  { month: "Jul", tithes: 55200, offerings: 16300, special: 9200 },
];

const memberDistribution = [
  { name: "Active", value: 487, color: "#1a4fd6" },
  { name: "Inactive", value: 83, color: "#dbeafe" },
  { name: "Visitors", value: 62, color: "#0ea5e9" },
  { name: "Children", value: 144, color: "#6366f1" },
];

const members = [
  { id: 1, name: "Grace Okonkwo", role: "Member", ministry: "Worship", joined: "Mar 2019", status: "active", phone: "+1 (555) 012-3456", email: "grace@church.org" },
  { id: 2, name: "David Mensah", role: "Deacon", ministry: "Outreach", joined: "Jan 2015", status: "active", phone: "+1 (555) 234-5678", email: "david@church.org" },
  { id: 3, name: "Ruth Andersen", role: "Member", ministry: "Children", joined: "Sep 2021", status: "active", phone: "+1 (555) 345-6789", email: "ruth@church.org" },
  { id: 4, name: "Emmanuel Tabi", role: "Elder", ministry: "Pastoral", joined: "Jun 2010", status: "active", phone: "+1 (555) 456-7890", email: "emmanuel@church.org" },
  { id: 5, name: "Priscilla Yeboah", role: "Member", ministry: "Media", joined: "Nov 2022", status: "inactive", phone: "+1 (555) 567-8901", email: "priscilla@church.org" },
  { id: 6, name: "Michael Asante", role: "Staff", ministry: "Finance", joined: "Apr 2018", status: "active", phone: "+1 (555) 678-9012", email: "michael@church.org" },
];

const upcomingEvents = [
  { id: 1, title: "Sunday Morning Service", date: "Jul 6, 2026", time: "9:00 AM", location: "Main Sanctuary", rsvp: 287, capacity: 400, type: "service" },
  { id: 2, title: "Youth Bible Study", date: "Jul 8, 2026", time: "6:30 PM", location: "Room 204", rsvp: 43, capacity: 60, type: "study" },
  { id: 3, title: "Worship Team Rehearsal", date: "Jul 9, 2026", time: "7:00 PM", location: "Music Room", rsvp: 18, capacity: 25, type: "rehearsal" },
  { id: 4, title: "Community Outreach Day", date: "Jul 12, 2026", time: "8:00 AM", location: "Eastside Park", rsvp: 74, capacity: 120, type: "outreach" },
  { id: 5, title: "Elder Board Meeting", date: "Jul 14, 2026", time: "10:00 AM", location: "Conference Room", rsvp: 9, capacity: 12, type: "meeting" },
];

const recentDonations = [
  { name: "Emmanuel Tabi", amount: 1200, fund: "General Tithe", date: "Jul 3, 2026", method: "Online" },
  { name: "Grace Okonkwo", amount: 500, fund: "Building Fund", date: "Jul 3, 2026", method: "Card" },
  { name: "David Mensah", amount: 800, fund: "General Tithe", date: "Jul 2, 2026", method: "Online" },
  { name: "Ruth Andersen", amount: 250, fund: "Missions", date: "Jul 2, 2026", method: "Cash" },
  { name: "Sarah Boateng", amount: 2000, fund: "Special Offering", date: "Jul 1, 2026", method: "Transfer" },
];

const ministries = [
  { name: "Worship & Arts", leader: "James Ofori", members: 34, icon: Music, color: "bg-violet-100 text-violet-700" },
  { name: "Children's Church", leader: "Abena Frimpong", members: 22, icon: Baby, color: "bg-pink-100 text-pink-700" },
  { name: "Outreach & Missions", leader: "David Mensah", members: 41, icon: Globe, color: "bg-emerald-100 text-emerald-700" },
  { name: "Media & Technology", leader: "Kwame Adu", members: 15, icon: Mic, color: "bg-sky-100 text-sky-700" },
  { name: "Biblical Education", leader: "Pastor Ruth Nkrumah", members: 28, icon: BookOpen, color: "bg-amber-100 text-amber-700" },
  { name: "Prayer & Intercession", leader: "Elder Asiedu", members: 19, icon: Heart, color: "bg-red-100 text-red-700" },
];

const prayerRequests = [
  { name: "Anonymous", request: "Healing for chronic back pain", date: "Jul 3", private: true },
  { name: "Ruth Andersen", request: "Guidance in career decision", date: "Jul 2", private: false },
  { name: "Anonymous", request: "Restoration of a broken marriage", date: "Jul 1", private: true },
  { name: "Michael Asante", request: "Financial breakthrough and wisdom", date: "Jun 30", private: false },
];

// ─── Utility Components ────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, trend, icon: Icon, color,
}: {
  label: string; value: string; sub: string;
  trend?: "up" | "down" | "neutral"; icon: React.ElementType; color: string;
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

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "warning" | "danger" | "info" }) {
  const styles = {
    default: "bg-secondary text-secondary-foreground",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    danger: "bg-rose-50 text-rose-600",
    info: "bg-accent text-accent-foreground",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
}

function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {action && (
        <button className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
          {action} <ChevronRight size={13} />
        </button>
      )}
    </div>
  );
}

// ─── Module Views ──────────────────────────────────────────────────────────────

function Dashboard() {
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

function Members() {
  const [search, setSearch] = useState("");
  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.ministry.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search members..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg bg-card hover:bg-muted/60 transition-colors text-foreground">
            <Filter size={14} /> Filter
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            <Plus size={14} /> Add Member
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Name</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 hidden md:table-cell">Ministry</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Contact</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Joined</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-primary text-xs font-semibold shrink-0">
                      {m.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.role}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-sm text-muted-foreground hidden md:table-cell">{m.ministry}</td>
                <td className="px-5 py-3.5 hidden lg:table-cell">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Mail size={11} />{m.email}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5"><Phone size={11} />{m.phone}</p>
                </td>
                <td className="px-5 py-3.5 text-sm text-muted-foreground hidden sm:table-cell">{m.joined}</td>
                <td className="px-5 py-3.5">
                  <Badge variant={m.status === "active" ? "success" : "danger"}>
                    {m.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Membership Status</h3>
          <div className="space-y-3">
            {[
              { label: "Active Members", count: 487, pct: 63, color: "bg-primary" },
              { label: "Inactive", count: 83, pct: 11, color: "bg-muted-foreground" },
              { label: "Visitors", count: 62, pct: 8, color: "bg-sky-400" },
              { label: "Children", count: 144, pct: 18, color: "bg-violet-400" },
            ].map(s => (
              <div key={s.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="font-medium text-foreground">{s.count}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Baptism Records</h3>
          <div className="space-y-2.5">
            {[
              { year: "2026 (YTD)", count: 14 },
              { year: "2025", count: 37 },
              { year: "2024", count: 29 },
              { year: "2023", count: 42 },
            ].map(r => (
              <div key={r.year} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">{r.year}</span>
                <span className="text-sm font-semibold text-foreground">{r.count} baptisms</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Visitor Follow-ups</h3>
          <div className="space-y-3">
            {[
              { name: "James Kweku", visit: "Jun 29", status: "Contacted", icon: CheckCircle, c: "text-emerald-600" },
              { name: "Linda Osei", visit: "Jun 29", status: "Pending", icon: Clock, c: "text-amber-600" },
              { name: "Peter Boadu", visit: "Jul 2", status: "Pending", icon: Clock, c: "text-amber-600" },
            ].map(v => (
              <div key={v.name} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <v.icon size={15} className={v.c} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{v.name}</p>
                  <p className="text-xs text-muted-foreground">Visited {v.visit}</p>
                </div>
                <Badge variant={v.status === "Contacted" ? "success" : "warning"}>{v.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Events() {
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

function Finance() {
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

function Ministries() {
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

function Communication() {
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

function Reports() {
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

// ─── Sidebar Navigation ────────────────────────────────────────────────────────

const navItems: { id: NavModule; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: BarChart2 },
  { id: "attendance", label: "Attendance", icon: CheckCircle },
  { id: "members", label: "Members", icon: Users },
  { id: "events", label: "Events", icon: Calendar },
  { id: "finance", label: "Finance", icon: DollarSign },
  { id: "ministries", label: "Ministries", icon: Heart },
  { id: "communication", label: "Communication", icon: MessageSquare },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings },
];

// ─── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [active, setActive] = useState<NavModule>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authView, setAuthView] = useState<"welcome" | "signin" | "app">(
    "welcome"
  );
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState("");

  async function loadAuthUser() {
  try {
    setLoadingAuth(true);

    const session = await getCurrentSession();

    if (!session?.user) {
      setProfile(null);
      setAuthView("welcome");
      return;
    }

    const userProfile = await getUserProfile(session.user.id);

    if (!userProfile.is_active) {
      await signOut();
      setProfile(null);
      setAuthView("signin");
      return;
    }

    setProfile(userProfile);
    setAuthView("app");
  } catch (error) {
    console.error(error);
    setProfile(null);
    setAuthView("signin");
  } finally {
    setLoadingAuth(false);
  }
}

useEffect(() => {
  loadAuthUser();
}, []);

async function handleLogout() {
  await signOut();
  setProfile(null);
  setAuthView("welcome");
  setProfileMenuOpen(false);
}

const userInitials =
  profile?.full_name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

  const pageTitle = navItems.find(n => n.id === active)?.label ?? "Dashboard";

  const renderContent = () => {
    switch (active) {
      case "dashboard": return <Dashboard />;
      case "attendance": return <Attendance />;
      case "members": return <Members />;
      case "events": return <Events />;
      case "finance": return <Finance />;
      case "ministries": return <Ministries />;
      case "communication": return <Communication />;
      case "reports": return <Reports />;
      case "settings":
        return (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <Settings size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-base font-semibold text-foreground">System Settings</p>
            <p className="text-sm text-muted-foreground mt-1">Church configuration, roles, integrations, and security options.</p>
          </div>
        );
    }
  };


  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (authView === "welcome") {
    return <WelcomePage onGetStarted={() => setAuthView("signin")} />;
  }

  if (authView === "signin") {
    return (
      <SignInPage
        onBack={() => setAuthView("welcome")}
        onSignedIn={loadAuthUser}
        externalError={authError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-60 bg-card border-r border-border flex flex-col transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-border">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground leading-tight">Grace Community</p>
            <p className="text-xs text-muted-foreground leading-tight">Church Management</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActive(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  isActive
                    ? "bg-accent text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User */}
      <div className="p-3 border-t border-border relative">
        <button
          onClick={() => setProfileMenuOpen((open) => !open)}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted/60 cursor-pointer transition-colors text-left"
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">
              {profile?.full_name || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {profile?.role || "User"}
            </p>
          </div>
          <ChevronDown size={13} className="text-muted-foreground shrink-0" />
        </button>

        {profileMenuOpen && (
          <div className="absolute bottom-16 left-3 right-3 bg-card border border-border rounded-lg shadow-lg p-2 z-50">
            <button
              onClick={() => {
                setActive("settings");
                setProfileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted"
            >
              Profile
            </button>

            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted text-rose-600 flex items-center gap-2"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        )}
      </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-card border-b border-border flex items-center gap-4 px-5 shrink-0">
          <button className="lg:hidden text-muted-foreground hover:text-foreground transition-colors" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <h1 className="text-base font-semibold text-foreground">{pageTitle}</h1>
          <div className="flex-1" />
          <div className="relative hidden sm:block">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search..."
              className="pl-9 pr-4 py-1.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all w-48"
            />
          </div>
          <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
          </button>
          <button
            onClick={() => setActive("settings")}
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold"
          >
            {userInitials}
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
