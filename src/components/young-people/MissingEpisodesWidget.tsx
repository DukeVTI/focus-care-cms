import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/untypedClient";
import { format, differenceInHours } from "date-fns";

interface MissingEpisodesWidgetProps {
  youngPersonId: string;
}

export const MissingEpisodesWidget = ({ youngPersonId }: MissingEpisodesWidgetProps) => {
  const navigate = useNavigate();
  const [currentEpisode, setCurrentEpisode] = useState<any>(null);
  const [recentCount, setRecentCount] = useState({ last30Days: 0, last90Days: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (youngPersonId) {
      fetchEpisodes();
    }
  }, [youngPersonId]);

  const fetchEpisodes = async () => {
    setLoading(true);

    // Check for current missing episode
    const { data: currentData } = await supabase
      .from("missing_episodes")
      .select("*")
      .eq("young_person_id", youngPersonId)
      .eq("status", "missing")
      .order("missing_from", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (currentData) {
      setCurrentEpisode(currentData);
    }

    // Get counts for last 30 and 90 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data: episodes30 } = await supabase
      .from("missing_episodes")
      .select("id")
      .eq("young_person_id", youngPersonId)
      .gte("missing_from", thirtyDaysAgo.toISOString());

    const { data: episodes90 } = await supabase
      .from("missing_episodes")
      .select("id")
      .eq("young_person_id", youngPersonId)
      .gte("missing_from", ninetyDaysAgo.toISOString());

    setRecentCount({
      last30Days: episodes30?.length || 0,
      last90Days: episodes90?.length || 0
    });

    setLoading(false);
  };

  const calculateDuration = (missingFrom: string) => {
    const hours = differenceInHours(new Date(), new Date(missingFrom));
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Missing Episodes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Missing Episodes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentEpisode ? (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <Badge variant="destructive">Currently Missing</Badge>
              <Clock className="h-4 w-4 text-destructive" />
            </div>
            <div className="space-y-1 text-sm">
              {currentEpisode.case_id && (
                <div className="flex items-center gap-2 font-semibold">
                  <span>Case: {currentEpisode.case_id}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span>Since: {format(new Date(currentEpisode.missing_from), "PPp")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>Duration: {calculateDuration(currentEpisode.missing_from)}</span>
              </div>
            </div>
            <Button
              size="sm"
              variant="destructive"
              className="w-full mt-3"
              onClick={() => navigate(`/missing-episodes/${currentEpisode.id}`)}
            >
              View Details
            </Button>
          </div>
        ) : (
          <div className="p-4 bg-secondary/50 rounded-lg">
            <p className="text-sm font-medium mb-1">In Placement</p>
            <p className="text-xs text-muted-foreground">No active missing episodes</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold">{recentCount.last30Days}</p>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold">{recentCount.last90Days}</p>
            <p className="text-xs text-muted-foreground">Last 90 days</p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => navigate("/missing-episodes")}
        >
          View All Episodes
        </Button>
      </CardContent>
    </Card>
  );
};
