import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Shield, TrendingUp, Calendar, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/untypedClient";
import { format } from "date-fns";
import { ModuleHeader } from "@/components/ModuleHeader";
import { exportRiskAssessmentsToCSV } from "@/utils/riskAssessmentExport";
import { useToast } from "@/hooks/use-toast";

export default function RiskAssessments() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchAssessments();
    }
  }, [user]);

  const fetchAssessments = async () => {
    setLoadingData(true);
    const { data, error } = await supabase
      .from("risk_assessments")
      .select(`
        *,
        young_people:young_person_id (
          first_name,
          last_name,
          focus_id
        ),
        profiles:assessed_by (
          full_name
        )
      `)
      .order("assessment_date", { ascending: false });
    
    if (!error && data) {
      setAssessments(data);
    }
    setLoadingData(false);
  };

  const handleExport = async () => {
    if (assessments.length === 0) {
      toast({
        title: "No data to export",
        description: "Create some assessments first",
        variant: "destructive"
      });
      return;
    }

    const exportData = assessments.map(a => ({
      id: a.id,
      young_person_id: a.young_person_id,
      young_person_name: `${a.young_people?.first_name} ${a.young_people?.last_name}`,
      focus_id: a.young_people?.focus_id || "",
      assessment_date: a.assessment_date,
      assessed_by: a.assessed_by,
      assessor_name: a.profiles?.full_name || "Unknown",
      risk_level: a.risk_level,
      risk_score: a.risk_score,
      section_scores: a.section_scores,
      recommendations: a.recommendations || "",
      follow_up_needed: a.follow_up_needed,
      created_at: a.created_at
    }));

    exportRiskAssessmentsToCSV(exportData);
    
    toast({
      title: "Export successful",
      description: `Exported ${assessments.length} assessment${assessments.length !== 1 ? 's' : ''}`
    });
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "High": return "destructive";
      case "Medium": return "warning";
      case "Low": return "secondary";
      default: return "secondary";
    }
  };

  if (loading || loadingData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <ModuleHeader />
      <div className="container py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Risk Assessments</h1>
            <p className="text-muted-foreground">Monitor and assess risk levels</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={() => navigate("/risk-assessments/new")}>
              <Plus className="h-4 w-4 mr-2" />
              New Assessment
            </Button>
          </div>
        </div>

        {assessments.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="pt-6">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No assessments yet</h3>
              <p className="text-muted-foreground mb-4">
                Start creating risk assessments to monitor safety
              </p>
              <Button onClick={() => navigate("/risk-assessments/new")}>
                <Plus className="h-4 w-4 mr-2" />
                New Assessment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {assessments.map((assessment) => (
              <Card
                key={assessment.id}
                className="cursor-pointer transition-all hover:shadow-md"
                onClick={() => navigate(`/risk-assessments/${assessment.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {assessment.young_people?.first_name} {assessment.young_people?.last_name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(assessment.assessment_date), "PPP")}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={getRiskColor(assessment.risk_level) as any} className="text-sm">
                        {assessment.risk_level} Risk
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        Score: {assessment.risk_score}/100
                      </div>
                    </div>
                  </div>
                </CardHeader>
                {assessment.risk_factors && (
                  <CardContent>
                    <p className="text-sm font-medium mb-1">Risk Factors:</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {assessment.risk_factors}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}