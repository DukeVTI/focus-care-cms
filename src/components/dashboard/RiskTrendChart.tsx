import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/untypedClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { format, subMonths } from "date-fns";

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
      // Group by month and count levels
      const monthlyData: Record<string, { high: number; medium: number; low: number }> = {};
      
      assessments.forEach((assessment) => {
        const monthKey = format(new Date(assessment.assessment_date), "MMM yyyy");
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { high: 0, medium: 0, low: 0 };
        }
        
        const level = assessment.risk_level.toLowerCase();
        if (level === "high") monthlyData[monthKey].high++;
        else if (level === "medium") monthlyData[monthKey].medium++;
        else if (level === "low") monthlyData[monthKey].low++;
      });

      const chartData = Object.entries(monthlyData).map(([month, counts]) => ({
        month,
        high: counts.high,
        medium: counts.medium,
        low: counts.low,
      }));

      setData(chartData);
    }
    setLoading(false);
  };

  const chartConfig = {
    high: {
      label: "High Risk",
      color: "hsl(var(--destructive))",
    },
    medium: {
      label: "Medium Risk",
      color: "hsl(var(--warning))",
    },
    low: {
      label: "Low Risk",
      color: "hsl(var(--success))",
    },
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Risk Level Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Risk Level Trends
          </CardTitle>
          <CardDescription>Last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No risk assessment data available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Risk Level Trends
        </CardTitle>
        <CardDescription>Risk assessments over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="high"
                stroke="var(--color-high)"
                strokeWidth={2}
                dot={{ fill: "var(--color-high)", r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="medium"
                stroke="var(--color-medium)"
                strokeWidth={2}
                dot={{ fill: "var(--color-medium)", r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="low"
                stroke="var(--color-low)"
                strokeWidth={2}
                dot={{ fill: "var(--color-low)", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
