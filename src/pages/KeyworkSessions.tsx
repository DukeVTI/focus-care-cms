import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Clock, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ModuleHeader } from "@/components/ModuleHeader";
import { SESSION_TYPES } from "@/lib/constants";
import { KeyworkSessionDetail } from "@/lib/types";
import { useKeyworkSessions } from "@/hooks/use-keywork-sessions";

export default function KeyworkSessions() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { data: sessions = [], isLoading: loadingData } = useKeyworkSessions();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading || loadingData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <ModuleHeader />
      <div className="container py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Keywork Sessions</h1>
            <p className="text-muted-foreground">Track and manage keywork sessions</p>
          </div>
          <Button onClick={() => navigate("/keywork-sessions/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Log Session
          </Button>
        </div>

        {sessions.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="pt-6">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No sessions logged yet</h3>
              <p className="text-muted-foreground mb-4">
                Start logging keywork sessions to track your interactions
              </p>
              <Button onClick={() => navigate("/keywork-sessions/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Log Session
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <Card
                key={session.id}
                className="cursor-pointer transition-all hover:shadow-md"
                onClick={() => navigate(`/keywork-sessions/${session.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {session.title || session.topic}
                      </CardTitle>
                      <CardDescription className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{session.young_people?.first_name} {session.young_people?.last_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(session.session_date), "PPP")}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {session.duration_minutes} minutes
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={session.session_type === SESSION_TYPES.PLANNED ? "default" : "secondary"}>
                        {session.session_type}
                      </Badge>
                      {session.follow_up_required && (
                        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                          Follow-up Required
                        </Badge>
                      )}
                      {session.linked_task_id && (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          Task Linked
                        </Badge>
                      )}
                      {session.standards_met && session.standards_met.length > 0 && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                          {session.standards_met.length} Standards Met
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium mb-1">Topic: {session.topic}</p>
                  {session.notes && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {session.notes}
                    </p>
                  )}
                  {session.standards_referenced && session.standards_referenced.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {session.standards_referenced.slice(0, 3).map((standard: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {standard}
                        </Badge>
                      ))}
                      {session.standards_referenced.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{session.standards_referenced.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}