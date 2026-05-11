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
import { IncidentDetailsForm } from "@/components/missing-episodes/IncidentDetailsForm";
import { NotificationChecklist } from "@/components/missing-episodes/NotificationChecklist";
import { MISSING_EPISODE_STATUSES } from "@/lib/constants";
import { YoungPerson } from "@/lib/types";

const missingReportSchema = z.object({
  young_person_id: z.string().min(1, "Please select a young person"),
  missing_from: z.string().min(1, "Missing date/time is required"),
  last_known_location: z.string().trim().max(500).optional(),
  missing_reason: z.string().min(1, "Reason for going missing is required"),
  edt_contact: z.string().trim().max(500).optional(),
  notes: z.string().trim().max(800).optional(),
  police_notified: z.boolean().default(false),
  police_reference: z.string().trim().max(100).optional(),
  social_worker_notified: z.boolean().default(false),
  placing_authority_notified: z.boolean().default(false),
  clothing_description: z.string().trim().max(500).optional(),
  distinguishing_features: z.string().trim().max(500).optional(),
  known_associates: z.string().trim().max(500).optional(),
  likely_destinations: z.string().trim().max(500).optional(),
  transport_mode: z.string().optional(),
  risk_level: z.string().optional(),
});

type MissingReportFormValues = z.infer<typeof missingReportSchema>;

export default function NewMissingEpisode() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [youngPeople, setYoungPeople] = useState<YoungPerson[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<MissingReportFormValues>({
    resolver: zodResolver(missingReportSchema),
    defaultValues: {
      young_person_id: "",
      missing_from: "",
      last_known_location: "",
      missing_reason: "",
      edt_contact: "",
      notes: "",
      police_notified: false,
      police_reference: "",
      social_worker_notified: false,
      placing_authority_notified: false,
      clothing_description: "",
      distinguishing_features: "",
      known_associates: "",
      likely_destinations: "",
      transport_mode: "",
      risk_level: "",
    }
  });

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) fetchYoungPeople();
  }, [user]);

  const fetchYoungPeople = async () => {
    const { data } = await supabase
      .from("young_people")
      .select("id, first_name, last_name, focus_id")
      .order("last_name");
    if (data) setYoungPeople(data);
  };

  const onSubmit = async (values: MissingReportFormValues) => {
    if (!user) return;
    setSubmitting(true);

    const now = new Date().toISOString();
    
    const { error } = await supabase
      .from("missing_episodes")
      .insert([{
        young_person_id: values.young_person_id,
        missing_from: values.missing_from,
        last_known_location: values.last_known_location || null,
        missing_reason: values.missing_reason || null,
        edt_contact: values.edt_contact || null,
        notes: values.notes || null,
        police_notified: values.police_notified,
        police_reference: values.police_reference || null,
        social_worker_notified: values.social_worker_notified,
        social_worker_notified_at: values.social_worker_notified ? now : null,
        placing_authority_notified: values.placing_authority_notified,
        placing_authority_notified_at: values.placing_authority_notified ? now : null,
        clothing_description: values.clothing_description || null,
        distinguishing_features: values.distinguishing_features || null,
        known_associates: values.known_associates || null,
        likely_destinations: values.likely_destinations || null,
        transport_mode: values.transport_mode || null,
        risk_level: values.risk_level || "unknown",
        status: MISSING_EPISODE_STATUSES.MISSING,
        reported_by: user.id,
      }]);

    if (error) {
      toast({ title: "Error", description: "Failed to report missing episode.", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Missing episode reported successfully" });
      navigate("/missing-episodes");
    }
    setSubmitting(false);
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <ModuleHeader />
      <div className="container py-8 px-4 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate("/missing-episodes")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Missing Episodes
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Report Missing Episode</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Core fields */}
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="young_person_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Young Person *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select young person" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {youngPeople.map((yp) => (
                              <SelectItem key={yp.id} value={yp.id}>
                                {yp.first_name} {yp.last_name} {yp.focus_id && `(${yp.focus_id})`}
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
                    name="missing_from"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date/Time Missing *</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="last_known_location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Known Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Near town centre" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="missing_reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason for Going Missing *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="argument">Argument / Family Conflict</SelectItem>
                            <SelectItem value="not_returning">Not Returning to Placement</SelectItem>
                            <SelectItem value="friends_family">Going to Friends/Family</SelectItem>
                            <SelectItem value="exploitation">Possible Exploitation Concern</SelectItem>
                            <SelectItem value="substance">Substance Misuse Episode</SelectItem>
                            <SelectItem value="mental_health">Mental Health / Emotional Distress</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="edt_contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>EDT Contact Details</FormLabel>
                        <FormControl>
                          <Textarea placeholder="EDT team name, contact number, notes..." className="min-h-[80px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Incident details */}
                <div className="border-t pt-6">
                  <IncidentDetailsForm form={form} />
                </div>

                {/* Notifications */}
                <div className="border-t pt-6">
                  <NotificationChecklist form={form} />
                </div>

                {/* Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional details..." rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting ? "Reporting..." : "Report Missing Episode"}
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
