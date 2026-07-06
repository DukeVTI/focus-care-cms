import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, TrendingUp, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { RISK_LEVEL_BADGE_VARIANTS } from "@/lib/constants";
import { RiskAssessment, BadgeVariant } from "@/lib/types";

interface RiskLevelWidgetProps {
  youngPersonId: string;
}

export function RiskLevelWidget({ youngPersonId }: RiskLevelWidgetProps) {
  const navigate = useNavigate();
  const [latestAssessment, setLatestAssessment] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestAssessment();
  }, [youngPersonId]);

  const fetchLatestAssessment = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("risk_assessments")
      .select("*")
      .eq("young_person_id", youngPersonId)
      .order("assessment_date", { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setLatestAssessment(data as any);
    }
    setLoading(false);
  };

  const getRiskColor = (level: string): BadgeVariant => {
    const normalized = level?.toLowerCase();
    return RISK_LEVEL_BADGE_VARIANTS[normalized as keyof typeof RISK_LEVEL_BADGE_VARIANTS] || "secondary";
  };

  const getRiskGaugeColor = (level: string) => {
    switch (level) {
      case "High": return "text-destructive";
      case "Medium": return "text-warning";
      case "Low": return "text-green-500";
      default: return "text-muted";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Current Risk Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (!latestAssessment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Current Risk Level
          </CardTitle>
          <CardDescription>No assessments recorded</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => navigate(`/risk-assessments/new?yp=${youngPersonId}`)}
            variant="outline"
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create First Assessment
          </Button>
        </CardContent>
      </Card>
    );
  }

  const riskPercentage = ((latestAssessment.risk_score ?? 0) / 40) * 100;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5" />
              Current Risk Level
            </CardTitle>
            <CardDescription className="mt-1">
              Last assessed {latestAssessment.assessment_date ? format(new Date(latestAssessment.assessment_date), "PP") : "—"}
            </CardDescription>
          </div>
          {latestAssessment.level_change_flag && (
            <AlertTriangle className="h-5 w-5 text-destructive" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Risk Gauge */}
        <div className="flex items-center justify-center py-4">
          <div className="relative w-36 h-36">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="60"
                stroke="currentColor"
                strokeWidth="10"
                fill="none"
                className="text-muted opacity-20"
              />
              <circle
                cx="72"
                cy="72"
                r="60"
                stroke="currentColor"
                strokeWidth="10"
                fill="none"
                strokeDasharray={`${(riskPercentage / 100) * 377} 377`}
                className={getRiskGaugeColor(latestAssessment.risk_level ?? "")}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold">{latestAssessment.risk_score}</span>
              <span className="text-sm text-muted-foreground">/ 40</span>
            </div>
          </div>
        </div>

        <div className="text-center space-y-3">
          <Badge variant={getRiskColor(latestAssessment.risk_level ?? "")} className="text-sm px-4 py-1.5 font-semibold">
            {latestAssessment.risk_level ?? "Unknown"} Risk
          </Badge>
          {latestAssessment.previous_level && (
            <p className="text-sm text-muted-foreground">
              Previously: {latestAssessment.previous_level}
            </p>
          )}
        </div>

        {latestAssessment.level_change_flag && (
          <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
            <p className="text-sm font-medium text-destructive flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Risk level increased
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Immediate attention recommended
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/risk-assessments/${latestAssessment.id}`)}
          >
            View Details
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate(`/risk-assessments/new?yp=${youngPersonId}`)}
          >
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}