import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/untypedClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, TrendingUp, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface RiskLevelWidgetProps {
  youngPersonId: string;
}

export function RiskLevelWidget({ youngPersonId }: RiskLevelWidgetProps) {
  const navigate = useNavigate();
  const [latestAssessment, setLatestAssessment] = useState<any>(null);
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
      setLatestAssessment(data);
    }
    setLoading(false);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "High": return "destructive";
      case "Medium": return "warning";
      case "Low": return "secondary";
      default: return "secondary";
    }
  };

  const getRiskGaugeColor = (level: string) => {
    switch (level) {
      case "High": return "bg-red-500";
      case "Medium": return "bg-yellow-500";
      case "Low": return "bg-green-500";
      default: return "bg-gray-500";
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

  const riskPercentage = (latestAssessment.risk_score / 40) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Current Risk Level
            </CardTitle>
            <CardDescription>
              Last assessed {format(new Date(latestAssessment.assessment_date), "PPP")}
            </CardDescription>
          </div>
          {latestAssessment.level_change_flag && (
            <AlertTriangle className="h-5 w-5 text-destructive" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Risk Gauge */}
        <div className="flex items-center justify-center">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${(riskPercentage / 100) * 439.8} 439.8`}
                className={getRiskGaugeColor(latestAssessment.risk_level)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{latestAssessment.risk_score}</span>
              <span className="text-xs text-muted-foreground">/ 40</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Badge variant={getRiskColor(latestAssessment.risk_level) as any} className="text-base px-4 py-1">
            {latestAssessment.risk_level} Risk
          </Badge>
          {latestAssessment.previous_level && (
            <p className="text-xs text-muted-foreground mt-2">
              Previously: {latestAssessment.previous_level}
            </p>
          )}
        </div>

        {latestAssessment.level_change_flag && (
          <div className="p-3 bg-destructive/10 rounded-md">
            <p className="text-sm font-medium text-destructive flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Risk level increased
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Immediate attention recommended
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => navigate(`/risk-assessments/${latestAssessment.id}`)}
          >
            View Details
          </Button>
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={() => navigate(`/risk-assessments/new?yp=${youngPersonId}`)}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Assessment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}