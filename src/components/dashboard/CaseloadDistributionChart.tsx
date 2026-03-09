import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/untypedClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Users } from "lucide-react";

export function CaseloadDistributionChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCaseloadDistribution();
  }, []);

  const fetchCaseloadDistribution = async () => {
    setLoading(true);
    
    const [youngPeopleRes, profilesRes] = await Promise.all([
      supabase.from("young_people").select("key_worker_id"),
      supabase.from("profiles").select("id, full_name")
    ]);

    if (youngPeopleRes.data && profilesRes.data) {
      // Count caseload per staff member
      const caseloadCounts: Record<string, number> = {};
      
      youngPeopleRes.data.forEach((yp) => {
        if (yp.key_worker_id) {
          caseloadCounts[yp.key_worker_id] = (caseloadCounts[yp.key_worker_id] || 0) + 1;
        }
      });

      // Map to staff names
      const chartData = Object.entries(caseloadCounts)
        .map(([staffId, count]) => {
          const profile = profilesRes.data.find((p) => p.id === staffId);
          const name = profile?.full_name || "Unassigned";
          return {
            staff: name.split(" ")[0] || name, // First name only for chart
            caseload: count,
          };
        })
        .sort((a, b) => b.caseload - a.caseload)
        .slice(0, 8); // Top 8 staff

      setData(chartData);
    }
    setLoading(false);
  };

  const chartConfig = {
    caseload: {
      label: "Young People",
      color: "hsl(var(--primary))",
    },
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Caseload Distribution
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
            <Users className="h-5 w-5" />
            Caseload Distribution
          </CardTitle>
          <CardDescription>Young people per keyworker</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No caseload data available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Caseload Distribution
        </CardTitle>
        <CardDescription>Young people assigned to each keyworker</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="staff"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="caseload"
                fill="var(--color-caseload)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
