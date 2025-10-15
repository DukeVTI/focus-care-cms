import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/untypedClient";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface TasksWidgetProps {
  youngPersonId: string;
}

export function TasksWidget({ youngPersonId }: TasksWidgetProps) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, [youngPersonId]);

  const fetchTasks = async () => {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("young_person_id", youngPersonId)
      .in("status", ["OPEN", "IN_PROGRESS", "pending", "in_progress"])
      .order("expected_completion", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true });
    
    if (data) {
      setTasks(data);
    }
    setLoading(false);
  };

  if (loading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Outstanding Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No outstanding tasks</p>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start justify-between p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => navigate(`/tasks/${task.id}`)}
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{task.title}</p>
                  {task.expected_completion && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Due: {format(new Date(task.expected_completion), "PPP")}
                    </p>
                  )}
                </div>
                <Badge variant={task.importance === "HIGH" ? "destructive" : task.importance === "MEDIUM" ? "default" : "secondary"} className="ml-2">
                  {task.importance}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
