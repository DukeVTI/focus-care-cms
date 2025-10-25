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
import { format } from "date-fns";
import { LoadingScreen } from "@/components/LoadingScreen";

const returnReportSchema = z.object({
  returned_at: z.string().min(1, "Return date/time is required"),
  outcome: z.string().min(1, "Outcome is required"),
  notes: z.string().trim().max(800, "Notes must be less than 800 characters").optional(),
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
      returned_at: "",
      outcome: "",
      notes: "",
    }
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchEpisode();
    }
  }, [user, id]);

  const fetchEpisode = async () => {
    const { data, error } = await supabase
      .from("missing_episodes")
      .select(`
        *,
        young_people:young_person_id (
          first_name,
          last_name,
          focus_id
        )
      `)
      .eq("id", id)
      .eq("status", "missing")
      .single();
    
    if (error || !data) {
      toast({
        title: "Error",
        description: "Episode not found or already returned",
        variant: "destructive"
      });
      navigate("/missing-episodes");
      return;
    }

    setEpisode(data);
    setLoadingEpisode(false);
  };

  const onSubmit = async (values: ReturnReportFormValues) => {
    if (!user || !id) return;
    
    setSubmitting(true);
    
    const { error } = await supabase
      .from("missing_episodes")
      .update({
        returned_at: values.returned_at,
        outcome: values.outcome,
        notes: episode.notes 
          ? `${episode.notes}\n\nReturn Notes: ${values.notes || "N/A"}`
          : `Return Notes: ${values.notes || "N/A"}`,
        status: "returned"
      })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to report return. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Return reported successfully"
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
        <Button
          variant="ghost"
          onClick={() => navigate("/missing-episodes")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Missing Episodes
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Report Return</CardTitle>
          </CardHeader>
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
              {episode.last_known_location && (
                <p className="text-sm">
                  <span className="font-semibold">Last Known Location:</span>{" "}
                  {episode.last_known_location}
                </p>
              )}
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="returned_at"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date/Time Returned</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="outcome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Outcome</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select outcome" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="returned_voluntarily">Returned Voluntarily</SelectItem>
                          <SelectItem value="brought_back_by_police">Brought Back by Police</SelectItem>
                          <SelectItem value="located_by_staff">Located by Staff</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Return Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional details about the return..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting ? "Reporting..." : "Report Return"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/missing-episodes")}
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
