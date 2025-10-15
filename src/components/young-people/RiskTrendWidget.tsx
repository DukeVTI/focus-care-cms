import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/untypedClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format } from "date-fns";

interface RiskTrendWidgetProps {
  youngPersonId: string;
}

export function RiskTrendWidget({ youngPersonId }: RiskTrendWidgetProps) {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessments();
  }, [youngPersonId]);

  const fetchAssessments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("risk_assessments")
      .select("id, assessment_date, risk_score, risk_level")
      .eq("young_person_id", youngPersonId)
      .order("assessment_date", { ascending: true })
      .limit(12);

    if (data) {
      setAssessments(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Risk Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (assessments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Risk Trend
          </CardTitle>
          <CardDescription>No assessment history</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Complete at least two assessments to see trend data
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartData = assessments.map((assessment) => ({
    date: format(new Date(assessment.assessment_date), "MMM dd"),
    score: assessment.risk_score,
    level: assessment.risk_level
  }));

  const getLineColor = () => {
    if (assessments.length === 0) return "#888";
    const latestLevel = assessments[assessments.length - 1].risk_level;
    switch (latestLevel) {
      case "High": return "#ef4444";
      case "Medium": return "#f59e0b";
      case "Low": return "#22c55e";
      default: return "#888";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Risk Trend
        </CardTitle>
        <CardDescription>
          Last {assessments.length} assessment{assessments.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis 
              domain={[0, 40]}
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
              formatter={(value: any) => [`Score: ${value}`, '']}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke={getLineColor()}
              strokeWidth={2}
              dot={{ fill: getLineColor(), r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs">
          <div>
            <div className="w-3 h-3 rounded-full bg-green-500 mx-auto mb-1" />
            <span className="text-muted-foreground">Low (0-10)</span>
          </div>
          <div>
            <div className="w-3 h-3 rounded-full bg-yellow-500 mx-auto mb-1" />
            <span className="text-muted-foreground">Medium (11-20)</span>
          </div>
          <div>
            <div className="w-3 h-3 rounded-full bg-red-500 mx-auto mb-1" />
            <span className="text-muted-foreground">High (21+)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}