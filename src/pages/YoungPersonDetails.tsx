import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/untypedClient";
import { ModuleHeader } from "@/components/ModuleHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, User, Calendar, MapPin, Phone, Mail, Heart, GraduationCap, AlertTriangle, Globe, Edit, FileText, Activity, Shield, Fingerprint, Pencil } from "lucide-react";
import { format } from "date-fns";
import { RecentSessionsWidget } from "@/components/young-people/RecentSessionsWidget";
import { RiskLevelWidget } from "@/components/young-people/RiskLevelWidget";
import { RiskTrendWidget } from "@/components/young-people/RiskTrendWidget";
import { ChronologyWidget } from "@/components/young-people/ChronologyWidget";
import { MissingEpisodesWidget } from "@/components/young-people/MissingEpisodesWidget";
import { SafeguardingRisksWidget } from "@/components/young-people/SafeguardingRisksWidget";
import { TasksWidget } from "@/components/young-people/TasksWidget";
import { MissingPersonGrabPackButton } from "@/components/young-people/MissingPersonGrabPackButton";
import { MonthlyReportButton } from "@/components/young-people/MonthlyReportButton";
import { KeyContactsWidget } from "@/components/young-people/KeyContactsWidget";
import { DocumentsWidget } from "@/components/young-people/DocumentsWidget";
import { InlineEditDialog } from "@/components/young-people/InlineEditDialog";

