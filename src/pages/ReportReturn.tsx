import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/untypedClient";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { format, addDays } from "date-fns";
import { LoadingScreen } from "@/components/LoadingScreen";

const returnReportSchema = z.object({
  returned_at: z.string().min(1, "Return date/time is required"),
  found_by: z.string().min(1, "Please specify who found the young person"),
  found_location: z.string().trim().max(500).optional(),
  return_reason: z.string().trim().max(1000).optional(),
  risks_encountered: z.string().trim().max(1000).optional(),
  follow_up_actions: z.string().trim().max(1000).optional(),
  outcome: z.string().min(1, "Outcome is required"),
  notes: z.string().trim().max(800).optional(),
});

type ReturnReportFormValues = z.infer<typeof returnReportSchema>;

export default function ReportReturn() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [episode, setEpisode] = useState<any>(null);
  const [loadingEpisode, setLoadingEpisode] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ReturnReportFormValues>({
    resolver: zodResolver(returnReportSchema),
    defaultValues: {
      returned_at: "", found_by: "", found_location: "", return_reason: "",
      risks_encountered: "", follow_up_actions: "", outcome: "", notes: "",
    }
  });

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && id) fetchEpisode();
  }, [user, id]);

  const fetchEpisode = async () => {
    const { data, error } = await supabase
      .from("missing_episodes")
      .select(`*, young_people:young_person_id (first_name, last_name, focus_id)`)
      .eq("id", id)
      .eq("status", "missing")
      .single();
    
    if (error || !data) {
      toast({ title: "Error", description: "Episode not found or already returned", variant: "destructive" });
      navigate("/missing-episodes");
      return;
    }
    setEpisode(data);
    setLoadingEpisode(false);
  };

  const createFollowUpTask = async (episodeData: any) => {
    if (!user) return;
    
    const dueDate = format(addDays(new Date(), 1), "yyyy-MM-dd");
    const ypName = `${episodeData.young_people?.first_name || ""} ${episodeData.young_people?.last_name || ""}`.trim();

    // Create 24hr risk assessment task
    await supabase.from("tasks").insert([{
      young_person_id: episodeData.young_person_id,
      assigned_to: user.id,
      title: `24hr Risk Assessment – ${ypName} (Missing Return)`,
      description: `Automatic task: ${ypName} returned from missing episode (Case: ${episodeData.case_id || "N/A"}). Complete a risk assessment within 24 hours of return.`,
      importance: "high",
      requires_support: "no",
      due_date: dueDate,
      status: "pending",
      created_by_user_id: user.id,
    }]);

    // Create return interview task
    const interviewDue = format(addDays(new Date(), 3), "yyyy-MM-dd");
    await supabase.from("tasks").insert([{
      young_person_id: episodeData.young_person_id,
      assigned_to: user.id,
      title: `Return Interview – ${ypName}`,
      description: `Automatic task: Conduct a return interview with ${ypName} within 72 hours of return from missing episode (Case: ${episodeData.case_id || "N/A"}).`,
      importance: "high",
      requires_support: "no",
      due_date: interviewDue,
      status: "pending",
      created_by_user_id: user.id,
    }]);
  };

  const onSubmit = async (values: ReturnReportFormValues) => {
    if (!user || !id) return;
    setSubmitting(true);
    
    const { error } = await supabase
      .from("missing_episodes")
      .update({
        returned_at: values.returned_at,
        found_by: values.found_by,
        found_location: values.found_location || null,
        return_reason: values.return_reason || null,
        risks_encountered: values.risks_encountered || null,
        follow_up_actions: values.follow_up_actions || null,
        outcome: values.outcome,
        notes: episode.notes
          ? `${episode.notes}\n\nReturn Notes: ${values.notes || "N/A"}`
          : `Return Notes: ${values.notes || "N/A"}`,
        status: "returned"
      })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to report return.", variant: "destructive" });
    } else {
      // Auto-create follow-up tasks
      await createFollowUpTask(episode);
      
      toast({
        title: "Return Reported",
        description: "Return recorded. A 24hr risk assessment task and return interview task have been auto-created.",
      });
      navigate(`/missing-episodes/${id}`);
    }
    setSubmitting(false);
  };

  if (loading || loadingEpisode) return <LoadingScreen />;
  if (!episode) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <ModuleHeader />
      <div className="container py-8 px-4 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate("/missing-episodes")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Missing Episodes
        </Button>

        <Card>
          <CardHeader><CardTitle>Report Return</CardTitle></CardHeader>
          <CardContent>
            <div className="mb-6 p-4 bg-accent/10 rounded-lg space-y-2">
              <p className="text-sm">
                <span className="font-semibold">Young Person:</span>{" "}
                {episode.young_people?.first_name} {episode.young_people?.last_name}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Missing From:</span>{" "}
                {format(new Date(episode.missing_from), "PPp")}
              </p>
              {episode.case_id && (
                <p className="text-sm">
                  <span className="font-semibold">Case:</span> {episode.case_id}
                </p>
              )}
              {episode.last_known_location && (
                <p className="text-sm">
                  <span className="font-semibold">Last Known Location:</span> {episode.last_known_location}
                </p>
              )}
            </div>

            <div className="mb-6 p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm text-primary font-medium">
                ℹ️ Reporting a return will auto-create a 24hr risk assessment task and a 72hr return interview task.
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="returned_at" render={({ field }) => (
                  <FormItem><FormLabel>Date/Time Returned *</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <FormField control={form.control} name="found_by" render={({ field }) => (
                  <FormItem><FormLabel>Found By *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Who found the young person?" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="self-returned">Self-Returned</SelectItem>
                        <SelectItem value="police">Police</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="family">Family / Carer</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="found_location" render={({ field }) => (
                  <FormItem><FormLabel>Where Found</FormLabel><FormControl><Input placeholder="Location where young person was found" {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <FormField control={form.control} name="return_reason" render={({ field }) => (
                  <FormItem><FormLabel>Reason for Going Missing (YP's Explanation)</FormLabel><FormControl>
                    <Textarea placeholder="Young person's explanation..." className="min-h-[100px]" {...field} />
                  </FormControl><FormMessage /></FormItem>
                )} />

                <FormField control={form.control} name="risks_encountered" render={({ field }) => (
                  <FormItem><FormLabel>Risks Encountered While Missing</FormLabel><FormControl>
                    <Textarea placeholder="E.g., exploitation, substance use, unsafe contacts..." className="min-h-[100px]" {...field} />
                  </FormControl><FormMessage /></FormItem>
                )} />

                <FormField control={form.control} name="follow_up_actions" render={({ field }) => (
                  <FormItem><FormLabel>Follow-up Actions</FormLabel><FormControl>
                    <Textarea placeholder="E.g., referrals, safety planning, meetings..." className="min-h-[100px]" {...field} />
                  </FormControl><FormMessage /></FormItem>
                )} />

                <FormField control={form.control} name="outcome" render={({ field }) => (
                  <FormItem><FormLabel>Outcome *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select outcome" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="safe_well">Returned Safe & Well</SelectItem>
                        <SelectItem value="police_located">Located by Police</SelectItem>
                        <SelectItem value="family_located">Located by Family</SelectItem>
                        <SelectItem value="self_returned">Self-Returned</SelectItem>
                        <SelectItem value="medical_attention">Required Medical Attention</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem><FormLabel>Return Notes (Optional)</FormLabel><FormControl>
                    <Textarea placeholder="Additional details about the return..." rows={4} {...field} />
                  </FormControl><FormMessage /></FormItem>
                )} />

                <div className="flex gap-4">
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting ? "Reporting..." : "Report Return"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate("/missing-episodes")} className="flex-1">
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
