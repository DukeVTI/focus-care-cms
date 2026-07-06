import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { YoungPerson } from "@/lib/types";
import { NotificationService } from "@/utils/notificationService";
import { NOTIFICATION_TYPES, ASSIGNEE_TYPES } from "@/lib/constants";

const taskSchema = z.object({
  young_person_id: z.string().min(1, "Please select a young person"),
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().trim().max(1000, "Description must be less than 1000 characters").optional(),
  assignee_type: z.enum(["STAFF_GENERAL", "STAFF_NAMED", "YP", "SOCIAL_WORKER", "PA"]),
  assigned_to_user_id: z.string().optional(),
  expected_completion: z.string().optional(),
  date_actioned: z.string().optional(),
  support_required: z.boolean().default(false),
  supporter_role: z.enum(["SUPPORT_WORKER", "KEYWORKER", "STAFF_ON_SHIFT"]).optional(),
  importance: z.enum(["LOW", "MEDIUM", "HIGH"]),
  status: z.enum(["OPEN", "IN_PROGRESS", "DONE", "ARCHIVED"])
});

type TaskFormValues = z.infer<typeof taskSchema>;

export default function NewTask() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [youngPeople, setYoungPeople] = useState<YoungPerson[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      young_person_id: "",
      title: "",
      description: "",
      assignee_type: ASSIGNEE_TYPES.STAFF_NAMED,
      assigned_to_user_id: "",
      expected_completion: "",
      date_actioned: "",
      support_required: false,
      supporter_role: undefined,
      importance: "MEDIUM",
      status: "OPEN"
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
    }
  }, [user]);

  const fetchYoungPeople = async () => {
    const { data } = await supabase
      .from("young_people")
      .select("id, first_name, last_name")
      .order("last_name");
    
    if (data) {
      setYoungPeople(data as any);
    }
  };

  const onSubmit = async (values: TaskFormValues) => {
    if (!user) return;
    
    setSubmitting(true);
    const { error } = await (supabase
      .from("tasks") as any)
      .insert([{
        young_person_id: values.young_person_id,
        title: values.title,
        description: values.description || null,
        assignee_type: values.assignee_type,
        assigned_to_user_id: values.assignee_type === ASSIGNEE_TYPES.STAFF_NAMED ? values.assigned_to_user_id : null,
        expected_completion: values.expected_completion || null,
        date_actioned: values.date_actioned || null,
        support_required: values.support_required,
        supporter_role: values.support_required ? values.supporter_role : null,
        importance: values.importance,
        status: values.status,
        assigned_to: user.id,
        created_by_user_id: user.id,
        requires_support: values.support_required ? "yes" : "no",
      }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Task created successfully"
      });

      // Fire task_assigned notification if assigned to a named staff member
      if (values.assignee_type === "STAFF_NAMED" && values.assigned_to_user_id) {
        try {
          const { data: assigneeProfile } = await supabase
            .from("profiles")
            .select("email")
            .eq("id", values.assigned_to_user_id)
            .single();

          const yp = youngPeople.find((y) => y.id === values.young_person_id);

          if (assigneeProfile?.email && yp) {
            await NotificationService.enqueueNotification(
              assigneeProfile.email,
              values.assigned_to_user_id,
              NOTIFICATION_TYPES.TASK_ASSIGNED,
              {
                task_title: values.title,
                task_id: "new",
                due_date: values.expected_completion || "No due date set",
                young_person_name: `${yp.first_name} ${yp.last_name}`,
              }
            );
          }
        } catch {
          // Notification failure is non-fatal — task was already saved
          console.warn("Failed to enqueue task_assigned notification");
        }
      }

      navigate("/tasks");
    }
    setSubmitting(false);
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <ModuleHeader />
      <div className="container py-8 px-4 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/tasks")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tasks
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Create New Task</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="young_person_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Young Person</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select young person" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {youngPeople.map((yp) => (
                            <SelectItem key={yp.id} value={yp.id}>
                              {yp.first_name} {yp.last_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Complete LAC review paperwork" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional details about the task..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assignee_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign To</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="STAFF_GENERAL">Staff General</SelectItem>
                          <SelectItem value="STAFF_NAMED">Staff Named</SelectItem>
                          <SelectItem value="YP">Young Person</SelectItem>
                          <SelectItem value="SOCIAL_WORKER">Social Worker</SelectItem>
                          <SelectItem value="PA">PA</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("assignee_type") === "STAFF_NAMED" && (
                  <FormField
                    control={form.control}
                    name="assigned_to_user_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assign to User</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="User ID (future: user picker)" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="expected_completion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Completion Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date_actioned"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date Actioned</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="support_required"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Is Support Required?</FormLabel>
                      <Select onValueChange={(value) => field.onChange(value === "true")} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="false">No</SelectItem>
                          <SelectItem value="true">Yes</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("support_required") && (
                  <FormField
                    control={form.control}
                    name="supporter_role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Who Will Support?</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="SUPPORT_WORKER">Support Worker</SelectItem>
                            <SelectItem value="KEYWORKER">Keyworker</SelectItem>
                            <SelectItem value="STAFF_ON_SHIFT">Staff on Shift</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="importance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Level of Importance</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="OPEN">Open</SelectItem>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="DONE">Done</SelectItem>
                          <SelectItem value="ARCHIVED">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting ? "Creating..." : "Create Task"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/tasks")}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
