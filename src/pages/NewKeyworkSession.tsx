import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SessionForm } from "@/components/keywork-sessions/SessionForm";
import { TASK_STATUSES } from "@/lib/constants";
import { YoungPerson, Profile } from "@/lib/types";

const sessionSchema = z.object({
  young_person_id: z.string().min(1, "Please select a young person"),
  session_date: z.string().min(1, "Session date is required"),
  session_type: z.enum(["Planned", "Unplanned"]),
  topic: z.string().trim().min(1, "Topic is required").max(200, "Topic must be less than 200 characters"),
  duration_minutes: z.number().min(1, "Duration is required"),
  location: z.string().min(1, "Location is required"),
  relevant_standard: z.string().min(1, "Relevant standard is required"),
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  notes: z.string().trim().max(2000, "Notes must be less than 2000 characters").optional(),
  follow_on_action: z.string().trim().max(1000, "Follow-on action must be less than 1000 characters").optional(),
  standards_met: z.string().trim().max(500, "Standards met must be less than 500 characters").optional(),
  follow_up_required: z.boolean(),
  author_name: z.string().min(1, "Author is required"),
  task_title: z.string().optional(),
  task_description: z.string().optional(),
  task_due_date: z.string().optional()
});

type SessionFormValues = z.infer<typeof sessionSchema>;

export default function NewKeyworkSession() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [youngPeople, setYoungPeople] = useState<YoungPerson[]>([]);
  const [staffList, setStaffList] = useState<Profile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);

  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      young_person_id: "",
      session_date: new Date().toISOString().split('T')[0],
      session_type: "Planned",
      topic: "",
      duration_minutes: 60,
      location: "",
      relevant_standard: "",
      title: "",
      notes: "",
      follow_on_action: "",
      standards_met: "",
      follow_up_required: false,
      author_name: "",
      task_title: "",
      task_description: "",
      task_due_date: ""
    }
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchYoungPeople();
      fetchStaffList();
    }
  }, [user]);

  const fetchYoungPeople = async () => {
    const { data } = await supabase
      .from("young_people")
      .select("id, first_name, last_name, focus_id")
      .order("last_name");
    
    if (data) {
      setYoungPeople(data);
    }
  };

  const fetchStaffList = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .order("full_name");
    
    if (data) {
      setStaffList(data);
    }
  };

  const onSubmit = async (values: SessionFormValues) => {
    if (!user) return;
    
    setSubmitting(true);
    
    try {
      // First, create the task if requested
      let linkedTaskId = null;
      if (showTaskForm && values.task_title) {
        const { data: taskData, error: taskError } = await supabase
          .from("tasks")
          .insert([{
            young_person_id: values.young_person_id,
            title: values.task_title,
            description: values.task_description || "",
            due_date: values.task_due_date || null,
            importance: "Medium",
            requires_support: "No",
            status: TASK_STATUSES.PENDING,
            assigned_to: user.id
          }])
          .select()
          .single();

        if (taskError) {
          throw new Error("Failed to create linked task");
        }
        linkedTaskId = taskData.id;
      }

      // Then create the session
      const { error: sessionError } = await supabase
        .from("keywork_sessions")
        .insert([{
          young_person_id: values.young_person_id,
          session_date: values.session_date,
          session_type: values.session_type,
          topic: values.topic,
          duration_minutes: values.duration_minutes,
          location: values.location,
          relevant_standard: values.relevant_standard,
          title: values.title,
          notes: values.notes || null,
          follow_on_action: values.follow_on_action || null,
          standards_met: values.standards_met ? (Array.isArray(values.standards_met) ? values.standards_met : [values.standards_met]) : null,
          follow_up_required: values.follow_up_required,
          author_name: values.author_name,
          staff_id: user.id,
          linked_task_id: linkedTaskId
        }]);

      if (sessionError) {
        throw new Error("Failed to log session");
      }

      toast({
        title: "Success",
        description: linkedTaskId 
          ? "Session logged and task created successfully" 
          : "Session logged successfully"
      });
      navigate("/keywork-sessions");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to log session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <ModuleHeader />
      <div className="container py-8 px-4 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/keywork-sessions")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sessions
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Log Keywork Session</CardTitle>
          </CardHeader>
          <CardContent>
            <SessionForm
              form={form}
              onSubmit={onSubmit}
              youngPeople={youngPeople}
              staffList={staffList}
              submitting={submitting}
              showTaskForm={showTaskForm}
              onToggleTaskForm={setShowTaskForm}
            />
            <div className="flex gap-4 mt-6">
              <Button 
                onClick={form.handleSubmit(onSubmit)} 
                disabled={submitting} 
                className="flex-1"
              >
                {submitting ? "Logging..." : "Log Session"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/keywork-sessions")}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