export default function YoungPersonDetails() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [youngPerson, setYoungPerson] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [editSection, setEditSection] = useState<"social_media" | "structured_ids" | "associated_areas" | null>(null);

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
      <div className="container py-6 px-4 max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/young-people")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Young People
        </Button>

        {/* Header Section */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-semibold text-3xl shrink-0">
                {youngPerson.first_name[0]}{youngPerson.last_name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-1">
                      {youngPerson.first_name} {youngPerson.last_name}
                    </h1>
                    {youngPerson.preferred_name && (
                      <p className="text-muted-foreground mb-1">Preferred: {youngPerson.preferred_name}</p>
                    )}
                    {youngPerson.focus_id && (
                      <p className="text-sm font-mono text-muted-foreground">Focus ID: {youngPerson.focus_id}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <MissingPersonGrabPackButton youngPersonId={youngPerson.id} />
                    <MonthlyReportButton youngPersonId={youngPerson.id} />
                    <Button onClick={() => navigate(`/young-people/${id}/health-wellbeing`)} variant="outline">
                      <Heart className="h-4 w-4 mr-2" />
                      Health & Wellbeing
                    </Button>
                    <Button onClick={() => navigate(`/young-people/${id}/edit`)} variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Date of Birth</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(youngPerson.date_of_birth), "PP")} ({youngPerson.age} years)
                      </p>
                    </div>
                  </div>
                  {youngPerson.gender && (
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Gender</p>
                        <p className="text-sm text-muted-foreground">{youngPerson.gender}</p>
                      </div>
                    </div>
                  )}
                  {youngPerson.pronouns && (
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Pronouns</p>
                        <p className="text-sm text-muted-foreground">{youngPerson.pronouns}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="records" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Records
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Risk Widgets */}
            <div className="grid gap-6 lg:grid-cols-2">
              <RiskLevelWidget youngPersonId={youngPerson.id} />
              <RiskTrendWidget youngPersonId={youngPerson.id} />
            </div>

            {/* Action Items Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              <TasksWidget youngPersonId={youngPerson.id} />
              <SafeguardingRisksWidget youngPersonId={youngPerson.id} />
            </div>

            {/* Quick Info Cards */}
            <div className="grid gap-6 lg:grid-cols-2">
              <KeyContactsWidget youngPersonId={youngPerson.id} />
              <MissingEpisodesWidget youngPersonId={youngPerson.id} />
            </div>

            {/* Documents */}
            <DocumentsWidget youngPersonId={youngPerson.id} />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">

            {/* Placement Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Placement Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  {youngPerson.placement_type && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Placement Type</p>
                      <p className="text-sm capitalize">{youngPerson.placement_type}</p>
                    </div>
                  )}
                  {youngPerson.placement_start_date && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Start Date</p>
                      <p className="text-sm">{format(new Date(youngPerson.placement_start_date), "PPP")}</p>
                    </div>
                  )}
                  {youngPerson.placement_address && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Address</p>
                      <p className="text-sm whitespace-pre-wrap">{youngPerson.placement_address}</p>
                    </div>
                  )}
                  {youngPerson.placement_postcode && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Postcode</p>
                      <p className="text-sm uppercase">{youngPerson.placement_postcode}</p>
                    </div>
                  )}
                  {youngPerson.placing_authority && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Placing Authority</p>
                      <p className="text-sm capitalize">{youngPerson.placing_authority.replace('-', ' ')}</p>
                    </div>
                  )}
                  {youngPerson.residing_local_authority && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Residing Authority</p>
                      <p className="text-sm">{youngPerson.residing_local_authority}</p>
                    </div>
                  )}
                  {youngPerson.previous_placement && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Previous Placement</p>
                      <p className="text-sm">{youngPerson.previous_placement}</p>
                    </div>
                  )}
                  {youngPerson.reason_for_placement && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Reason for Placement</p>
                      <p className="text-sm capitalize">{youngPerson.reason_for_placement.replace('-', ' ')}</p>
                    </div>
                  )}
                  {youngPerson.placement_info && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Additional Details</p>
                      <p className="text-sm">{youngPerson.placement_info}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Legal & Care Status */}
            <Card>
              <CardHeader>
                <CardTitle>Legal & Care Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  {youngPerson.legal_status && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Legal Status</p>
                      <p className="text-sm capitalize">{youngPerson.legal_status.replace('-', ' ')}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Looked After Child</p>
                    <p className="text-sm">{youngPerson.looked_after_child ? 'Yes' : 'No'}</p>
                  </div>
                  {youngPerson.iro_name && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">IRO Name</p>
                      <p className="text-sm">{youngPerson.iro_name}</p>
                    </div>
                  )}
                  {youngPerson.next_lac_review_date && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Next LAC Review</p>
                      <p className="text-sm">{format(new Date(youngPerson.next_lac_review_date), "PPP")}</p>
                    </div>
                  )}
                  {youngPerson.court_orders && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Court Orders</p>
                      <p className="text-sm">{youngPerson.court_orders}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contacts */}
            {(youngPerson.social_worker_name || youngPerson.gp_practice) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Primary Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    {youngPerson.social_worker_name && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Social Worker</p>
                        <p className="text-sm font-medium">{youngPerson.social_worker_name}</p>
                        {youngPerson.social_worker_email && (
                          <div className="flex items-center gap-1.5 mt-2">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">{youngPerson.social_worker_email}</p>
                          </div>
                        )}
                        {youngPerson.social_worker_phone && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">{youngPerson.social_worker_phone}</p>
                          </div>
                        )}
                      </div>
                    )}
                    {youngPerson.gp_practice && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">GP Practice</p>
                        <p className="text-sm">{youngPerson.gp_practice}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Health & Wellbeing */}
            {(youngPerson.medical_conditions?.length > 0 || youngPerson.allergies?.length > 0 || youngPerson.disability_needs?.length > 0 || youngPerson.mental_health_support) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Health & Wellbeing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    {youngPerson.medical_conditions && youngPerson.medical_conditions.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Medical Conditions</p>
                        <p className="text-sm">{youngPerson.medical_conditions.join(', ')}</p>
                      </div>
                    )}
                    {youngPerson.allergies && youngPerson.allergies.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Allergies</p>
                        <p className="text-sm">{youngPerson.allergies.join(', ')}</p>
                      </div>
                    )}
                    {youngPerson.disability_needs && youngPerson.disability_needs.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Disability Needs</p>
                        <p className="text-sm">{youngPerson.disability_needs.join(', ')}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Mental Health Support</p>
                      <p className="text-sm">{youngPerson.mental_health_support ? 'Yes' : 'No'}</p>
                    </div>
                    {youngPerson.mental_health_service && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Mental Health Service</p>
                        <p className="text-sm">{youngPerson.mental_health_service}</p>
                      </div>
                    )}
                    {youngPerson.mental_health_worker && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Mental Health Worker</p>
                        <p className="text-sm">{youngPerson.mental_health_worker}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Education */}
            {(youngPerson.school_college || youngPerson.education_setting || youngPerson.year_group) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    {youngPerson.school_college && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">School/College</p>
                        <p className="text-sm">{youngPerson.school_college}</p>
                      </div>
                    )}
                    {youngPerson.education_setting && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Education Setting</p>
                        <p className="text-sm">{youngPerson.education_setting}</p>
                      </div>
                    )}
                    {youngPerson.year_group && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Year Group</p>
                        <p className="text-sm">{youngPerson.year_group}</p>
                      </div>
                    )}
                    {youngPerson.ehcp_status && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">EHCP Status</p>
                        <p className="text-sm capitalize">{youngPerson.ehcp_status}</p>
                      </div>
                    )}
                    {youngPerson.attendance_concerns && youngPerson.attendance_description && (
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Attendance Concerns</p>
                        <p className="text-sm">{youngPerson.attendance_description}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Safeguarding & Risk */}
            {(youngPerson.known_risks?.length > 0 || youngPerson.initial_risk_summary || youngPerson.triggers || youngPerson.protective_factors || youngPerson.exploitation_categories?.length > 0) && (
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
                      <p className="text-sm font-medium text-muted-foreground mb-2">Known Risks</p>
                      <div className="flex flex-wrap gap-2">
                        {youngPerson.known_risks.map((risk: string) => (
                          <span key={risk} className="px-2.5 py-1 bg-destructive/10 text-destructive rounded-md text-xs font-medium uppercase">
                            {risk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {youngPerson.exploitation_categories && youngPerson.exploitation_categories.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Exploitation Concerns</p>
                      <div className="flex flex-wrap gap-2">
                        {youngPerson.exploitation_categories.map((cat: string) => (
                          <span key={cat} className="px-2.5 py-1 bg-destructive/20 text-destructive rounded-md text-xs font-medium uppercase">
                            {cat.replace(/-/g, ' ')}
                          </span>
                        ))}
                      </div>
                      {youngPerson.exploitation_notes && (
                        <p className="text-sm mt-2">{youngPerson.exploitation_notes}</p>
                      )}
                    </div>
                  )}
                  {youngPerson.initial_risk_summary && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Risk Summary</p>
                      <p className="text-sm">{youngPerson.initial_risk_summary}</p>
                    </div>
                  )}
                  {youngPerson.triggers && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Triggers</p>
                      <p className="text-sm">{youngPerson.triggers}</p>
                    </div>
                  )}
                  {youngPerson.protective_factors && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Protective Factors</p>
                      <p className="text-sm">{youngPerson.protective_factors}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* YOT / Probation */}
            {youngPerson.yot_involved && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    YOT / Probation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    {youngPerson.yot_worker_name && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">YOT Worker</p>
                        <p className="text-sm">{youngPerson.yot_worker_name}</p>
                        {youngPerson.yot_worker_phone && <p className="text-xs text-muted-foreground mt-1">{youngPerson.yot_worker_phone}</p>}
                        {youngPerson.yot_worker_email && <p className="text-xs text-muted-foreground">{youngPerson.yot_worker_email}</p>}
                      </div>
                    )}
                    {youngPerson.probation_order && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Order Type</p>
                        <p className="text-sm capitalize">{youngPerson.probation_order.replace(/-/g, ' ')}</p>
                      </div>
                    )}
                    {youngPerson.probation_end_date && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Order End Date</p>
                        <p className="text-sm">{format(new Date(youngPerson.probation_end_date), "PPP")}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Structured IDs */}
            {youngPerson.structured_ids && youngPerson.structured_ids.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Fingerprint className="h-5 w-5" />
                    Identification Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {youngPerson.structured_ids.map((id: any, i: number) => (
                      <div key={i} className="flex items-center justify-between border rounded-lg p-3">
                        <div>
                          <p className="text-sm font-medium capitalize">{id.type?.replace(/-/g, ' ')}</p>
                          <p className="text-xs text-muted-foreground">{id.value}</p>
                        </div>
                        {id.expiryDate && (
                          <p className="text-xs text-muted-foreground">Exp: {format(new Date(id.expiryDate), "PP")}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Social Media */}
            {youngPerson.social_media_accounts && youngPerson.social_media_accounts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Social Media Accounts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {youngPerson.social_media_accounts.map((acc: any, i: number) => (
                      <div key={i} className="flex items-center justify-between border rounded-lg p-3">
                        <div>
                          <p className="text-sm font-medium capitalize">{acc.platform}</p>
                          <p className="text-xs text-muted-foreground">{acc.handle}</p>
                        </div>
                        {acc.notes && <p className="text-xs text-muted-foreground">{acc.notes}</p>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Associated Areas */}
            {youngPerson.associated_areas && youngPerson.associated_areas.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Associated Areas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {youngPerson.associated_areas.map((area: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 bg-accent text-accent-foreground rounded-md text-xs font-medium">
                        {area}
                      </span>
                    ))}
                  </div>
                  {youngPerson.associated_areas_notes && (
                    <p className="text-sm text-muted-foreground mt-2">{youngPerson.associated_areas_notes}</p>
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
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  {youngPerson.ethnicity && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Ethnicity</p>
                      <p className="text-sm">{youngPerson.ethnicity}</p>
                    </div>
                  )}
                  {youngPerson.nationality && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Nationality</p>
                      <p className="text-sm">{youngPerson.nationality}</p>
                    </div>
                  )}
                  {youngPerson.primary_language && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Primary Language</p>
                      <p className="text-sm">{youngPerson.primary_language}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Interpreter Required</p>
                    <p className="text-sm">{youngPerson.interpreter_required ? 'Yes' : 'No'}</p>
                  </div>
                  {youngPerson.religion && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Religion</p>
                      <p className="text-sm">{youngPerson.religion}</p>
                    </div>
                  )}
                  {youngPerson.dietary_requirements && youngPerson.dietary_requirements.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Dietary Requirements</p>
                      <p className="text-sm">{youngPerson.dietary_requirements.join(', ')}</p>
                    </div>
                  )}
                  {youngPerson.activities_interests && youngPerson.activities_interests.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Activities & Interests</p>
                      <p className="text-sm">{youngPerson.activities_interests.join(', ')}</p>
                    </div>
                  )}
                  {youngPerson.communication_preferences && youngPerson.communication_preferences.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Communication Preferences</p>
                      <p className="text-sm">{youngPerson.communication_preferences.join(', ')}</p>
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
                  <p className="text-sm text-muted-foreground">{youngPerson.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Records Tab */}
          <TabsContent value="records" className="space-y-6">
            <RecentSessionsWidget youngPersonId={youngPerson.id} />
            <ChronologyWidget youngPersonId={youngPerson.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
