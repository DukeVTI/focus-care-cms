import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/untypedClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, Legend } from "recharts";
import { CheckCircle2 } from "lucide-react";

export function TaskCompletionChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTaskCompletion();
  }, []);

  const fetchTaskCompletion = async () => {
    setLoading(true);
    const { data: tasks } = await supabase.from("tasks").select("status");

    if (tasks) {
      const completed = tasks.filter((t) => ["completed", "COMPLETED", "done", "DONE"].includes(t.status)).length;
      const inProgress = tasks.filter((t) => ["in_progress", "IN_PROGRESS", "active", "ACTIVE"].includes(t.status)).length;
      const pending = tasks.filter((t) => ["pending", "PENDING", "todo", "TODO"].includes(t.status)).length;
      const overdue = tasks.length - completed - inProgress - pending;

      const chartData = [
        { name: "Completed", value: completed, color: "hsl(var(--success))" },
        { name: "In Progress", value: inProgress, color: "hsl(var(--warning))" },
        { name: "Pending", value: pending, color: "hsl(var(--muted-foreground))" },
      ];
      if (overdue > 0) chartData.push({ name: "Other", value: overdue, color: "hsl(var(--destructive))" });

      setData(chartData.filter((d) => d.value > 0));
    }
    setLoading(false);
  };

  const chartConfig = { value: { label: "Tasks" } };
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const emptyState = (
    <Card className="border-transparent">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
          </div>
          Task Completion
        </CardTitle>
        <CardDescription className="text-xs">Task status breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground text-center py-10">
          {loading ? "Loading..." : "No task data available"}
        </p>
      </CardContent>
    </Card>
  );

  if (loading || data.length === 0) return emptyState;

  return (
    <Card className="border-transparent">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
          </div>
          Task Completion
        </CardTitle>
        <CardDescription className="text-xs">Status breakdown of {total} tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={75}
              innerRadius={40}
              fill="#8884d8"
              dataKey="value"
              strokeWidth={2}
              stroke="hsl(var(--card))"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
