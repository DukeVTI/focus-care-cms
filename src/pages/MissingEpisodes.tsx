import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertTriangle, MapPin, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/untypedClient";
import { format } from "date-fns";
import { ModuleHeader } from "@/components/ModuleHeader";

export default function MissingEpisodes() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchEpisodes();
    }
  }, [user]);

  const fetchEpisodes = async () => {
    setLoadingData(true);
    const { data, error } = await supabase
      .from("missing_episodes")
      .select(`
        *,
        young_people:young_person_id (
          first_name,
          last_name
        )
      `)
      .order("missing_from", { ascending: false });
    
    if (!error && data) {
      setEpisodes(data);
    }
    setLoadingData(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "missing": return "destructive";
      case "returned": return "secondary";
      case "found": return "secondary";
      default: return "secondary";
    }
  };

  if (loading || loadingData) {
    return null;
  }

  const activeMissing = episodes.filter(e => e.status === "missing");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <ModuleHeader />
      <div className="container py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Missing Episodes</h1>
            <p className="text-muted-foreground">Track and manage missing person incidents</p>
          </div>
          <Button onClick={() => navigate("/missing-episodes/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Report Missing
          </Button>
        </div>

        {/* Active Missing Alert */}
        {activeMissing.length > 0 && (
          <Card className="bg-destructive/10 border-destructive/20 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Active Missing Reports: {activeMissing.length}
              </CardTitle>
            </CardHeader>
          </Card>
        )}

        {episodes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="pt-6">
              <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No missing episodes recorded</h3>
              <p className="text-muted-foreground mb-4">
                Record missing person incidents for tracking and reporting
              </p>
              <Button onClick={() => navigate("/missing-episodes/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Report Missing
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {episodes.map((episode) => (
              <Card
                key={episode.id}
                className="cursor-pointer transition-all hover:shadow-md"
                onClick={() => navigate(`/missing-episodes/${episode.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {episode.young_people?.first_name} {episode.young_people?.last_name}
                      </CardTitle>
                      <CardDescription className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          Missing from: {format(new Date(episode.missing_from), "PPP p")}
                        </div>
                        {episode.returned_at && (
                          <div className="flex items-center gap-2">
                            Returned: {format(new Date(episode.returned_at), "PPP p")}
                          </div>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={getStatusColor(episode.status) as any}>
                        {episode.status.charAt(0).toUpperCase() + episode.status.slice(1)}
                      </Badge>
                      {episode.police_notified && (
                        <Badge variant="outline">Police Notified</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                {episode.last_known_location && (
                  <CardContent>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Last Known Location:</p>
                        <p className="text-sm text-muted-foreground">{episode.last_known_location}</p>
                      </div>
                    </div>
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