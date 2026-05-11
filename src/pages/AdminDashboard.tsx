import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ModuleHeader } from "@/components/ModuleHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, AlertTriangle, CheckSquare, FileText, Activity, TrendingUp,
  Shield, Download, RefreshCw, BarChart3, Clock, Database
} from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

// ── Types ────────────────────────────────────────────────────────────────────

interface SystemStats {
  totalYoungPeople: number;
  activeYoungPeople: number;
  totalStaff: number;
  totalTasks: number;
  openTasks: number;
  overdueTasks: number;
  activeMissingEpisodes: number;
  totalMissingEpisodes: number;
  documentsThisMonth: number;
  auditEntriesThisMonth: number;
  highRiskCount: number;
  notificationsSentThisMonth: number;
}

interface StaffActivity {
  id: string;
  full_name: string;
  job_title: string;
  team: string;
  caseload: number;
  actionsThisMonth: number;
  availability_status: string;
}

interface RiskBreakdown {
  level: string;
  count: number;
  color: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const RISK_COLORS: Record<string, string> = {
  High: "#ef4444",
  Medium: "#f97316",
  Low: "#22c55e",
};

const AVAILABILITY_COLORS: Record<string, string> = {
  available: "#22c55e",
  busy: "#f97316",
  on_leave: "#6366f1",
  off_shift: "#94a3b8",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [staffActivity, setStaffActivity] = useState<StaffActivity[]>([]);
  const [riskBreakdown, setRiskBreakdown] = useState<RiskBreakdown[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── Auth guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
      if (data !== true) navigate("/dashboard");
      else setIsAdmin(true);
    });
  }, [user, navigate]);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!isAdmin) return;
    setDataLoading(true);

    const now = new Date();
    const monthStart = startOfMonth(now).toISOString();
    const monthEnd = endOfMonth(now).toISOString();

    try {
      const [
        ypRes,
        staffRes,
        tasksRes,
        missingRes,
        docsRes,
        auditRes,
        riskRes,
        notifRes,
        auditStaffRes,
      ] = await Promise.all([
        supabase.from("young_people").select("id, draft"),
        supabase.from("profiles").select("id, full_name, job_title, team, availability_status"),
        supabase.from("tasks").select("id, status, due_date, young_person_id, assigned_to"),
        supabase.from("missing_episodes").select("id, status"),
        supabase
          .from("young_person_documents")
          .select("id", { count: "exact" })
          .gte("created_at", monthStart)
          .lte("created_at", monthEnd),
        supabase
          .from("audit_log")
          .select("id, user_id, actor_name", { count: "exact" })
          .gte("created_at", monthStart)
          .lte("created_at", monthEnd),
        supabase.from("risk_assessments").select("id, risk_level, young_person_id").order("created_at", { ascending: false }),
        supabase
          .from("notification_queue")
          .select("id", { count: "exact" })
          .eq("status", "sent")
          .gte("created_at", monthStart),
        // Per-staff audit counts this month
        supabase
          .from("audit_log")
          .select("user_id")
          .gte("created_at", monthStart)
          .lte("created_at", monthEnd),
      ]);

      const youngPeople = ypRes.data || [];
      const staff = staffRes.data || [];
      const tasks = tasksRes.data || [];
      const missing = missingRes.data || [];
      const riskAssessments = riskRes.data || [];
      const auditEntries = auditStaffRes.data || [];

      // Compute per-staff action counts
      const actionsMap: Record<string, number> = {};
      auditEntries.forEach((e) => {
        if (e.user_id) actionsMap[e.user_id] = (actionsMap[e.user_id] || 0) + 1;
      });

      // Caseload per staff (using key_worker_id, the actual FK)
      const caseloadMap: Record<string, number> = {};
      youngPeople.forEach((yp: Record<string, unknown>) => {
        if (yp.key_worker_id) caseloadMap[yp.key_worker_id as string] = (caseloadMap[yp.key_worker_id as string] || 0) + 1;
      });

      // Latest risk level per young person
      const latestRiskByYP: Record<string, string> = {};
      riskAssessments.forEach((r) => {
        if (!latestRiskByYP[r.young_person_id]) {
          latestRiskByYP[r.young_person_id] = r.risk_level;
        }
      });
      const riskCounts = { High: 0, Medium: 0, Low: 0 };
      Object.values(latestRiskByYP).forEach((level) => {
        if (level in riskCounts) riskCounts[level as keyof typeof riskCounts]++;
      });

      const now2 = new Date();
      const overdueCount = tasks.filter(
        (t) => t.due_date && new Date(t.due_date) < now2 && !["completed", "DONE", "archived", "ARCHIVED"].includes(t.status || "")
      ).length;

      setStats({
        totalYoungPeople: youngPeople.length,
        activeYoungPeople: youngPeople.filter((y: Record<string, unknown>) => !y.draft).length,
        totalStaff: staff.length,
        totalTasks: tasks.length,
        openTasks: tasks.filter((t) => !["completed", "DONE", "archived", "ARCHIVED"].includes(t.status || "")).length,
        overdueTasks: overdueCount,
        activeMissingEpisodes: missing.filter((m) => m.status === "missing").length,
        totalMissingEpisodes: missing.length,
        documentsThisMonth: docsRes.count ?? 0,
        auditEntriesThisMonth: auditRes.count ?? 0,
        highRiskCount: riskCounts.High,
        notificationsSentThisMonth: notifRes.count ?? 0,
      });

      setStaffActivity(
        staff.map((s) => ({
          id: s.id,
          full_name: s.full_name || "Unknown",
          job_title: s.job_title || "—",
          team: s.team || "—",
          caseload: caseloadMap[s.id] || 0,
          actionsThisMonth: actionsMap[s.id] || 0,
          availability_status: s.availability_status || "available",
        }))
      );

      setRiskBreakdown([
        { level: "High", count: riskCounts.High, color: RISK_COLORS.High },
        { level: "Medium", count: riskCounts.Medium, color: RISK_COLORS.Medium },
        { level: "Low", count: riskCounts.Low, color: RISK_COLORS.Low },
      ]);
    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
    } finally {
      setDataLoading(false);
      setRefreshing(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin, fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // ── CSV Export helpers ─────────────────────────────────────────────────────
  const exportAuditLog = async () => {
    const { data } = await supabase
      .from("audit_log")
      .select("created_at, actor_name, action, record_type, field_changed, old_value, new_value")
      .order("created_at", { ascending: false })
      .limit(5000);

    if (!data) return;

    const headers = ["Timestamp", "Actor", "Action", "Record Type", "Field Changed", "Old Value", "New Value"];
    const rows = data.map((r) => [
      r.created_at, r.actor_name, r.action, r.record_type,
      r.field_changed || "", r.old_value || "", r.new_value || "",
    ]);

    downloadCSV([headers, ...rows], `focuscms-audit-${format(new Date(), "yyyy-MM-dd")}.csv`);
  };

  const exportYoungPeople = async () => {
    const { data } = await supabase
      .from("young_people")
      .select("focus_id, first_name, last_name, date_of_birth, age, gender, placement_type, placing_authority, placement_start_date, social_worker_name")
      .order("last_name");

    if (!data) return;

    const headers = ["Focus ID", "First Name", "Last Name", "DOB", "Age", "Gender", "Placement Type", "Placing Authority", "Placement Start", "Social Worker"];
    const rows = data.map((r) => [
      r.focus_id || "", r.first_name, r.last_name || "", r.date_of_birth || "",
      String(r.age || ""), r.gender || "", r.placement_type || "",
      r.placing_authority || "", r.placement_start_date || "", r.social_worker_name || "",
    ]);

    downloadCSV([headers, ...rows], `focuscms-young-people-${format(new Date(), "yyyy-MM-dd")}.csv`);
  };

  const exportMissingEpisodes = async () => {
    const { data } = await supabase
      .from("missing_episodes")
      .select("case_id, status, escalation_level, missing_from, returned_at, risk_level, police_notified")
      .order("missing_from", { ascending: false });

    if (!data) return;

    const headers = ["Case ID", "Status", "Escalation Level", "Missing From", "Returned At", "Risk Level", "Police Notified"];
    const rows = data.map((r) => [
      r.case_id || "", r.status || "", r.escalation_level || "",
      r.missing_from || "", r.returned_at || "", r.risk_level || "",
      r.police_notified ? "Yes" : "No",
    ]);

    downloadCSV([headers, ...rows], `focuscms-missing-episodes-${format(new Date(), "yyyy-MM-dd")}.csv`);
  };

  const downloadCSV = (rows: string[][], filename: string) => {
    const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading || !isAdmin) return null;

  const currentMonth = format(new Date(), "MMMM yyyy");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <ModuleHeader />
      <div className="container py-8 px-4">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            </div>
            <p className="text-muted-foreground">
              System health, usage analytics, and data exports · <span className="font-medium">{currentMonth}</span>
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing || dataLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </Button>
        </div>

        {dataLoading ? (
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-28 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : stats ? (
          <>
            {/* ── KPI Cards ──────────────────────────────────────────── */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-8">
              <StatCard icon={<Users className="h-4 w-4" />} label="Young People" value={stats.activeYoungPeople} sub={`${stats.totalYoungPeople} total incl. drafts`} color="text-blue-500" />
              <StatCard icon={<Users className="h-4 w-4" />} label="Staff Members" value={stats.totalStaff} color="text-indigo-500" />
              <StatCard icon={<CheckSquare className="h-4 w-4" />} label="Open Tasks" value={stats.openTasks} sub={stats.overdueTasks > 0 ? `${stats.overdueTasks} overdue` : "None overdue"} color={stats.overdueTasks > 0 ? "text-destructive" : "text-green-500"} />
              <StatCard icon={<AlertTriangle className="h-4 w-4" />} label="Active Missing" value={stats.activeMissingEpisodes} sub={`${stats.totalMissingEpisodes} total episodes`} color={stats.activeMissingEpisodes > 0 ? "text-destructive" : "text-green-500"} />
              <StatCard icon={<TrendingUp className="h-4 w-4" />} label="High Risk YP" value={stats.highRiskCount} color="text-orange-500" />
              <StatCard icon={<FileText className="h-4 w-4" />} label="Docs This Month" value={stats.documentsThisMonth} color="text-violet-500" />
              <StatCard icon={<Activity className="h-4 w-4" />} label="Audit Events" value={stats.auditEntriesThisMonth} sub="this month" color="text-teal-500" />
              <StatCard icon={<Database className="h-4 w-4" />} label="Notifications Sent" value={stats.notificationsSentThisMonth} sub="this month" color="text-sky-500" />
            </div>

            {/* ── Tabs ───────────────────────────────────────────────── */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 max-w-md">
                <TabsTrigger value="overview" className="gap-1.5">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="staff" className="gap-1.5">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Staff Activity</span>
                </TabsTrigger>
                <TabsTrigger value="exports" className="gap-1.5">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Data Exports</span>
                </TabsTrigger>
              </TabsList>

              {/* ── Overview Tab ────────────────────────────────────── */}
              <TabsContent value="overview">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Risk Breakdown Pie */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Current Risk Levels</CardTitle>
                      <CardDescription>Latest assessment per young person</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {riskBreakdown.every((r) => r.count === 0) ? (
                        <p className="text-sm text-muted-foreground text-center py-8">No risk assessments yet</p>
                      ) : (
                        <ResponsiveContainer width="100%" height={220}>
                          <PieChart>
                            <Pie data={riskBreakdown} dataKey="count" nameKey="level" cx="50%" cy="50%" outerRadius={80} label={({ level, count }) => `${level}: ${count}`}>
                              {riskBreakdown.map((entry) => (
                                <Cell key={entry.level} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>

                  {/* Staff Caseload Bar */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Caseload Distribution</CardTitle>
                      <CardDescription>Young people per staff member</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {staffActivity.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">No staff data</p>
                      ) : (
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={staffActivity.filter((s) => s.caseload > 0)} margin={{ top: 0, right: 0, left: -20, bottom: 40 }}>
                            <XAxis dataKey="full_name" angle={-30} textAnchor="end" tick={{ fontSize: 11 }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey="caseload" fill="#6366f1" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* ── Staff Activity Tab ──────────────────────────────── */}
              <TabsContent value="staff">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Staff Activity — {currentMonth}</CardTitle>
                    <CardDescription>Audit log actions per staff member this month</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Name</th>
                            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Job Title</th>
                            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Team</th>
                            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                            <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Caseload</th>
                            <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Actions (month)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {staffActivity
                            .sort((a, b) => b.actionsThisMonth - a.actionsThisMonth)
                            .map((s) => (
                              <tr key={s.id} className="border-b hover:bg-accent/30 transition-colors">
                                <td className="px-4 py-3 font-medium">{s.full_name}</td>
                                <td className="px-4 py-3 text-muted-foreground">{s.job_title}</td>
                                <td className="px-4 py-3 text-muted-foreground">{s.team}</td>
                                <td className="px-4 py-3">
                                  <Badge
                                    variant="outline"
                                    style={{ borderColor: AVAILABILITY_COLORS[s.availability_status] || "#94a3b8", color: AVAILABILITY_COLORS[s.availability_status] || "#94a3b8" }}
                                  >
                                    {s.availability_status.replace("_", " ")}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3 text-right font-mono">{s.caseload}</td>
                                <td className="px-4 py-3 text-right font-mono">{s.actionsThisMonth}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ── Data Exports Tab ────────────────────────────────── */}
              <TabsContent value="exports">
                <div className="grid gap-4 md:grid-cols-3">
                  <ExportCard
                    icon={<Users className="h-5 w-5 text-blue-500" />}
                    title="Young People"
                    description="Core profiles including placement, authority, and social worker details."
                    buttonLabel="Export CSV"
                    onExport={exportYoungPeople}
                  />
                  <ExportCard
                    icon={<Activity className="h-5 w-5 text-teal-500" />}
                    title="Audit Log"
                    description="Last 5,000 system events with actor, action, record type, and before/after values."
                    buttonLabel="Export CSV"
                    onExport={exportAuditLog}
                  />
                  <ExportCard
                    icon={<AlertTriangle className="h-5 w-5 text-orange-500" />}
                    title="Missing Episodes"
                    description="All missing episode records with case ID, escalation level, and police notification status."
                    buttonLabel="Export CSV"
                    onExport={exportMissingEpisodes}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </>
        ) : null}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  icon, label, value, sub, color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub?: string;
  color?: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-5 pb-4">
        <div className={`flex items-center gap-1.5 mb-2 ${color || "text-muted-foreground"}`}>
          {icon}
          <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
        </div>
        <p className="text-3xl font-bold">{value.toLocaleString()}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function ExportCard({
  icon, title, description, buttonLabel, onExport,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonLabel: string;
  onExport: () => void;
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 mb-1">
          {icon}
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto pt-0">
        <Button variant="outline" size="sm" onClick={onExport} className="w-full gap-2">
          <Download className="h-4 w-4" />
          {buttonLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
