import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/untypedClient";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ArrowLeft, Calendar, Clock, FileText, MapPin, CheckSquare } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SessionForm } from "@/components/keywork-sessions/SessionForm";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const sessionSchema = z.object({
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
  author_name: z.string().min(1, "Author is required")
});

type SessionFormValues = z.infer<typeof sessionSchema>;

export default function KeyworkSessionDetail() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<any>(null);
  const [youngPerson, setYoungPerson] = useState<any>(null);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionSchema)
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchSession();
      fetchStaffList();
    }
  }, [user, id]);

  const fetchStaffList = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .order("full_name");
    
    if (data) {
      setStaffList(data);
    }
  };

  const fetchSession = async () => {
    const { data, error } = await supabase
      .from("keywork_sessions")
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
        description: "Failed to load session",
        variant: "destructive"
      });
      navigate("/keywork-sessions");
      return;
    }

    if (data) {
      setSession(data);
      setYoungPerson(data.young_people);
      form.reset({
        session_date: data.session_date,
        session_type: data.session_type as "Planned" | "Unplanned",
        topic: data.topic,
        duration_minutes: data.duration_minutes,
        location: data.location || "",
        relevant_standard: data.relevant_standard || "",
        title: data.title || "",
        notes: data.notes || "",
        follow_on_action: data.follow_on_action || "",
        standards_met: data.standards_met || "",
        follow_up_required: data.follow_up_required,
        author_name: data.author_name || ""
      });
    }
  };

  const onSubmit = async (values: SessionFormValues) => {
    setSubmitting(true);
    const { error } = await supabase
      .from("keywork_sessions")
      .update({
        session_date: values.session_date,
        session_type: values.session_type,
        topic: values.topic,
        duration_minutes: values.duration_minutes,
        location: values.location,
        relevant_standard: values.relevant_standard,
        title: values.title,
        notes: values.notes || null,
        follow_on_action: values.follow_on_action || null,
        standards_met: values.standards_met || null,
        follow_up_required: values.follow_up_required,
        author_name: values.author_name
      })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update session",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Session updated successfully"
      });
      setIsEditing(false);
      fetchSession();
    }
    setSubmitting(false);
  };

  if (loading || !session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <ModuleHeader />
      <div className="container py-8 px-4 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/keywork-sessions")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sessions
        </Button>

        <div className="space-y-6">
          {/* Header Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant={session.session_type === "Planned" ? "default" : "secondary"}>
                      {session.session_type}
                    </Badge>
                    {session.follow_up_required && (
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                        Follow-up Required
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-2xl mb-3">
                    {youngPerson?.first_name} {youngPerson?.last_name}
                    {youngPerson?.focus_id && <span className="text-muted-foreground ml-2">({youngPerson.focus_id})</span>}
                  </CardTitle>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(session.session_date), "PPP")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{session.duration_minutes} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium text-foreground">{session.topic}</span>
                    </div>
                    {session.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{session.location}</span>
                      </div>
                    )}
                    {session.author_name && (
                      <div className="text-xs">
                        Author: {session.author_name}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {!isEditing && (
                    <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Edit Form or Details */}
          {isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle>Edit Session</CardTitle>
              </CardHeader>
              <CardContent>
                <SessionForm
                  form={form}
                  onSubmit={onSubmit}
                  youngPeople={[]}
                  staffList={staffList}
                  submitting={submitting}
                  isEditMode={true}
                  youngPersonName={`${youngPerson?.first_name} ${youngPerson?.last_name}`}
                  showTaskForm={false}
                  onToggleTaskForm={() => {}}
                />
                <div className="flex gap-4 mt-6">
                  <Button onClick={form.handleSubmit(onSubmit)} disabled={submitting}>
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
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Session Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {session.title && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Title</p>
                      <p className="text-base">{session.title}</p>
                    </div>
                  )}
                  {session.relevant_standard && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Relevant Standard</p>
                      <p className="text-sm">{session.relevant_standard}</p>
                    </div>
                  )}
                  {session.linked_task_id && (
                    <div className="flex items-center gap-2">
                      <CheckSquare className="h-4 w-4 text-primary" />
                      <Badge variant="outline">Linked Task</Badge>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="h-auto p-0"
                        onClick={() => navigate(`/tasks/${session.linked_task_id}`)}
                      >
                        View Task
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {session.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Session Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{session.notes}</p>
                  </CardContent>
                </Card>
              )}

              {session.follow_on_action && (
                <Card>
                  <CardHeader>
                    <CardTitle>Follow-On Action</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{session.follow_on_action}</p>
                  </CardContent>
                </Card>
              )}

              {session.standards_met && (
                <Card>
                  <CardHeader>
                    <CardTitle>Standards Met</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{session.standards_met}</p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Session Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Created:</span>{" "}
                    <span className="font-medium">{format(new Date(session.created_at), "PPP 'at' p")}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Updated:</span>{" "}
                    <span className="font-medium">{format(new Date(session.updated_at), "PPP 'at' p")}</span>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
