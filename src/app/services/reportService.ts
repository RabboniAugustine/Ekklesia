import { supabase } from "./supabaseClient";
import { listMembers } from "./memberService";
import { listMinistries } from "./ministryService";

export type YtdStats = {
  avgAttendance: number;
  newMembersYtd: number;
  baptismsYtd: number;
};

export async function getYtdStats(churchId: string): Promise<YtdStats> {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);

  const { data: attendanceRows, error: attendanceError } = await supabase
    .from("attendance_records")
    .select("service_date")
    .eq("church_id", churchId)
    .gte("service_date", startOfYear);

  if (attendanceError) throw attendanceError;

  const byService = new Map<string, number>();
  for (const row of attendanceRows ?? []) {
    byService.set(row.service_date, (byService.get(row.service_date) ?? 0) + 1);
  }
  const serviceCounts = Array.from(byService.values());
  const avgAttendance = serviceCounts.length
    ? Math.round(serviceCounts.reduce((sum, n) => sum + n, 0) / serviceCounts.length)
    : 0;

  const members = await listMembers(churchId);
  const startOfYearDate = new Date(now.getFullYear(), 0, 1);
  const newMembersYtd = members.filter((m) => new Date(m.created_at) >= startOfYearDate).length;
  const baptismsYtd = members.filter((m) => m.baptism_date && new Date(m.baptism_date) >= startOfYearDate).length;

  return { avgAttendance, newMembersYtd, baptismsYtd };
}

export type MinistryEngagement = { name: string; memberCount: number };

export async function getMinistryEngagement(churchId: string): Promise<MinistryEngagement[]> {
  const ministries = await listMinistries(churchId);
  return ministries
    .filter((m) => m.status === "active")
    .map((m) => ({ name: m.name, memberCount: m.member_count }))
    .sort((a, b) => b.memberCount - a.memberCount);
}

function downloadCsv(filename: string, rows: (string | number | null)[][]) {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => {
          const value = cell == null ? "" : String(cell);
          return value.includes(",") || value.includes('"') || value.includes("\n")
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        })
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportMembershipCsv(churchId: string) {
  const members = await listMembers(churchId);
  const rows: (string | number | null)[][] = [
    ["First Name", "Last Name", "Type", "Status", "Email", "Phone", "Joined", "Baptism Date"],
    ...members.map((m) => [
      m.first_name, m.last_name, m.member_type, m.status,
      m.email, m.phone, m.created_at.slice(0, 10), m.baptism_date,
    ]),
  ];
  downloadCsv(`membership-report-${new Date().toISOString().slice(0, 10)}.csv`, rows);
}

export async function exportAttendanceCsv(churchId: string) {
  const { data, error } = await supabase
    .from("attendance_records")
    .select("service_date, service_name")
    .eq("church_id", churchId)
    .order("service_date", { ascending: false });

  if (error) throw error;

  const byService = new Map<string, { count: number; name: string }>();
  for (const row of data ?? []) {
    const existing = byService.get(row.service_date);
    if (existing) existing.count += 1;
    else byService.set(row.service_date, { count: 1, name: row.service_name ?? "" });
  }

  const rows: (string | number | null)[][] = [
    ["Service Date", "Service Name", "Check-ins"],
    ...Array.from(byService.entries()).map(([date, v]) => [date, v.name, v.count]),
  ];
  downloadCsv(`attendance-report-${new Date().toISOString().slice(0, 10)}.csv`, rows);
}

export async function exportMinistryEngagementCsv(churchId: string) {
  const engagement = await getMinistryEngagement(churchId);
  const rows: (string | number | null)[][] = [
    ["Ministry", "Roster Size"],
    ...engagement.map((e) => [e.name, e.memberCount]),
  ];
  downloadCsv(`ministry-engagement-${new Date().toISOString().slice(0, 10)}.csv`, rows);
}
