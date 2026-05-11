import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ModuleHeader } from "@/components/ModuleHeader";
import { TaskWithYoungPerson, BadgeVariant } from "@/lib/types";
import {
  TASK_STATUSES,
  TASK_IMPORTANCE,
  ACTIVE_TASK_STATUSES,
  TASK_IMPORTANCE_BADGE_VARIANTS,
} from "@/lib/constants";
import { useTasks } from "@/hooks/use-tasks";

export default function Tasks() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { data: tasks = [], isLoading: loadingData } = useTasks();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const getImportanceColor = (importance: string): BadgeVariant => {
    const normalized = importance?.toLowerCase();
    return TASK_IMPORTANCE_BADGE_VARIANTS[normalized as keyof typeof TASK_IMPORTANCE_BADGE_VARIANTS] || "secondary";
  };

  const getStatusIcon = (status: string) => {
    const normalized = status?.toLowerCase();
    if (
      normalized === TASK_STATUSES.COMPLETED.toLowerCase() ||
      normalized === TASK_STATUSES.DONE.toLowerCase()
    ) {
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    }
    if (normalized === TASK_STATUSES.IN_PROGRESS.toLowerCase()) {
      return <Clock className="h-4 w-4 text-warning" />;
    }
    if (
      normalized === TASK_STATUSES.OPEN.toLowerCase() ||
      normalized === TASK_STATUSES.PENDING.toLowerCase()
    ) {
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
    return <Clock className="h-4 w-4" />;
  };

  if (loading || loadingData) {
    return null;
  }

  const pendingTasks = tasks.filter(t => {
    const normalized = t.status?.toLowerCase();
    return [
      TASK_STATUSES.PENDING.toLowerCase(),
      TASK_STATUSES.OPEN.toLowerCase(),
    ].includes(normalized);
  });
  const inProgressTasks = tasks.filter(
    t => t.status?.toLowerCase() === TASK_STATUSES.IN_PROGRESS.toLowerCase()
  );
  const completedTasks = tasks.filter(t => {
    const normalized = t.status?.toLowerCase();
    return COMPLETED_TASK_STATUSES.map(s => s.toLowerCase()).includes(normalized);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <ModuleHeader />
      <div className="container py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Tasks</h1>
            <p className="text-muted-foreground">Manage your assignments and responsibilities</p>
          </div>
          <Button onClick={() => navigate("/tasks/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{pendingTasks.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">{inProgressTasks.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{completedTasks.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks List */}
        {tasks.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="pt-6">
              <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first task to get started
              </p>
              <Button onClick={() => navigate("/tasks/new")}>
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card
                key={task.id}
                className="cursor-pointer transition-all hover:shadow-md"
                onClick={() => navigate(`/tasks/${task.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(task.status)}
                        <CardTitle className="text-lg">{task.title}</CardTitle>
                      </div>
                      <CardDescription>
                        For: {task.young_people?.first_name} {task.young_people?.last_name}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={getImportanceColor(task.importance)}>
                        {task.importance}
                      </Badge>
                      {task.requires_support === "Yes" && (
                        <Badge variant="outline">Requires Support</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                {(task.description || task.due_date) && (
                  <CardContent>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                     {(task.expected_completion || task.due_date) && (
                      <p className="text-sm text-muted-foreground">
                        Due: {format(new Date(task.expected_completion || task.due_date), "PP")}
                      </p>
                    )}
                    {task.support_required && (
                      <p className="text-sm text-muted-foreground">
                        Support: {task.supporter_role?.replace('_', ' ')}
                      </p>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}