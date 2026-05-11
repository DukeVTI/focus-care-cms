import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ModuleHeader } from "@/components/ModuleHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, BarChart3, Clock, UserPlus } from "lucide-react";
import { StaffDirectoryTab } from "@/components/staff/StaffDirectoryTab";
import { CaseloadTab } from "@/components/staff/CaseloadTab";
import { AvailabilityTab } from "@/components/staff/AvailabilityTab";
import { ReassignDialog } from "@/components/staff/ReassignDialog";
import { COMPLETED_TASK_STATUSES, MISSING_EPISODE_STATUSES } from "@/lib/constants";
import { Profile, YoungPerson, Task, MissingEpisode, UserRole } from "@/lib/types";

export default function StaffManagement() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [staffData, setStaffData] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [youngPeople, setYoungPeople] = useState<YoungPerson[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [missingEpisodes, setMissingEpisodes] = useState<MissingEpisode[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [isReassigning, setIsReassigning] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);

    try {
      const [profilesRes, rolesRes, ypRes, tasksRes, missingRes, adminCheck] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("user_roles").select("*"),
        supabase.from("young_people").select("id, first_name, last_name, age, known_risks, user_id, key_worker_id"),
        supabase.from("tasks").select("id, status, young_person_id, assigned_to"),
        supabase.from("missing_episodes").select("id, status, young_person_id, reported_by"),
        supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }),
      ]);

      setStaffData(profilesRes.data || []);
      setUserRoles(rolesRes.data || []);
      setYoungPeople(ypRes.data || []);
      setTasks(tasksRes.data || []);
      setMissingEpisodes(missingRes.data || []);
      setIsAdmin(adminCheck.data === true);
    } catch (error) {
      console.error("Error fetching staff data:", error);
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchData();
  }, [user, fetchData]);

  const getRolesForUser = (userId: string) => {
    return userRoles.filter(r => r.user_id === userId).map(r => r.role);
  };

  // Build staff directory data
  const staffDirectory = staffData.map(s => ({
    id: s.id,
    full_name: s.full_name || "",
    email: s.email || "",
    phone: s.phone || "",
    job_title: s.job_title || "",
    team: s.team || "",
    avatar_url: s.avatar_url,
    availability_status: s.availability_status || "available",
    availability_note: s.availability_note || "",
    roles: getRolesForUser(s.id),
    caseload_count: youngPeople.filter(yp => yp.user_id === s.id).length,
  }));

  // Build caseload data
  const caseloads = staffData.map(s => {
    const myYP = youngPeople.filter(yp => yp.user_id === s.id);
    const ypIds = myYP.map(yp => yp.id);
    const completedStatusList = COMPLETED_TASK_STATUSES.map(s => s.toLowerCase());
    const openTasks = tasks.filter(t => 
      ypIds.includes(t.young_person_id) && 
      !completedStatusList.includes(t.status?.toLowerCase())
    ).length;
    const activeMissing = missingEpisodes.filter(m => 
      ypIds.includes(m.young_person_id) && 
      m.status?.toLowerCase() === MISSING_EPISODE_STATUSES.MISSING.toLowerCase()
    ).length;
    const highRisk = myYP.filter(yp => (yp.known_risks?.length || 0) > 2).length;

    return {
      id: s.id,
      full_name: s.full_name || "",
      team: s.team || "",
      young_people: myYP,
      open_tasks: openTasks,
      active_missing: activeMissing,
      high_risk_count: highRisk,
    };
  });

  const maxCaseload = Math.max(...caseloads.map(c => c.young_people.length), 1);

  // Availability data
  const availabilityData = staffData.map(s => ({
    id: s.id,
    full_name: s.full_name || "",
    email: s.email || "",
    team: s.team || "",
    availability_status: s.availability_status || "available",
    availability_note: s.availability_note || "",
  }));

  const handleUpdateAvailability = async (userId: string, status: string, note: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ availability_status: status, availability_note: note })
      .eq("id", userId);

    if (error) {
      toast.error("Failed to update availability");
    } else {
      toast.success("Availability updated");
      fetchData();
    }
  };

  const handleReassign = async (youngPersonId: string, newStaffId: string, reason: string) => {
    setIsReassigning(true);
    try {
      const { error } = await supabase
        .from("young_people")
        .update({ user_id: newStaffId })
        .eq("id", youngPersonId);

      if (error) throw error;
      toast.success("Young person reassigned successfully");
      setReassignOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to reassign");
    } finally {
      setIsReassigning(false);
    }
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
        <ModuleHeader />
        <div className="container py-8 px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-muted rounded" />
            <div className="h-4 w-96 bg-muted rounded" />
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mt-8">
              {[1, 2, 3].map(i => <div key={i} className="h-48 bg-muted rounded-lg" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <ModuleHeader />
      <div className="container py-8 px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Staff Management</h1>
            <p className="text-muted-foreground">View your team, caseloads, and availability</p>
          </div>
          {isAdmin && (
            <Button onClick={() => setReassignOpen(true)} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Reassign Young Person
            </Button>
          )}
        </div>

        <Tabs defaultValue="directory" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="directory" className="gap-1.5">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Directory</span>
            </TabsTrigger>
            <TabsTrigger value="caseload" className="gap-1.5">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Caseload</span>
            </TabsTrigger>
            <TabsTrigger value="availability" className="gap-1.5">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Availability</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="directory">
            <StaffDirectoryTab
              staff={staffDirectory}
              isAdmin={isAdmin}
              onUpdateAvailability={handleUpdateAvailability}
            />
          </TabsContent>

          <TabsContent value="caseload">
            <CaseloadTab caseloads={caseloads} maxCaseload={maxCaseload} />
          </TabsContent>

          <TabsContent value="availability">
            <AvailabilityTab
              staff={availabilityData}
              isAdmin={isAdmin}
              onUpdateAvailability={handleUpdateAvailability}
            />
          </TabsContent>
        </Tabs>
      </div>

      <ReassignDialog
        open={reassignOpen}
        onOpenChange={setReassignOpen}
        youngPeople={youngPeople.map(yp => ({ id: yp.id, first_name: yp.first_name, last_name: yp.last_name }))}
        staff={staffData.map(s => ({ id: s.id, full_name: s.full_name || "Unknown" }))}
        onReassign={handleReassign}
        isSubmitting={isReassigning}
      />
    </div>
  );
}
