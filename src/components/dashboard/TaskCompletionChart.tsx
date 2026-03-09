import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/untypedClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { CheckCircle2 } from "lucide-react";

export function TaskCompletionChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTaskCompletion();
  }, []);

  const fetchTaskCompletion = async () => {
    setLoading(true);
    
    const { data: tasks } = await supabase
      .from("tasks")
      .select("status");

    if (tasks) {
      const completed = tasks.filter((t) =>
        ["completed", "COMPLETED", "done", "DONE"].includes(t.status)
      ).length;
      const inProgress = tasks.filter((t) =>
        ["in_progress", "IN_PROGRESS", "active", "ACTIVE"].includes(t.status)
      ).length;
      const pending = tasks.filter((t) =>
        ["pending", "PENDING", "todo", "TODO"].includes(t.status)
      ).length;
      const overdue = tasks.length - completed - inProgress - pending;

      const chartData = [
        { name: "Completed", value: completed, color: "hsl(var(--success))" },
        { name: "In Progress", value: inProgress, color: "hsl(var(--warning))" },
        { name: "Pending", value: pending, color: "hsl(var(--muted-foreground))" },
      ];

      if (overdue > 0) {
        chartData.push({ name: "Other", value: overdue, color: "hsl(var(--destructive))" });
      }

      setData(chartData.filter((d) => d.value > 0));
    }
    setLoading(false);
  };

  const chartConfig = {
    value: {
      label: "Tasks",
    },
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Task Completion
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
            <CheckCircle2 className="h-5 w-5" />
            Task Completion
          </CardTitle>
          <CardDescription>Task status breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No task data available
          </p>
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          Task Completion
        </CardTitle>
        <CardDescription>Status breakdown of {total} tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
