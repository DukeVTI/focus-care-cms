import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertTriangle, MapPin, Calendar, UserCheck, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/untypedClient";
import { format, differenceInHours } from "date-fns";
import { ModuleHeader } from "@/components/ModuleHeader";
import { MissingEpisodeFilters } from "@/components/missing-episodes/MissingEpisodeFilters";
import { EscalationBadge } from "@/components/missing-episodes/EscalationBadge";

export default function MissingEpisodes() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

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
          last_name,
          focus_id
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
      default: return "secondary";
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "critical": return <Badge variant="destructive">Critical Risk</Badge>;
      case "high": return <Badge variant="destructive" className="bg-orange-600">High Risk</Badge>;
      case "medium": return <Badge variant="outline" className="border-amber-500 text-amber-600">Medium Risk</Badge>;
      case "low": return <Badge variant="outline">Low Risk</Badge>;
      default: return null;
    }
  };

  const filteredEpisodes = episodes.filter((e) => {
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const name = `${e.young_people?.first_name || ""} ${e.young_people?.last_name || ""}`.toLowerCase();
      const caseId = (e.case_id || "").toLowerCase();
      if (!name.includes(q) && !caseId.includes(q)) return false;
    }
    return true;
  });

  const activeMissing = episodes.filter(e => e.status === "missing");
  const criticalMissing = activeMissing.filter(e => differenceInHours(new Date(), new Date(e.missing_from)) >= 24);

  if (loading || loadingData) return null;

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

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-2xl font-bold">{episodes.length}</p>
            <p className="text-xs text-muted-foreground">Total Episodes</p>
          </Card>
          <Card className={`p-4 ${activeMissing.length > 0 ? "border-destructive/50 bg-destructive/5" : ""}`}>
            <p className="text-2xl font-bold">{activeMissing.length}</p>
            <p className="text-xs text-muted-foreground">Currently Missing</p>
          </Card>
          <Card className={`p-4 ${criticalMissing.length > 0 ? "border-destructive bg-destructive/10" : ""}`}>
            <p className="text-2xl font-bold">{criticalMissing.length}</p>
            <p className="text-xs text-muted-foreground">Escalated (24h+)</p>
          </Card>
          <Card className="p-4">
            <p className="text-2xl font-bold">
              {episodes.filter(e => e.status === "returned" && !e.manager_approved).length}
            </p>
            <p className="text-xs text-muted-foreground">Awaiting Approval</p>
          </Card>
        </div>

        {/* Active Missing Alert */}
        {criticalMissing.length > 0 && (
          <Card className="bg-destructive/10 border-destructive/30 mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-destructive text-base">
                <AlertTriangle className="h-5 w-5" />
                {criticalMissing.length} Episode{criticalMissing.length > 1 ? "s" : ""} Escalated (24+ hours)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1">
                {criticalMissing.map((e) => (
                  <p key={e.id} className="text-sm text-destructive">
                    • {e.young_people?.first_name} {e.young_people?.last_name} — missing {Math.floor(differenceInHours(new Date(), new Date(e.missing_from)) / 24)}d+
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <MissingEpisodeFilters
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {filteredEpisodes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="pt-6">
              <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No missing episodes found</h3>
              <p className="text-muted-foreground mb-4">
                {episodes.length === 0 ? "Record missing person incidents for tracking and reporting" : "Try adjusting your filters"}
              </p>
              {episodes.length === 0 && (
                <Button onClick={() => navigate("/missing-episodes/new")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Report Missing
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredEpisodes.map((episode) => (
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
                        {episode.young_people?.focus_id && (
                          <span className="text-sm font-normal text-muted-foreground ml-2">
                            ({episode.young_people.focus_id})
                          </span>
                        )}
                      </CardTitle>
                      {episode.case_id && (
                        <p className="text-sm font-mono text-muted-foreground mb-2">
                          Case: {episode.case_id}
                        </p>
                      )}
                      <CardDescription className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          Missing from: {format(new Date(episode.missing_from), "PPP p")}
                        </div>
                        {episode.returned_at && (
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-3 w-3" />
                            Returned: {format(new Date(episode.returned_at), "PPP p")}
                          </div>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={getStatusColor(episode.status) as any}>
                        {episode.status.charAt(0).toUpperCase() + episode.status.slice(1)}
                      </Badge>
                      <EscalationBadge
                        missingFrom={episode.missing_from}
                        status={episode.status}
                        escalationLevel={episode.escalation_level}
                      />
                      {getRiskBadge(episode.risk_level)}
                      {episode.police_notified && (
                        <Badge variant="outline">Police Notified</Badge>
                      )}
                      {episode.status === "returned" && !episode.manager_approved && (
                        <Badge variant="outline" className="gap-1 border-amber-500 text-amber-600">
                          <Shield className="h-3 w-3" />
                          Needs Approval
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                {episode.last_known_location && (
                  <CardContent className="pt-0">
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
