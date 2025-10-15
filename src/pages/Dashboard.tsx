import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Users, CheckCircle2, AlertCircle, Calendar, FileText, Shield, MapPin, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/untypedClient";
import focusLogo from "@/assets/focus-logo.jpg";

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

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
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

    const activeTasks = tasksRes.data?.filter(t => t.status !== "completed" && t.status !== "archived").length || 0;
    const highPriority = tasksRes.data?.filter(t => t.importance === "High" && t.status !== "completed").length || 0;

    setStats({
      youngPeople: youngPeopleRes.count || 0,
      activeTasks,
      highPriority,
      sessions: sessionsRes.count || 0
    });
  };

  if (loading) {
    return null;
  }

  const statCards = [
    { title: "Young People", value: stats.youngPeople.toString(), icon: Users, color: "text-primary", link: "/young-people" },
    { title: "Active Tasks", value: stats.activeTasks.toString(), icon: CheckCircle2, color: "text-success", link: "/tasks" },
    { title: "High Priority", value: stats.highPriority.toString(), icon: AlertCircle, color: "text-warning", link: "/tasks" },
    { title: "Sessions Logged", value: stats.sessions.toString(), icon: Calendar, color: "text-primary", link: "/keywork-sessions" },
  ];

  const modules = [
    { title: "Young People", description: "Manage your caseload", icon: Users, link: "/young-people", color: "primary" },
    { title: "Tasks", description: "Track assignments", icon: CheckCircle2, link: "/tasks", color: "success" },
    { title: "Keywork Sessions", description: "Log sessions", icon: Calendar, link: "/keywork-sessions", color: "primary" },
    { title: "Risk Assessments", description: "Monitor risk levels", icon: Shield, link: "/risk-assessments", color: "warning" },
    { title: "Chronology", description: "Daily observations", icon: BookOpen, link: "/chronology", color: "primary" },
    { title: "Missing Episodes", description: "Track incidents", icon: MapPin, link: "/missing-episodes", color: "destructive" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between px-4 max-w-full">
          <div className="flex items-center gap-2 md:gap-3">
            <img 
              src={focusLogo} 
              alt="FOCUS Logo" 
              className="h-10 w-10 md:h-12 md:w-12 object-contain"
            />
            <div className="hidden sm:block">
              <h1 className="text-base md:text-lg font-bold">FOCUS</h1>
              <p className="text-xs text-muted-foreground hidden md:block">Youth Care Management</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden lg:block text-right">
              <p className="text-sm font-medium">{profile?.full_name || "User"}</p>
              <p className="text-xs text-muted-foreground">{profile?.role || "Staff"}</p>
            </div>
            <Button variant="outline" size="sm" onClick={signOut} className="text-xs md:text-sm">
              <LogOut className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-4 md:py-8 px-4 max-w-full">
        {/* Welcome Section */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {profile?.full_name?.split(" ")[0] || "User"}!</h2>
          <p className="text-sm md:text-base text-muted-foreground">Here's an overview of your youth care activities</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4 mb-6 md:mb-8">
          {statCards.map((stat, index) => (
            <Card 
              key={index} 
              className="transition-all hover:shadow-lg cursor-pointer"
              onClick={() => navigate(stat.link)}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Access Modules */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Core Modules</h2>
          <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((module, index) => (
              <Card
                key={index}
                className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
                onClick={() => navigate(module.link)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-lg bg-${module.color}/10 flex items-center justify-center`}>
                      <module.icon className={`h-6 w-6 text-${module.color}`} />
                    </div>
                    <div>
                      <CardTitle>{module.title}</CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Content Cards */}
        <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
          {/* Recent Tasks */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Recent Tasks
              </CardTitle>
              <CardDescription>Your assigned tasks and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { task: "Complete risk assessment for Sarah", priority: "High", status: "Pending" },
                  { task: "Keywork session with Michael", priority: "Medium", status: "In Progress" },
                  { task: "Update chronology notes", priority: "Low", status: "Completed" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.task}</p>
                      <p className="text-xs text-muted-foreground mt-1">Priority: {item.priority}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.status === "Completed" ? "bg-success/20 text-success" :
                      item.status === "In Progress" ? "bg-warning/20 text-warning" :
                      "bg-destructive/20 text-destructive"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">View All Tasks</Button>
            </CardContent>
          </Card>

          {/* Young People Overview */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Young People
              </CardTitle>
              <CardDescription>Your current caseload overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Sarah Thompson", age: 16, status: "Active", risk: "Medium" },
                  { name: "Michael Chen", age: 15, status: "Active", risk: "Low" },
                  { name: "Emily Rodriguez", age: 17, status: "Active", risk: "High" },
                ].map((person, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-semibold">
                        {person.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{person.name}</p>
                        <p className="text-xs text-muted-foreground">Age: {person.age} • {person.status}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      person.risk === "High" ? "bg-destructive/20 text-destructive" :
                      person.risk === "Medium" ? "bg-warning/20 text-warning" :
                      "bg-success/20 text-success"
                    }`}>
                      {person.risk} Risk
                    </span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">View All Cases</Button>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Sessions */}
        <Card className="mt-4 md:mt-6 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Sessions
            </CardTitle>
            <CardDescription className="text-sm">Scheduled keywork sessions for the week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { name: "Sarah Thompson", date: "Today, 2:00 PM", type: "Planned Session" },
                { name: "Michael Chen", date: "Tomorrow, 10:00 AM", type: "Follow-up" },
                { name: "Emily Rodriguez", date: "Friday, 3:30 PM", type: "Risk Review" },
              ].map((session, index) => (
                <div key={index} className="p-4 rounded-lg border bg-card hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium">{session.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">{session.date}</p>
                    </div>
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {session.type}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}