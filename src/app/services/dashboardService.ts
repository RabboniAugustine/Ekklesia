import { supabase } from "./supabaseClient";

export type MemberSummary = {
  total: number;
  active: number;
  inactive: number;
  visitors: number;
  children: number;
  newThisMonth: number;
  newLastMonth: number;
};

export async function getMemberSummary(churchId: string): Promise<MemberSummary> {
  const { data, error } = await supabase
    .from("members")
    .select("status, member_type, created_at")
    .eq("church_id", churchId);

  if (error) throw error;

  const rows = data ?? [];
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  let active = 0, inactive = 0, visitors = 0, children = 0, newThisMonth = 0, newLastMonth = 0;

  for (const row of rows) {
    if (row.status === "active") active += 1;
    if (row.status === "inactive") inactive += 1;
    if (row.member_type === "visitor") visitors += 1;
    if (row.member_type === "child") children += 1;

    const createdAt = new Date(row.created_at);
    if (createdAt >= startOfThisMonth) newThisMonth += 1;
    else if (createdAt >= startOfLastMonth) newLastMonth += 1;
  }

  return { total: rows.length, active, inactive, visitors, children, newThisMonth, newLastMonth };
}

export type MonthlyAttendance = { month: string; attendance: number };

export async function getAttendanceTrend(churchId: string, monthsBack = 7): Promise<MonthlyAttendance[]> {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1), 1);

  const { data, error } = await supabase
    .from("attendance_records")
    .select("service_date")
    .eq("church_id", churchId)
    .gte("service_date", start.toISOString().slice(0, 10));

  if (error) throw error;

  const buckets = new Map<string, number>();
  const labels: string[] = [];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    buckets.set(key, 0);
    labels.push(key);
  }

  for (const row of data ?? []) {
    const d = new Date(row.service_date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  const monthFormatter = new Intl.DateTimeFormat(undefined, { month: "short" });

  return labels.map((key) => {
    const [year, month] = key.split("-").map(Number);
    return {
      month: monthFormatter.format(new Date(year, month, 1)),
      attendance: buckets.get(key) ?? 0,
    };
  });
}

export type LatestServiceStat = {
  date: string | null;
  count: number;
  previousCount: number;
};

export async function getLatestServiceStat(churchId: string): Promise<LatestServiceStat> {
  const { data: latestRows, error: latestError } = await supabase
    .from("attendance_records")
    .select("service_date")
    .eq("church_id", churchId)
    .order("service_date", { ascending: false })
    .limit(1);

  if (latestError) throw latestError;

  const latestDate = latestRows?.[0]?.service_date ?? null;
  if (!latestDate) {
    return { date: null, count: 0, previousCount: 0 };
  }

  const { count: latestCount, error: countError } = await supabase
    .from("attendance_records")
    .select("id", { count: "exact", head: true })
    .eq("church_id", churchId)
    .eq("service_date", latestDate);

  if (countError) throw countError;

  const { data: priorRows, error: priorError } = await supabase
    .from("attendance_records")
    .select("service_date")
    .eq("church_id", churchId)
    .lt("service_date", latestDate)
    .order("service_date", { ascending: false })
    .limit(1);

  if (priorError) throw priorError;

  const priorDate = priorRows?.[0]?.service_date ?? null;
  let previousCount = 0;

  if (priorDate) {
    const { count, error } = await supabase
      .from("attendance_records")
      .select("id", { count: "exact", head: true })
      .eq("church_id", churchId)
      .eq("service_date", priorDate);

    if (error) throw error;
    previousCount = count ?? 0;
  }

  return { date: latestDate, count: latestCount ?? 0, previousCount };
}
