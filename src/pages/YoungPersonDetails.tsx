import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/untypedClient";
import { ModuleHeader } from "@/components/ModuleHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Calendar, MapPin, Phone, Mail, Heart, GraduationCap, AlertTriangle, Globe, Edit } from "lucide-react";
import { format } from "date-fns";
import { RecentSessionsWidget } from "@/components/young-people/RecentSessionsWidget";
import { RiskLevelWidget } from "@/components/young-people/RiskLevelWidget";
import { RiskTrendWidget } from "@/components/young-people/RiskTrendWidget";
import { ChronologyWidget } from "@/components/young-people/ChronologyWidget";
import { MissingEpisodesWidget } from "@/components/young-people/MissingEpisodesWidget";
import { SafeguardingRisksWidget } from "@/components/young-people/SafeguardingRisksWidget";
import { TasksWidget } from "@/components/young-people/TasksWidget";
import { MissingPersonGrabPackButton } from "@/components/young-people/MissingPersonGrabPackButton";
import { KeyContactsWidget } from "@/components/young-people/KeyContactsWidget";

export default function YoungPersonDetails() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [youngPerson, setYoungPerson] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchYoungPerson();
    }
  }, [user, id]);

  const fetchYoungPerson = async () => {
    setLoadingData(true);
    const { data, error } = await supabase
      .from("young_people")
      .select("*")
      .eq("id", id)
      .single();
    
    if (!error && data) {
      setYoungPerson(data);
    }
    setLoadingData(false);
  };

  if (loading || loadingData) {
    return null;
  }

  if (!youngPerson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
        <ModuleHeader />
        <div className="container py-8 px-4">
          <Card className="text-center py-12">
            <CardContent className="pt-6">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Young person not found</h3>
              <Button onClick={() => navigate("/young-people")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Young People
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <ModuleHeader />
      <div className="container py-8 px-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/young-people")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Young People
        </Button>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-semibold text-2xl">
                  {youngPerson.first_name[0]}{youngPerson.last_name[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-2xl mb-2">
                      {youngPerson.first_name} {youngPerson.last_name}
                    </CardTitle>
                    <div className="flex gap-2">
                      <MissingPersonGrabPackButton youngPersonId={youngPerson.id} />
                      <Button onClick={() => navigate(`/young-people/${id}/edit`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {youngPerson.preferred_name && (
                      <p className="text-muted-foreground">Preferred name: {youngPerson.preferred_name}</p>
                    )}
                    {youngPerson.focus_id && (
                      <p className="text-sm font-mono text-muted-foreground">ID: {youngPerson.focus_id}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Date of Birth</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(youngPerson.date_of_birth), "PPP")} (Age {youngPerson.age})
                    </p>
                  </div>
                </div>
                {youngPerson.gender && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Gender</p>
                      <p className="text-sm text-muted-foreground">{youngPerson.gender}</p>
                    </div>
                  </div>
                )}
                {youngPerson.pronouns && (
                  <div>
                    <p className="text-sm font-medium">Pronouns</p>
                    <p className="text-sm text-muted-foreground">{youngPerson.pronouns}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Risk Assessment Widgets */}
          <div className="grid gap-6 md:grid-cols-2">
            <RiskLevelWidget youngPersonId={youngPerson.id} />
            <RiskTrendWidget youngPersonId={youngPerson.id} />
          </div>

          {/* Recent Keywork Sessions */}
          <RecentSessionsWidget youngPersonId={youngPerson.id} />

          {/* Recent Chronology */}
          <ChronologyWidget youngPersonId={youngPerson.id} />

          {/* Missing Episodes */}
          <MissingEpisodesWidget youngPersonId={youngPerson.id} />

          {/* Key Contacts */}
          <KeyContactsWidget youngPersonId={youngPerson.id} />

          {/* Safeguarding & Risks */}
          <SafeguardingRisksWidget youngPersonId={youngPerson.id} />

          {/* Outstanding Tasks */}
          <TasksWidget youngPersonId={youngPerson.id} />

          {/* Placement Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Placement Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {youngPerson.placement_type && (
                  <div>
                    <p className="text-sm font-medium">Placement Type</p>
                    <p className="text-sm text-muted-foreground capitalize">{youngPerson.placement_type}</p>
                  </div>
                )}
                {youngPerson.placement_start_date && (
                  <div>
                    <p className="text-sm font-medium">Placement Start Date</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(youngPerson.placement_start_date), "PPP")}
                    </p>
                  </div>
                 )}
               </div>
               {(youngPerson.placement_address || youngPerson.placement_road_name || youngPerson.placement_postcode) && (
                 <div className="pt-4 border-t">
                   <p className="text-sm font-semibold mb-3">Placement Details</p>
                   <div className="grid gap-4 md:grid-cols-2">
                     {youngPerson.placement_address && (
                       <div className="md:col-span-2">
                         <p className="text-sm font-medium">Address</p>
                         <p className="text-sm text-muted-foreground whitespace-pre-wrap">{youngPerson.placement_address}</p>
                       </div>
                     )}
                     {youngPerson.placement_road_name && (
                       <div>
                         <p className="text-sm font-medium">Road Name</p>
                         <p className="text-sm text-muted-foreground">{youngPerson.placement_road_name}</p>
                       </div>
                     )}
                     {youngPerson.placement_postcode && (
                       <div>
                         <p className="text-sm font-medium">Postcode</p>
                         <p className="text-sm text-muted-foreground uppercase">{youngPerson.placement_postcode}</p>
                       </div>
                     )}
                   </div>
                 </div>
               )}
               {(youngPerson.placing_authority || youngPerson.residing_local_authority || youngPerson.previous_placement || youngPerson.reason_for_placement) && (
                 <div className="pt-4 border-t">
                   <p className="text-sm font-semibold mb-3">Authority & Placement History</p>
                   <div className="grid gap-4 md:grid-cols-2">
                     {youngPerson.placing_authority && (
                       <div>
                         <p className="text-sm font-medium">Placing Authority</p>
                         <p className="text-sm text-muted-foreground capitalize">{youngPerson.placing_authority.replace('-', ' ')}</p>
                       </div>
                     )}
                     {youngPerson.residing_local_authority && (
                       <div>
                         <p className="text-sm font-medium">Residing Local Authority</p>
                         <p className="text-sm text-muted-foreground">{youngPerson.residing_local_authority}</p>
                       </div>
                     )}
                     {youngPerson.previous_placement && (
                       <div>
                         <p className="text-sm font-medium">Previous Placement</p>
                         <p className="text-sm text-muted-foreground">{youngPerson.previous_placement}</p>
                       </div>
                     )}
                     {youngPerson.reason_for_placement && (
                       <div>
                         <p className="text-sm font-medium">Reason for Placement</p>
                         <p className="text-sm text-muted-foreground capitalize">{youngPerson.reason_for_placement.replace('-', ' ')}</p>
                       </div>
                     )}
                   </div>
                 </div>
               )}
               {youngPerson.placement_info && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium">Additional Details</p>
                  <p className="text-sm text-muted-foreground">{youngPerson.placement_info}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Legal & Care Status */}
          <Card>
            <CardHeader>
              <CardTitle>Legal & Care Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {youngPerson.legal_status && (
                  <div>
                    <p className="text-sm font-medium">Legal Status</p>
                    <p className="text-sm text-muted-foreground capitalize">{youngPerson.legal_status.replace('-', ' ')}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">Looked After Child</p>
                  <p className="text-sm text-muted-foreground">{youngPerson.looked_after_child ? 'Yes' : 'No'}</p>
                </div>
                {youngPerson.iro_name && (
                  <div>
                    <p className="text-sm font-medium">IRO Name</p>
                    <p className="text-sm text-muted-foreground">{youngPerson.iro_name}</p>
                  </div>
                )}
                {youngPerson.next_lac_review_date && (
                  <div>
                    <p className="text-sm font-medium">Next LAC Review</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(youngPerson.next_lac_review_date), "PPP")}
                    </p>
                  </div>
                )}
                {youngPerson.court_orders && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium">Court Orders</p>
                    <p className="text-sm text-muted-foreground">{youngPerson.court_orders}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Key Contacts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Key Contacts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {youngPerson.social_worker_name && (
                  <div>
                    <p className="text-sm font-medium">Social Worker</p>
                    <p className="text-sm text-muted-foreground">{youngPerson.social_worker_name}</p>
                    {youngPerson.social_worker_email && (
                      <div className="flex items-center gap-1 mt-1">
                        <Mail className="h-3 w-3" />
                        <p className="text-xs text-muted-foreground">{youngPerson.social_worker_email}</p>
                      </div>
                    )}
                    {youngPerson.social_worker_phone && (
                      <div className="flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3" />
                        <p className="text-xs text-muted-foreground">{youngPerson.social_worker_phone}</p>
                      </div>
                    )}
                  </div>
                )}
                {youngPerson.gp_practice && (
                  <div>
                    <p className="text-sm font-medium">GP Practice</p>
                    <p className="text-sm text-muted-foreground">{youngPerson.gp_practice}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Health & Wellbeing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Health & Wellbeing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {youngPerson.medical_conditions && youngPerson.medical_conditions.length > 0 && (
                  <div>
                    <p className="text-sm font-medium">Medical Conditions</p>
                    <p className="text-sm text-muted-foreground">{youngPerson.medical_conditions.join(', ')}</p>
                  </div>
                )}
                {youngPerson.allergies && youngPerson.allergies.length > 0 && (
                  <div>
                    <p className="text-sm font-medium">Allergies</p>
                    <p className="text-sm text-muted-foreground">{youngPerson.allergies.join(', ')}</p>
                  </div>
                )}
                {youngPerson.disability_needs && youngPerson.disability_needs.length > 0 && (
                  <div>
                    <p className="text-sm font-medium">Disability Needs</p>
                    <p className="text-sm text-muted-foreground">{youngPerson.disability_needs.join(', ')}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">Mental Health Support</p>
                  <p className="text-sm text-muted-foreground">{youngPerson.mental_health_support ? 'Yes' : 'No'}</p>
                </div>
                {youngPerson.mental_health_service && (
                  <div>
                    <p className="text-sm font-medium">Mental Health Service</p>
                    <p className="text-sm text-muted-foreground">{youngPerson.mental_health_service}</p>
                  </div>
                )}
                {youngPerson.mental_health_worker && (
                  <div>
                    <p className="text-sm font-medium">Mental Health Worker</p>
                    <p className="text-sm text-muted-foreground">{youngPerson.mental_health_worker}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          {(youngPerson.school_college || youngPerson.education_setting || youngPerson.year_group) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {youngPerson.school_college && (
                    <div>
                      <p className="text-sm font-medium">School/College</p>
                      <p className="text-sm text-muted-foreground">{youngPerson.school_college}</p>
                    </div>
                  )}
                  {youngPerson.education_setting && (
                    <div>
                      <p className="text-sm font-medium">Education Setting</p>
                      <p className="text-sm text-muted-foreground">{youngPerson.education_setting}</p>
                    </div>
                  )}
                  {youngPerson.year_group && (
                    <div>
                      <p className="text-sm font-medium">Year Group</p>
                      <p className="text-sm text-muted-foreground">{youngPerson.year_group}</p>
                    </div>
                  )}
                  {youngPerson.ehcp_status && (
                    <div>
                      <p className="text-sm font-medium">EHCP Status</p>
                      <p className="text-sm text-muted-foreground capitalize">{youngPerson.ehcp_status}</p>
                    </div>
                  )}
                  {youngPerson.attendance_concerns && youngPerson.attendance_description && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium">Attendance Concerns</p>
                      <p className="text-sm text-muted-foreground">{youngPerson.attendance_description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Safeguarding & Risk */}
          {(youngPerson.known_risks || youngPerson.initial_risk_summary) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Safeguarding & Risk
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {youngPerson.known_risks && youngPerson.known_risks.length > 0 && (
                  <div>
                    <p className="text-sm font-medium">Known Risks</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {youngPerson.known_risks.map((risk: string) => (
                        <span key={risk} className="px-2 py-1 bg-destructive/10 text-destructive rounded text-xs uppercase">
                          {risk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {youngPerson.initial_risk_summary && (
                  <div>
                    <p className="text-sm font-medium">Risk Summary</p>
                    <p className="text-sm text-muted-foreground">{youngPerson.initial_risk_summary}</p>
                  </div>
                )}
                {youngPerson.triggers && (
                  <div>
                    <p className="text-sm font-medium">Triggers</p>
                    <p className="text-sm text-muted-foreground">{youngPerson.triggers}</p>
                  </div>
                )}
                {youngPerson.protective_factors && (
                  <div>
                    <p className="text-sm font-medium">Protective Factors</p>
                    <p className="text-sm text-muted-foreground">{youngPerson.protective_factors}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Culture & Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Culture & Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {youngPerson.ethnicity && (
                  <div>
                    <p className="text-sm font-medium">Ethnicity</p>
                    <p className="text-sm text-muted-foreground">{youngPerson.ethnicity}</p>
                  </div>
                )}
                {youngPerson.nationality && (
                  <div>
                    <p className="text-sm font-medium">Nationality</p>
                    <p className="text-sm text-muted-foreground">{youngPerson.nationality}</p>
                  </div>
                )}
                {youngPerson.primary_language && (
                  <div>
                    <p className="text-sm font-medium">Primary Language</p>
                    <p className="text-sm text-muted-foreground">{youngPerson.primary_language}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">Interpreter Required</p>
                  <p className="text-sm text-muted-foreground">{youngPerson.interpreter_required ? 'Yes' : 'No'}</p>
                </div>
                {youngPerson.religion && (
                  <div>
                    <p className="text-sm font-medium">Religion</p>
                    <p className="text-sm text-muted-foreground">{youngPerson.religion}</p>
                  </div>
                )}
                {youngPerson.dietary_requirements && youngPerson.dietary_requirements.length > 0 && (
                  <div>
                    <p className="text-sm font-medium">Dietary Requirements</p>
                    <p className="text-sm text-muted-foreground">{youngPerson.dietary_requirements.join(', ')}</p>
                  </div>
                )}
                {youngPerson.activities_interests && youngPerson.activities_interests.length > 0 && (
                  <div>
                    <p className="text-sm font-medium">Activities & Interests</p>
                    <p className="text-sm text-muted-foreground">{youngPerson.activities_interests.join(', ')}</p>
                  </div>
                )}
                {youngPerson.communication_preferences && youngPerson.communication_preferences.length > 0 && (
                  <div>
                    <p className="text-sm font-medium">Communication Preferences</p>
                    <p className="text-sm text-muted-foreground">{youngPerson.communication_preferences.join(', ')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {youngPerson.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{youngPerson.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
