import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ManagerApprovalSectionProps {
  episode: any;
  userId: string;
  onUpdate: () => void;
}

export const ManagerApprovalSection = ({ episode, userId, onUpdate }: ManagerApprovalSectionProps) => {
  const { toast } = useToast();
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (episode.status !== "returned") return null;

  const handleApprove = async () => {
    setSubmitting(true);
    const { error } = await supabase
      .from("missing_episodes")
      .update({
        manager_approved: true,
        manager_approved_by: userId,
        manager_approved_at: new Date().toISOString(),
      })
      .eq("id", episode.id);

    if (error) {
      toast({ title: "Error", description: "Failed to approve", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Episode approved by manager" });
      onUpdate();
    }
    setSubmitting(false);
  };

  const handleCompleteInterview = async () => {
    setSubmitting(true);
    const { error } = await supabase
      .from("missing_episodes")
      .update({
        return_interview_completed: true,
        return_interview_date: new Date().toISOString(),
        return_interview_notes: notes || null,
      })
      .eq("id", episode.id);

    if (error) {
      toast({ title: "Error", description: "Failed to save", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Return interview recorded" });
      onUpdate();
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      {/* Return Interview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {episode.return_interview_completed ? (
              <CheckCircle2 className="h-5 w-5 text-primary" />
            ) : (
              <Clock className="h-5 w-5 text-amber-500" />
            )}
            Return Interview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {episode.return_interview_completed ? (
            <div className="space-y-2">
              <Badge variant="secondary" className="gap-1">
                <CheckCircle2 className="h-3 w-3" /> Completed
              </Badge>
              {episode.return_interview_date && (
                <p className="text-sm text-muted-foreground">
                  {format(new Date(episode.return_interview_date), "PPp")}
                </p>
              )}
              {episode.return_interview_notes && (
                <p className="text-sm mt-2 whitespace-pre-wrap">{episode.return_interview_notes}</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                A return interview should be completed within 72 hours of return.
              </p>
              <Textarea
                placeholder="Record return interview notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px]"
              />
              <Button onClick={handleCompleteInterview} disabled={submitting} size="sm">
                {submitting ? "Saving..." : "Complete Interview"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manager Sign-off */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Manager Sign-off
          </CardTitle>
        </CardHeader>
        <CardContent>
          {episode.manager_approved ? (
            <div className="space-y-2">
              <Badge variant="secondary" className="gap-1">
                <CheckCircle2 className="h-3 w-3" /> Approved
              </Badge>
              {episode.manager_approved_at && (
                <p className="text-sm text-muted-foreground">
                  Approved on {format(new Date(episode.manager_approved_at), "PPp")}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Manager approval is required to close this episode.
              </p>
              <Button onClick={handleApprove} disabled={submitting} size="sm" variant="default">
                {submitting ? "Approving..." : "Approve & Close"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
