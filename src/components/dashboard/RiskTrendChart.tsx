import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { TrendingUp } from "lucide-react";
import { format, subMonths } from "date-fns";
import { RISK_LEVELS } from "@/lib/constants";

export function RiskTrendChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRiskTrends();
  }, []);

  const fetchRiskTrends = async () => {
    setLoading(true);
    const sixMonthsAgo = subMonths(new Date(), 6);
    
    const { data: assessments } = await supabase
      .from("risk_assessments")
      .select("assessment_date, risk_level")
      .gte("assessment_date", sixMonthsAgo.toISOString())
      .order("assessment_date", { ascending: true });

    if (assessments) {
      const monthlyData: Record<string, { high: number; medium: number; low: number }> = {};
      
      assessments.forEach((assessment) => {
        const monthKey = format(new Date(assessment.assessment_date), "MMM yyyy");
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { high: 0, medium: 0, low: 0 };
        }
        const level = assessment.risk_level?.toLowerCase() || "";
        if (level === RISK_LEVELS.HIGH.toLowerCase()) monthlyData[monthKey].high++;
        else if (level === RISK_LEVELS.MEDIUM.toLowerCase()) monthlyData[monthKey].medium++;
        else if (level === RISK_LEVELS.LOW.toLowerCase()) monthlyData[monthKey].low++;
      });

      setData(Object.entries(monthlyData).map(([month, counts]) => ({
        month, high: counts.high, medium: counts.medium, low: counts.low,
      })));
    }
    setLoading(false);
  };

  const chartConfig = {
    high: { label: "High Risk", color: "hsl(var(--destructive))" },
    medium: { label: "Medium Risk", color: "hsl(var(--warning))" },
    low: { label: "Low Risk", color: "hsl(var(--success))" },
  };

  const emptyState = (
    <Card className="border-transparent">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-destructive/10 flex items-center justify-center">
            <TrendingUp className="h-3.5 w-3.5 text-destructive" />
          </div>
          Risk Level Trends
        </CardTitle>
        <CardDescription className="text-xs">Last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground text-center py-10">
          {loading ? "Loading..." : "No risk assessment data available"}
        </p>
      </CardContent>
    </Card>
  );

  if (loading || data.length === 0) return emptyState;

  return (
    <Card className="border-transparent">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-destructive/10 flex items-center justify-center">
            <TrendingUp className="h-3.5 w-3.5 text-destructive" />
          </div>
          Risk Level Trends
        </CardTitle>
        <CardDescription className="text-xs">Risk assessments over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-muted-foreground" />
            <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line type="monotone" dataKey="high" stroke="var(--color-high)" strokeWidth={2.5} dot={{ fill: "var(--color-high)", r: 3.5 }} />
            <Line type="monotone" dataKey="medium" stroke="var(--color-medium)" strokeWidth={2.5} dot={{ fill: "var(--color-medium)", r: 3.5 }} />
            <Line type="monotone" dataKey="low" stroke="var(--color-low)" strokeWidth={2.5} dot={{ fill: "var(--color-low)", r: 3.5 }} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
