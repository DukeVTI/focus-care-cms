import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ArrowLeft, Trash2, CheckCircle2, UserCog } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ReassignDialog } from "@/components/tasks/ReassignDialog";
import { ASSIGNEE_TYPES } from "@/lib/constants";
import { TaskDetail as TaskDetailType, YoungPerson, BadgeVariant } from "@/lib/types";

const taskSchema = z.object({
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

export default function TaskDetail() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [task, setTask] = useState<TaskDetailType | null>(null);
  const [youngPerson, setYoungPerson] = useState<YoungPerson | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema)
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchTask();
    }
  }, [user, id]);

  const fetchTask = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select(`
        *,
        young_people:young_person_id (
          id,
          first_name,
          last_name,
          focus_id
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load task",
        variant: "destructive"
      });
      navigate("/tasks");
      return;
    }

    if (data) {
      setTask(data);
      setYoungPerson(data.young_people);
      form.reset({
        title: data.title,
        description: data.description || "",
        assignee_type: data.assignee_type || ASSIGNEE_TYPES.STAFF_NAMED,
        assigned_to_user_id: data.assigned_to_user_id || "",
        expected_completion: data.expected_completion || data.due_date || "",
        date_actioned: data.date_actioned || "",
        support_required: data.support_required || false,
        supporter_role: data.supporter_role,
        importance: data.importance as "LOW" | "MEDIUM" | "HIGH",
        status: data.status as "OPEN" | "IN_PROGRESS" | "DONE" | "ARCHIVED"
      });
    }
  };

  const onSubmit = async (values: TaskFormValues) => {
    setSubmitting(true);
    const { error } = await supabase
      .from("tasks")
      .update({
        title: values.title,
        description: values.description || null,
        assignee_type: values.assignee_type,
        assigned_to_user_id: values.assignee_type === ASSIGNEE_TYPES.STAFF_NAMED ? values.assigned_to_user_id : null,
        expected_completion: values.expected_completion || null,
        date_actioned: values.date_actioned || null,
        support_required: values.support_required,
        supporter_role: values.support_required ? values.supporter_role : null,
        importance: values.importance,
        status: values.status
      })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Task updated successfully"
      });
      setIsEditing(false);
      fetchTask();
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive"
      });
      setDeleting(false);
    } else {
      toast({
        title: "Success",
        description: "Task deleted successfully"
      });
      navigate("/tasks");
    }
  };

  const markAsComplete = async () => {
    const { error } = await supabase
      .from("tasks")
      .update({ 
        status: "DONE",
        completed_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Task marked as complete"
      });
      fetchTask();
    }
  };

  const archiveTask = async () => {
    const { error } = await supabase
      .from("tasks")
      .update({ status: "ARCHIVED" })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to archive task",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Task archived"
      });
      fetchTask();
    }
  };

  if (loading || !task) return null;

  const getImportanceColor = (importance: string): BadgeVariant => {
    const upper = importance?.toUpperCase();
    switch (upper) {
      case "HIGH": return "destructive";
      case "MEDIUM": return "default";
      case "LOW": return "secondary";
      default: return "secondary";
    }
  };

  const getStatusColor = (status: string): BadgeVariant => {
    const upper = status?.toUpperCase();
    switch (upper) {
      case "DONE": return "default";
      case "IN_PROGRESS": return "default";
      case "OPEN": return "secondary";
      case "ARCHIVED": return "outline";
      default: return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <ModuleHeader />
      <div className="container py-8 px-4 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/tasks")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tasks
        </Button>

        <div className="space-y-6">
          {/* Header Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant={getImportanceColor(task.importance)}>
                      {task.importance} Priority
                    </Badge>
                    <Badge variant={getStatusColor(task.status)}>
                      {task.status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </Badge>
                    {task.support_required && (
                      <Badge variant="outline">Support: {task.supporter_role?.replace('_', ' ')}</Badge>
                    )}
                  </div>
                  <CardTitle className="text-2xl mb-2">{task.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      Young Person: <span className="font-medium text-foreground">
                        {youngPerson?.first_name} {youngPerson?.last_name}
                      </span>
                      {youngPerson?.focus_id && ` (${youngPerson.focus_id})`}
                    </span>
                    {(task.expected_completion || task.due_date) && (
                      <span>
                        Due: <span className="font-medium text-foreground">
                          {format(new Date(task.expected_completion || task.due_date), "PPP")}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {task.status !== "DONE" && task.status !== "ARCHIVED" && (
                    <Button onClick={markAsComplete} size="sm">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark Complete
                    </Button>
                  )}
                  {task.status === "DONE" && task.status !== "ARCHIVED" && (
                    <Button onClick={archiveTask} size="sm" variant="outline">
                      Archive
                    </Button>
                  )}
                  <Button onClick={() => setReassignDialogOpen(true)} variant="outline" size="sm">
                    <UserCog className="h-4 w-4 mr-2" />
                    Reassign
                  </Button>
                  {!isEditing && (
                    <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                      Edit
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Task</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this task? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                          {deleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Edit Form or Details */}
          {isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle>Edit Task</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Task Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea rows={4} {...field} />
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
                              <Input {...field} placeholder="User ID" />
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

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="importance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Importance</FormLabel>
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
                    </div>

                    <div className="flex gap-4">
                      <Button type="submit" disabled={submitting}>
                        {submitting ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          form.reset();
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Task Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {task.description && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Description</h3>
                    <p className="text-muted-foreground">{task.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Created:</span>{" "}
                    <span className="font-medium">{format(new Date(task.created_at), "PPP")}</span>
                  </div>
                  {task.completed_at && (
                    <div>
                      <span className="text-muted-foreground">Completed:</span>{" "}
                      <span className="font-medium">{format(new Date(task.completed_at), "PPP")}</span>
                    </div>
                  )}
                  {task.date_actioned && (
                    <div>
                      <span className="text-muted-foreground">Date Actioned:</span>{" "}
                      <span className="font-medium">{format(new Date(task.date_actioned), "PPP")}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Assigned To:</span>{" "}
                    <span className="font-medium">{task.assignee_type?.replace('_', ' ')}</span>
                  </div>
                </div>
                {task.reassigned_history && task.reassigned_history.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Reassignment History</h3>
                    <div className="space-y-2">
                      {task.reassigned_history.map((entry: any, index: number) => (
                        <div key={index} className="text-sm text-muted-foreground border-l-2 pl-3">
                          {format(new Date(entry.at), "PPP")} - Reassigned
                          {entry.note && `: ${entry.note}`}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ReassignDialog
        open={reassignDialogOpen}
        onOpenChange={setReassignDialogOpen}
        task={task}
        onReassigned={fetchTask}
      />
    </div>
  );
}
