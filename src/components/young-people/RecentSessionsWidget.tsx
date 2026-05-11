import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { FileText, Calendar, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { KeyworkSessionWithYoungPerson } from "@/lib/types";

interface RecentSessionsWidgetProps {
  youngPersonId: string;
}

export function RecentSessionsWidget({ youngPersonId }: RecentSessionsWidgetProps) {
  const [sessions, setSessions] = useState<KeyworkSessionWithYoungPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecentSessions();
  }, [youngPersonId]);

  const fetchRecentSessions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("keywork_sessions")
      .select("*")
      .eq("young_person_id", youngPersonId)
      .order("session_date", { ascending: false })
      .limit(5);

    if (data) {
      setSessions(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Keywork Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading sessions...</p>
        </CardContent>
      </Card>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Keywork Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">No keywork sessions logged yet</p>
          <Button onClick={() => navigate("/keywork-sessions/new")} size="sm">
            Log First Session
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Recent Keywork Sessions
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate("/keywork-sessions")}
        >
          View All
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
            onClick={() => navigate(`/keywork-sessions/${session.id}`)}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-sm line-clamp-1">
                {session.title || session.topic}
              </h4>
              <Badge variant={session.session_type === "Planned" ? "default" : "secondary"} className="ml-2 shrink-0">
                {session.session_type}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(session.session_date), "dd MMM yyyy")}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {session.duration_minutes} min
              </div>
            </div>
            {session.linked_task_id && (
              <Badge variant="outline" className="mt-2 text-xs">
                Task Linked
              </Badge>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
