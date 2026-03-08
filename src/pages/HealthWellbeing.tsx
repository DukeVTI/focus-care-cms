import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/untypedClient";
import { ModuleHeader } from "@/components/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Heart, Link2, BarChart3 } from "lucide-react";
import { HealthConditionSection } from "@/components/health-wellbeing/HealthConditionSection";
import { MedicalVisitsSection } from "@/components/health-wellbeing/MedicalVisitsSection";

export default function HealthWellbeing() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [youngPerson, setYoungPerson] = useState<any>(null);
  const [healthEntries, setHealthEntries] = useState<any[]>([]);
  const [medicalVisits, setMedicalVisits] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  const fetchData = useCallback(async () => {
    if (!user || !id) return;
    setLoadingData(true);

    const [ypRes, healthRes, medRes] = await Promise.all([
      supabase.from("young_people").select("id, first_name, last_name, focus_id").eq("id", id).single(),
      supabase.from("health_condition_entries").select("*").eq("young_person_id", id).order("created_at", { ascending: false }),
      supabase.from("medical_appointment_logs").select("*").eq("young_person_id", id).order("date_of_visit", { ascending: false }),
    ]);

    if (ypRes.data) setYoungPerson(ypRes.data);
    if (healthRes.data) setHealthEntries(healthRes.data);
    if (medRes.data) setMedicalVisits(medRes.data);
    setLoadingData(false);
  }, [user, id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading || loadingData) return null;
  if (!youngPerson) return null;

  const physicalEntries = healthEntries.filter(e => e.category === "physical");
  const substanceEntries = healthEntries.filter(e => e.category === "substance");
  const mentalHealthEntries = healthEntries.filter(e => e.category === "mental_health");

  // Calculate summary stats
  const avgRating = healthEntries.length > 0
    ? (healthEntries.reduce((sum, e) => sum + e.rating, 0) / healthEntries.length).toFixed(1)
    : "—";
  const highSeverityCount = healthEntries.filter(e => e.rating >= 4).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <ModuleHeader />
      <div className="container py-6 px-4 max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(`/young-people/${id}`)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {youngPerson.first_name}'s Profile
        </Button>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              Health & Wellbeing
            </h1>
            <p className="text-muted-foreground">
              {youngPerson.first_name} {youngPerson.last_name}
              {youngPerson.focus_id && <span className="ml-2 font-mono text-xs">({youngPerson.focus_id})</span>}
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold text-primary">{healthEntries.length}</p>
              <p className="text-xs text-muted-foreground">Total Conditions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold">{avgRating}</p>
              <p className="text-xs text-muted-foreground">Avg Severity</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <p className={`text-2xl font-bold ${highSeverityCount > 0 ? "text-destructive" : ""}`}>{highSeverityCount}</p>
              <p className="text-xs text-muted-foreground">High Severity (4-5)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold">{medicalVisits.length}</p>
              <p className="text-xs text-muted-foreground">Medical Visits</p>
            </CardContent>
          </Card>
        </div>

        {/* Linkage Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Link2 className="h-4 w-4" />
              Linked Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate(`/risk-assessments?yp=${id}`)}>
                View Risk Assessments
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate(`/young-people/${id}`)}>
                View Care Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Three Core Assessment Sections */}
        <div className="space-y-6">
          <HealthConditionSection
            category="physical"
            youngPersonId={id!}
            entries={physicalEntries}
            onRefresh={fetchData}
          />
          <HealthConditionSection
            category="substance"
            youngPersonId={id!}
            entries={substanceEntries}
            onRefresh={fetchData}
          />
          <HealthConditionSection
            category="mental_health"
            youngPersonId={id!}
            entries={mentalHealthEntries}
            onRefresh={fetchData}
          />

          {/* Medical Visits Log */}
          <MedicalVisitsSection
            youngPersonId={id!}
            visits={medicalVisits}
            onRefresh={fetchData}
          />
        </div>
      </div>
    </div>
  );
}
