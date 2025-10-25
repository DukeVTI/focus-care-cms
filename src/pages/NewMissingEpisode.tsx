import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/untypedClient";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const missingReportSchema = z.object({
  young_person_id: z.string().min(1, "Please select a young person"),
  missing_from: z.string().min(1, "Missing date/time is required"),
  last_known_location: z.string().trim().max(500, "Location must be less than 500 characters").optional(),
  missing_reason: z.string().optional(),
  notes: z.string().trim().max(800, "Notes must be less than 800 characters").optional(),
  police_notified: z.boolean().default(false),
  police_reference: z.string().trim().max(100, "Police reference must be less than 100 characters").optional(),
});

type MissingReportFormValues = z.infer<typeof missingReportSchema>;

export default function NewMissingEpisode() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [youngPeople, setYoungPeople] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<MissingReportFormValues>({
    resolver: zodResolver(missingReportSchema),
    defaultValues: {
      young_person_id: "",
      missing_from: "",
      last_known_location: "",
      missing_reason: "",
      notes: "",
      police_notified: false,
      police_reference: "",
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
      .select("id, first_name, last_name, focus_id")
      .order("last_name");
    
    if (data) {
      setYoungPeople(data);
    }
  };

  const onSubmit = async (values: MissingReportFormValues) => {
    if (!user) return;
    
    setSubmitting(true);
    
    const { error } = await supabase
      .from("missing_episodes")
      .insert([{
        young_person_id: values.young_person_id,
        missing_from: values.missing_from,
        last_known_location: values.last_known_location || null,
        missing_reason: values.missing_reason || null,
        notes: values.notes || null,
        police_notified: values.police_notified,
        police_reference: values.police_reference || null,
        status: "missing",
        reported_by: user.id
      }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to report missing episode. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Missing episode reported successfully"
      });
      navigate("/missing-episodes");
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
          onClick={() => navigate("/missing-episodes")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Missing Episodes
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Report Missing Episode</CardTitle>
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
                      <FormLabel>Date/Time Missing</FormLabel>
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
                      <FormLabel>Reason</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select reason" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="absent_without_leave">Absent Without Leave</SelectItem>
                          <SelectItem value="family_contact">Family Contact</SelectItem>
                          <SelectItem value="peer_influence">Peer Influence</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="police_notified"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Police Notified</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch("police_notified") && (
                  <FormField
                    control={form.control}
                    name="police_reference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Police Reference Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., URN123456" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes/Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional details about the missing episode..."
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
                    {submitting ? "Reporting..." : "Report Missing Episode"}
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
