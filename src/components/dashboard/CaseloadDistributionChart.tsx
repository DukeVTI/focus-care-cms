import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
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
      const caseloadCounts: Record<string, number> = {};
      youngPeopleRes.data.forEach((yp) => {
        if (yp.key_worker_id) {
          caseloadCounts[yp.key_worker_id] = (caseloadCounts[yp.key_worker_id] || 0) + 1;
        }
      });

      const chartData = Object.entries(caseloadCounts)
        .map(([staffId, count]) => {
          const profile = profilesRes.data.find((p) => p.id === staffId);
          return { staff: (profile?.full_name || "Unassigned").split(" ")[0], caseload: count };
        })
        .sort((a, b) => b.caseload - a.caseload)
        .slice(0, 8);

      setData(chartData);
    }
    setLoading(false);
  };

  const chartConfig = {
    caseload: { label: "Young People", color: "hsl(var(--primary))" },
  };

  const emptyState = (
    <Card className="border-transparent">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="h-3.5 w-3.5 text-primary" />
          </div>
          Caseload Distribution
        </CardTitle>
        <CardDescription className="text-xs">Young people per keyworker</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground text-center py-10">
          {loading ? "Loading..." : "No caseload data available"}
        </p>
      </CardContent>
    </Card>
  );

  if (loading || data.length === 0) return emptyState;

  return (
    <Card className="border-transparent">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="h-3.5 w-3.5 text-primary" />
          </div>
          Caseload Distribution
        </CardTitle>
        <CardDescription className="text-xs">Young people assigned per keyworker</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
            <XAxis dataKey="staff" tick={{ fontSize: 11 }} className="text-muted-foreground" />
            <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="caseload" fill="var(--color-caseload)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
