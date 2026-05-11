import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ModuleHeader } from "@/components/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User, TrendingUp, AlertTriangle, FileText } from "lucide-react";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { RISK_LEVEL_BADGE_VARIANTS } from "@/lib/constants";
import { RiskAssessmentDetail as RiskAssessmentDetailType, YoungPerson, Profile, Task, BadgeVariant } from "@/lib/types";

const DEFAULT_SECTIONS = [
  { key: "safety_missing", label: "Safety & Missing Episodes", weight: 1 },
  { key: "mental_health", label: "Mental Health & Wellbeing", weight: 1.2 },
  { key: "substance_use", label: "Substance Use", weight: 1.1 },
  { key: "peer_relationships", label: "Peer/Relationship Risks", weight: 0.9 },
  { key: "education", label: "Education/Attendance Risks", weight: 0.8 },
  { key: "online_safety", label: "Online/Social Media Risks", weight: 1 },
  { key: "environmental", label: "Environmental/Family Factors", weight: 1 },
  { key: "other", label: "Other Identified Risks", weight: 0.7 }
];

export default function RiskAssessmentDetail() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<RiskAssessmentDetailType | null>(null);
  const [youngPerson, setYoungPerson] = useState<YoungPerson | null>(null);
  const [assessor, setAssessor] = useState<Profile | null>(null);
  const [linkedTask, setLinkedTask] = useState<Task | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchAssessment();
    }
  }, [user, id]);

  const fetchAssessment = async () => {
    setLoadingData(true);
    
    // Fetch assessment
    const { data: assessmentData, error } = await supabase
      .from("risk_assessments")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !assessmentData) {
      setLoadingData(false);
      return;
    }

    setAssessment(assessmentData);

    // Fetch young person
    const { data: ypData } = await supabase
      .from("young_people")
      .select("first_name, last_name, focus_id")
      .eq("id", assessmentData.young_person_id)
      .single();
    
    if (ypData) setYoungPerson(ypData);

    // Fetch assessor
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", assessmentData.assessed_by)
      .single();
    
    if (profileData) setAssessor(profileData);

    // Fetch linked task if exists
    if (assessmentData.linked_task_id) {
      const { data: taskData } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", assessmentData.linked_task_id)
        .single();
      
      if (taskData) setLinkedTask(taskData);
    }

    setLoadingData(false);
  };

  const getRiskColor = (level: string): BadgeVariant => {
    return RISK_LEVEL_BADGE_VARIANTS[level as keyof typeof RISK_LEVEL_BADGE_VARIANTS] || "secondary";
  };

  const getScorePercentage = (score: number) => {
    return (score / 5) * 100;
  };

  const getScoreColor = (score: number) => {
    if (score <= 1) return "bg-green-500";
    if (score <= 2) return "bg-blue-500";
    if (score <= 3) return "bg-yellow-500";
    if (score <= 4) return "bg-orange-500";
    return "bg-red-500";
  };

  if (loading || loadingData) {
    return null;
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
        <ModuleHeader />
        <div className="container py-8 px-4">
          <p>Assessment not found</p>
        </div>
      </div>
    );
  }

  const sectionScores = assessment.section_scores || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <ModuleHeader />
      <div className="container py-8 px-4 max-w-5xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/risk-assessments")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Assessments
        </Button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Risk Assessment</h1>
              {youngPerson && (
                <p className="text-muted-foreground mt-1">
                  {youngPerson.first_name} {youngPerson.last_name} ({youngPerson.focus_id})
                </p>
              )}
            </div>
            <Badge variant={getRiskColor(assessment.risk_level)} className="text-lg px-4 py-2">
              {assessment.risk_level} Risk
            </Badge>
          </div>

          <div className="flex gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {format(new Date(assessment.assessment_date), "PPP")}
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {assessor?.full_name || "Unknown"}
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Score: {assessment.risk_score}/40
            </div>
          </div>
        </div>

        {/* Level Change Alert */}
        {assessment.level_change_flag && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Risk Level Increased</AlertTitle>
            <AlertDescription>
              Risk level increased from {assessment.previous_level} to {assessment.risk_level}.
              Immediate attention recommended.
            </AlertDescription>
          </Alert>
        )}

        {/* Section Scores */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Section Breakdown</CardTitle>
            <CardDescription>Detailed scores across all risk areas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {DEFAULT_SECTIONS.map((section) => {
              const sectionData = sectionScores[section.key];
              if (!sectionData) return null;

              const score = sectionData.score || 0;
              
              return (
                <div key={section.key}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{section.label}</h4>
                    <Badge variant="outline">{score}/5</Badge>
                  </div>
                  <Progress 
                    value={getScorePercentage(score)} 
                    className="h-2 mb-2"
                  />
                  {sectionData.notes && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {sectionData.notes}
                    </p>
                  )}
                  {section.key !== DEFAULT_SECTIONS[DEFAULT_SECTIONS.length - 1].key && (
                    <Separator className="mt-4" />
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recommendations */}
        {assessment.recommendations && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{assessment.recommendations}</p>
            </CardContent>
          </Card>
        )}

        {/* Linked Task */}
        {linkedTask && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Follow-up Task
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{linkedTask.title}</p>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>Due: {linkedTask.due_date ? format(new Date(linkedTask.due_date), "PPP") : "No due date"}</span>
                  <Badge variant="outline">{linkedTask.status}</Badge>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => navigate(`/tasks/${linkedTask.id}`)}
              >
                View Task
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Assessment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created:</span>
              <span>{format(new Date(assessment.created_at), "PPP 'at' p")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Updated:</span>
              <span>{format(new Date(assessment.updated_at), "PPP 'at' p")}</span>
            </div>
            {assessment.previous_level && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Previous Level:</span>
                <Badge variant={getRiskColor(assessment.previous_level)}>
                  {assessment.previous_level}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}