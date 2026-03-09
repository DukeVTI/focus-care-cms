import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Users, CheckCircle2, AlertCircle, Calendar, FileText, Shield, MapPin, BookOpen, UserCog, ArrowRight, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/untypedClient";
import { format } from "date-fns";
import focusLogo from "@/assets/focus-logo.jpg";
import { RiskTrendChart } from "@/components/dashboard/RiskTrendChart";
import { CaseloadDistributionChart } from "@/components/dashboard/CaseloadDistributionChart";
import { TaskCompletionChart } from "@/components/dashboard/TaskCompletionChart";
import { NotificationsBell } from "@/components/dashboard/NotificationsBell";

export default function Dashboard() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    youngPeople: 0,
    activeTasks: 0,
    highPriority: 0,
    sessions: 0
  });
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [recentYoungPeople, setRecentYoungPeople] = useState<any[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
      fetchRecentTasks();
      fetchRecentYoungPeople();
      fetchUpcomingSessions();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    setProfile(data);
  };

  const fetchStats = async () => {
    const [youngPeopleRes, tasksRes, sessionsRes] = await Promise.all([
      supabase.from("young_people").select("id", { count: "exact", head: true }),
      supabase.from("tasks").select("*"),
      supabase.from("keywork_sessions").select("id", { count: "exact", head: true })
    ]);

    const activeTasks = tasksRes.data?.filter(t => !["completed","COMPLETED","done","DONE","archived","ARCHIVED"].includes(t.status)).length || 0;
    const highPriority = tasksRes.data?.filter(t => ["High","HIGH"].includes(t.importance) && !["completed","COMPLETED","done","DONE","archived","ARCHIVED"].includes(t.status)).length || 0;

    setStats({
      youngPeople: youngPeopleRes.count || 0,
      activeTasks,
      highPriority,
      sessions: sessionsRes.count || 0
    });
  };

  const fetchRecentTasks = async () => {
    const { data } = await supabase
      .from("tasks")
      .select(`*, young_people:young_person_id (first_name, last_name)`)
      .order("created_at", { ascending: false })
      .limit(4);
    if (data) setRecentTasks(data);
  };

  const fetchRecentYoungPeople = async () => {
    const { data } = await supabase
      .from("young_people")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(4);
    if (data) setRecentYoungPeople(data);
  };

  const fetchUpcomingSessions = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data } = await supabase
      .from("keywork_sessions")
      .select(`*, young_people:young_person_id (first_name, last_name)`)
      .gte("session_date", today.toISOString())
      .order("session_date", { ascending: true })
      .limit(3);
    if (data) setUpcomingSessions(data);
  };

  if (loading) return null;

  const statCards = [
    { title: "Young People", value: stats.youngPeople, icon: Users, color: "text-primary", bgColor: "bg-primary/10", link: "/young-people" },
    { title: "Active Tasks", value: stats.activeTasks, icon: CheckCircle2, color: "text-success", bgColor: "bg-success/10", link: "/tasks" },
    { title: "High Priority", value: stats.highPriority, icon: AlertCircle, color: "text-warning", bgColor: "bg-warning/10", link: "/tasks" },
    { title: "Sessions Logged", value: stats.sessions, icon: Calendar, color: "text-primary", bgColor: "bg-primary/10", link: "/keywork-sessions" },
  ];

  const modules = [
    { title: "Young People", description: "Manage your caseload", icon: Users, link: "/young-people", color: "text-primary", bgColor: "bg-primary/10" },
    { title: "Tasks", description: "Track assignments", icon: CheckCircle2, link: "/tasks", color: "text-success", bgColor: "bg-success/10" },
    { title: "Keywork Sessions", description: "Log sessions", icon: Calendar, link: "/keywork-sessions", color: "text-primary", bgColor: "bg-primary/10" },
    { title: "Risk Assessments", description: "Monitor risk levels", icon: Shield, link: "/risk-assessments", color: "text-warning", bgColor: "bg-warning/10" },
    { title: "Chronology", description: "Daily observations", icon: BookOpen, link: "/chronology", color: "text-primary", bgColor: "bg-primary/10" },
    { title: "Missing Episodes", description: "Track incidents", icon: MapPin, link: "/missing-episodes", color: "text-destructive", bgColor: "bg-destructive/10" },
    { title: "Staff Management", description: "Team & caseloads", icon: UserCog, link: "/staff", color: "text-primary", bgColor: "bg-primary/10" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <img src={focusLogo} alt="FOCUS Logo" className="h-10 w-10 md:h-11 md:w-11 rounded-lg object-contain shadow-sm" />
            <div className="hidden sm:block">
              <h1 className="text-base md:text-lg font-bold tracking-tight">FOCUS</h1>
              <p className="text-[11px] text-muted-foreground leading-none">NextGen Care Support</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden lg:block text-right">
              <p className="text-sm font-semibold">{profile?.full_name || "User"}</p>
              <p className="text-[11px] text-muted-foreground leading-none">{profile?.role || "Staff"}</p>
            </div>
            <Button variant="outline" size="sm" onClick={signOut} className="text-xs gap-1.5">
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6 md:py-8 px-4 md:px-6 max-w-7xl mx-auto space-y-8">
        {/* Welcome */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">
            Welcome back, <span className="text-primary">{profile?.full_name?.split(" ")[0] || "User"}</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Here's an overview of your Next Gen platform.</p>
        </div>

        {/* Stats */}
        <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, i) => (
            <Card
              key={i}
              className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border-transparent hover:border-primary/20"
              onClick={() => navigate(stat.link)}
            >
              <CardContent className="p-4 md:p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.title}</span>
                  <div className={`h-8 w-8 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-3xl md:text-4xl font-bold tracking-tight">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Core Modules */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg md:text-xl font-bold">Core Modules</h3>
          </div>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {modules.map((module, i) => (
              <Card
                key={i}
                className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border-transparent hover:border-primary/20"
                onClick={() => navigate(module.link)}
              >
                <CardContent className="p-4 md:p-5 flex flex-col items-start gap-3">
                  <div className={`h-10 w-10 rounded-xl ${module.bgColor} flex items-center justify-center transition-transform duration-200 group-hover:scale-110`}>
                    <module.icon className={`h-5 w-5 ${module.color}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{module.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{module.description}</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Analytics */}
        <section>
          <h3 className="text-lg md:text-xl font-bold mb-4">Analytics</h3>
          <div className="grid gap-4 lg:grid-cols-3">
            <RiskTrendChart />
            <CaseloadDistributionChart />
            <TaskCompletionChart />
          </div>
        </section>

        {/* Activity Grid */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Recent Tasks */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  </div>
                  Recent Tasks
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => navigate("/tasks")}>
                  View all <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {recentTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No tasks yet</p>
                ) : (
                  recentTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer group"
                      onClick={() => navigate(`/tasks/${task.id}`)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{task.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {task.young_people?.first_name} {task.young_people?.last_name} · {task.importance}
                        </p>
                      </div>
                      <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${
                        task.status === "completed" || task.status === "DONE" ? "bg-success/15 text-success" :
                        task.status === "in_progress" || task.status === "IN_PROGRESS" ? "bg-warning/15 text-warning" :
                        "bg-destructive/15 text-destructive"
                      }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Young People */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-3.5 w-3.5 text-primary" />
                  </div>
                  Young People
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => navigate("/young-people")}>
                  View all <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {recentYoungPeople.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No young people yet</p>
                ) : (
                  recentYoungPeople.map((person) => {
                    const age = new Date().getFullYear() - new Date(person.date_of_birth).getFullYear();
                    return (
                      <div
                        key={person.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                        onClick={() => navigate(`/young-people/${person.id}`)}
                      >
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                          {person.first_name[0]}{person.last_name?.[0] || ""}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{person.first_name} {person.last_name}</p>
                          <p className="text-xs text-muted-foreground">Age: {age} · {person.gender}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Sessions */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                </div>
                Upcoming Sessions
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => navigate("/keywork-sessions")}>
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {upcomingSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No upcoming sessions</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-xl border bg-card hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
                    onClick={() => navigate(`/keywork-sessions/${session.id}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-sm">{session.young_people?.first_name} {session.young_people?.last_name}</p>
                      <FileText className="h-4 w-4 text-muted-foreground/50" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                      <Clock className="h-3 w-3" />
                      {format(new Date(session.session_date), "PPp")}
                    </div>
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                      {session.session_type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
