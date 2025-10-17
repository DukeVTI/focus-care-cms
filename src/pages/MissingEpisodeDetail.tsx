import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/untypedClient";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ArrowLeft, MapPin, Calendar, Clock, AlertTriangle } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { format, differenceInHours, differenceInMinutes } from "date-fns";

const missingEpisodeSchema = z.object({
  missing_from: z.string().min(1, "Missing date/time is required"),
  returned_at: z.string().optional(),
  last_known_location: z.string().trim().max(500, "Location must be less than 500 characters").optional(),
  missing_reason: z.string().optional(),
  outcome: z.string().optional(),
  notes: z.string().trim().max(800, "Notes must be less than 800 characters").optional(),
  police_notified: z.boolean().default(false),
  police_reference: z.string().trim().max(100, "Police reference must be less than 100 characters").optional(),
});

type MissingEpisodeFormValues = z.infer<typeof missingEpisodeSchema>;

export default function MissingEpisodeDetail() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [episode, setEpisode] = useState<any>(null);
  const [youngPerson, setYoungPerson] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<MissingEpisodeFormValues>({
    resolver: zodResolver(missingEpisodeSchema)
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
        description: "Failed to load missing episode",
        variant: "destructive"
      });
      navigate("/missing-episodes");
      return;
    }

    if (data) {
      setEpisode(data);
      setYoungPerson(data.young_people);
      form.reset({
        missing_from: data.missing_from ? format(new Date(data.missing_from), "yyyy-MM-dd'T'HH:mm") : "",
        returned_at: data.returned_at ? format(new Date(data.returned_at), "yyyy-MM-dd'T'HH:mm") : "",
        last_known_location: data.last_known_location || "",
        missing_reason: data.missing_reason || "",
        outcome: data.outcome || "",
        notes: data.notes || "",
        police_notified: data.police_notified || false,
        police_reference: data.police_reference || "",
      });
    }
  };

  const onSubmit = async (values: MissingEpisodeFormValues) => {
    setSubmitting(true);
    const status = values.returned_at ? "returned" : "missing";
    
    const { error } = await supabase
      .from("missing_episodes")
      .update({
        missing_from: values.missing_from,
        returned_at: values.returned_at || null,
        last_known_location: values.last_known_location || null,
        missing_reason: values.missing_reason || null,
        outcome: values.outcome || null,
        notes: values.notes || null,
        police_notified: values.police_notified,
        police_reference: values.police_reference || null,
        status: status,
      })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update missing episode",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Missing episode updated successfully"
      });
      setIsEditing(false);
      fetchEpisode();
    }
    setSubmitting(false);
  };

  if (loading || !episode) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "missing": return "destructive";
      case "returned": return "secondary";
      case "found": return "secondary";
      default: return "secondary";
    }
  };

  const calculateDuration = () => {
    if (!episode.missing_from) return null;
    const missingDate = new Date(episode.missing_from);
    const returnDate = episode.returned_at ? new Date(episode.returned_at) : new Date();
    const hours = differenceInHours(returnDate, missingDate);
    const minutes = differenceInMinutes(returnDate, missingDate) % 60;
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days} day${days > 1 ? 's' : ''} ${remainingHours}h ${minutes}m`;
    }
    return `${hours}h ${minutes}m`;
  };

  const formatReason = (reason: string) => {
    return reason?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Not specified';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <ModuleHeader />
      <div className="container py-8 px-4 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/missing-episodes")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Missing Episodes
        </Button>

        <div className="space-y-6">
          {/* Header Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant={getStatusColor(episode.status) as any}>
                      {episode.status.charAt(0).toUpperCase() + episode.status.slice(1)}
                    </Badge>
                    {episode.police_notified && (
                      <Badge variant="outline">Police Notified</Badge>
                    )}
                  </div>
                  <CardTitle className="text-2xl mb-2">
                    {youngPerson?.first_name} {youngPerson?.last_name}
                    {youngPerson?.focus_id && ` (${youngPerson.focus_id})`}
                  </CardTitle>
                  <CardDescription className="space-y-2 text-base">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Missing from: {format(new Date(episode.missing_from), "PPP p")}
                    </div>
                    {episode.returned_at && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Returned: {format(new Date(episode.returned_at), "PPP p")}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Duration: {calculateDuration()}
                    </div>
                  </CardDescription>
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

          {/* Details or Edit Form */}
          {isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle>Edit Missing Episode</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      name="returned_at"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date/Time Returned (Optional)</FormLabel>
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
                            <Input {...field} />
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
                                <SelectValue />
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
                      name="outcome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Outcome</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
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
                              <Input {...field} />
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
                          <FormLabel>Notes/Description</FormLabel>
                          <FormControl>
                            <Textarea rows={4} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-4">
                      <Button type="submit" disabled={submitting} className="flex-1">
                        {submitting ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            <>
              {episode.last_known_location && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Last Known Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{episode.last_known_location}</p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Episode Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Reason</p>
                    <p className="font-medium">{formatReason(episode.missing_reason)}</p>
                  </div>
                  {episode.outcome && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Outcome</p>
                      <p className="font-medium">{formatReason(episode.outcome)}</p>
                    </div>
                  )}
                  {episode.police_reference && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Police Reference</p>
                      <p className="font-medium">{episode.police_reference}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {episode.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{episode.notes}</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
