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
import { supabase } from "@/integrations/supabase/client";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ArrowLeft, MapPin, Calendar, Clock, UserCheck, Shirt, Users, Navigation } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { format, differenceInHours, differenceInMinutes } from "date-fns";
import { EpisodeTimeline } from "@/components/missing-episodes/EpisodeTimeline";
import { EscalationBadge } from "@/components/missing-episodes/EscalationBadge";
import { ManagerApprovalSection } from "@/components/missing-episodes/ManagerApprovalSection";
import { MISSING_EPISODE_STATUSES, MISSING_EPISODE_STATUS_COLORS } from "@/lib/constants";
import { MissingEpisodeDetail as MissingEpisodeDetailType, YoungPerson, BadgeVariant } from "@/lib/types";

const missingEpisodeSchema = z.object({
  missing_from: z.string().min(1, "Missing date/time is required"),
  returned_at: z.string().optional(),
  last_known_location: z.string().trim().max(500).optional(),
  missing_reason: z.string().optional(),
  outcome: z.string().optional(),
  notes: z.string().trim().max(800).optional(),
  police_notified: z.boolean().default(false),
  police_reference: z.string().trim().max(100).optional(),
});

type MissingEpisodeFormValues = z.infer<typeof missingEpisodeSchema>;

export default function MissingEpisodeDetail() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [episode, setEpisode] = useState<MissingEpisodeDetailType | null>(null);
  const [youngPerson, setYoungPerson] = useState<YoungPerson | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<MissingEpisodeFormValues>({
    resolver: zodResolver(missingEpisodeSchema)
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
      .select(`*, young_people:young_person_id (id, first_name, last_name, focus_id)`)
      .eq("id", id)
      .single();

    if (error) {
      toast({ title: "Error", description: "Failed to load missing episode", variant: "destructive" });
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
    const status = values.returned_at ? MISSING_EPISODE_STATUSES.RETURNED : MISSING_EPISODE_STATUSES.MISSING;
    
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
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Updated successfully" });
      setIsEditing(false);
      fetchEpisode();
    }
    setSubmitting(false);
  };

  if (loading || !episode) return null;

  const getStatusColor = (status: string): BadgeVariant => {
    return MISSING_EPISODE_STATUS_COLORS[status as keyof typeof MISSING_EPISODE_STATUS_COLORS] || "secondary";
  };

  const calculateDuration = () => {
    if (!episode.missing_from) return null;
    const start = new Date(episode.missing_from);
    const end = episode.returned_at ? new Date(episode.returned_at) : new Date();
    const hours = differenceInHours(end, start);
    const minutes = differenceInMinutes(end, start) % 60;
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? "s" : ""} ${hours % 24}h ${minutes}m`;
    }
    return `${hours}h ${minutes}m`;
  };

  const formatReason = (reason: string) => {
    const map: Record<string, string> = {
      argument: "Argument / Family Conflict",
      not_returning: "Not Returning to Placement",
      friends_family: "Going to Friends/Family",
      exploitation: "Possible Exploitation Concern",
      substance: "Substance Misuse Episode",
      mental_health: "Mental Health / Emotional Distress",
      safe_well: "Returned Safe & Well",
      police_located: "Located by Police",
      family_located: "Located by Family",
      self_returned: "Self-Returned",
      medical_attention: "Required Medical Attention",
      other: "Other",
    };
    return map[reason] || reason?.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()) || "Not specified";
  };

  const formatTransport = (mode: string) => {
    const map: Record<string, string> = {
      on_foot: "On Foot", public_transport: "Public Transport", vehicle: "In a Vehicle",
      bicycle: "Bicycle", unknown: "Unknown",
    };
    return map[mode] || mode;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <ModuleHeader />
      <div className="container py-8 px-4 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate("/missing-episodes")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Missing Episodes
        </Button>

        <div className="space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <Badge variant={getStatusColor(episode.status)}>
                      {episode.status.charAt(0).toUpperCase() + episode.status.slice(1)}
                    </Badge>
                    <EscalationBadge missingFrom={episode.missing_from} status={episode.status} />
                    {episode.risk_level && episode.risk_level !== "unknown" && (
                      <Badge variant={episode.risk_level === "critical" || episode.risk_level === "high" ? "destructive" : "outline"}>
                        {episode.risk_level.charAt(0).toUpperCase() + episode.risk_level.slice(1)} Risk
                      </Badge>
                    )}
                    {episode.police_notified && <Badge variant="outline">Police Notified</Badge>}
                    {episode.social_worker_notified && <Badge variant="outline">SW Notified</Badge>}
                    {episode.placing_authority_notified && <Badge variant="outline">PA Notified</Badge>}
                  </div>
                  <CardTitle className="text-2xl mb-2">
                    {youngPerson?.first_name} {youngPerson?.last_name}
                    {youngPerson?.focus_id && ` (${youngPerson.focus_id})`}
                  </CardTitle>
                  {episode.case_id && (
                    <p className="text-sm font-mono text-muted-foreground mb-2">Case: {episode.case_id}</p>
                  )}
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
                  {episode.status?.toLowerCase() === MISSING_EPISODE_STATUSES.MISSING.toLowerCase() && (
                    <Button onClick={() => navigate(`/missing-episodes/${id}/report-return`)} size="sm">
                      <UserCheck className="h-4 w-4 mr-2" /> Report Return
                    </Button>
                  )}
                  {!isEditing && (
                    <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">Edit</Button>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Episode Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <EpisodeTimeline episode={episode} />
            </CardContent>
          </Card>

          {isEditing ? (
            <Card>
              <CardHeader><CardTitle>Edit Missing Episode</CardTitle></CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField control={form.control} name="missing_from" render={({ field }) => (
                      <FormItem><FormLabel>Date/Time Missing</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="returned_at" render={({ field }) => (
                      <FormItem><FormLabel>Date/Time Returned</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="last_known_location" render={({ field }) => (
                      <FormItem><FormLabel>Last Known Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="missing_reason" render={({ field }) => (
                      <FormItem><FormLabel>Reason</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="argument">Argument / Family Conflict</SelectItem>
                            <SelectItem value="not_returning">Not Returning to Placement</SelectItem>
                            <SelectItem value="friends_family">Going to Friends/Family</SelectItem>
                            <SelectItem value="exploitation">Possible Exploitation Concern</SelectItem>
                            <SelectItem value="substance">Substance Misuse Episode</SelectItem>
                            <SelectItem value="mental_health">Mental Health / Emotional Distress</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select><FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="outcome" render={({ field }) => (
                      <FormItem><FormLabel>Outcome</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="safe_well">Returned Safe & Well</SelectItem>
                            <SelectItem value="police_located">Located by Police</SelectItem>
                            <SelectItem value="self_returned">Self-Returned</SelectItem>
                            <SelectItem value="medical_attention">Required Medical Attention</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select><FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="police_notified" render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        <div className="leading-none"><FormLabel>Police Notified</FormLabel></div>
                      </FormItem>
                    )} />
                    {form.watch("police_notified") && (
                      <FormField control={form.control} name="police_reference" render={({ field }) => (
                        <FormItem><FormLabel>Police Reference</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    )}
                    <FormField control={form.control} name="notes" render={({ field }) => (
                      <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea rows={4} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="flex gap-4">
                      <Button type="submit" disabled={submitting} className="flex-1">{submitting ? "Saving..." : "Save Changes"}</Button>
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="flex-1">Cancel</Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Incident Details */}
              {(episode.clothing_description || episode.distinguishing_features || episode.known_associates || episode.likely_destinations || episode.transport_mode) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Incident Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {episode.clothing_description && (
                      <div className="flex gap-3">
                        <Shirt className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Clothing</p>
                          <p className="text-sm">{episode.clothing_description}</p>
                        </div>
                      </div>
                    )}
                    {episode.distinguishing_features && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Distinguishing Features</p>
                        <p className="text-sm">{episode.distinguishing_features}</p>
                      </div>
                    )}
                    {episode.known_associates && (
                      <div className="flex gap-3">
                        <Users className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Known Associates</p>
                          <p className="text-sm">{episode.known_associates}</p>
                        </div>
                      </div>
                    )}
                    {episode.likely_destinations && (
                      <div className="flex gap-3">
                        <Navigation className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Likely Destinations</p>
                          <p className="text-sm">{episode.likely_destinations}</p>
                        </div>
                      </div>
                    )}
                    {episode.transport_mode && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Mode of Transport</p>
                        <p className="text-sm">{formatTransport(episode.transport_mode)}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {episode.last_known_location && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5" /> Last Known Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent><p>{episode.last_known_location}</p></CardContent>
                </Card>
              )}

              <Card>
                <CardHeader><CardTitle className="text-lg">Episode Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {episode.case_id && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Case ID</p>
                      <p className="font-medium font-mono">{episode.case_id}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Reason for Going Missing</p>
                    <p className="font-medium">{formatReason(episode.missing_reason)}</p>
                  </div>
                  {episode.edt_contact && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">EDT Contact Details</p>
                      <p className="font-medium whitespace-pre-wrap">{episode.edt_contact}</p>
                    </div>
                  )}
                  {episode.police_reference && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Police Reference</p>
                      <p className="font-medium">{episode.police_reference}</p>
                    </div>
                  )}

                  {episode.status?.toLowerCase() === MISSING_EPISODE_STATUSES.RETURNED.toLowerCase() && (
                    <>
                      <div className="border-t pt-4 mt-4">
                        <p className="text-sm font-semibold mb-3">Return Information</p>
                      </div>
                      {episode.found_by && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Found By</p>
                          <p className="font-medium capitalize">{episode.found_by.replace(/-/g, " ")}</p>
                        </div>
                      )}
                      {episode.found_location && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Location Found</p>
                          <p className="font-medium">{episode.found_location}</p>
                        </div>
                      )}
                      {episode.return_reason && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">YP's Explanation</p>
                          <p className="font-medium whitespace-pre-wrap">{episode.return_reason}</p>
                        </div>
                      )}
                      {episode.risks_encountered && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Risks Encountered</p>
                          <p className="font-medium whitespace-pre-wrap">{episode.risks_encountered}</p>
                        </div>
                      )}
                      {episode.follow_up_actions && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Follow-up Actions</p>
                          <p className="font-medium whitespace-pre-wrap">{episode.follow_up_actions}</p>
                        </div>
                      )}
                      {episode.outcome && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Outcome</p>
                          <p className="font-medium">{formatReason(episode.outcome)}</p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {episode.notes && (
                <Card>
                  <CardHeader><CardTitle className="text-lg">Notes</CardTitle></CardHeader>
                  <CardContent><p className="whitespace-pre-wrap">{episode.notes}</p></CardContent>
                </Card>
              )}

              {/* Manager approval & return interview */}
              {episode.status?.toLowerCase() === MISSING_EPISODE_STATUSES.RETURNED.toLowerCase() && user && (
                <ManagerApprovalSection episode={episode} userId={user.id} onUpdate={fetchEpisode} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
