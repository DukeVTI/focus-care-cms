import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, User, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/untypedClient";
import { format } from "date-fns";
import { ModuleHeader } from "@/components/ModuleHeader";

export default function ChronologyDetail() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchEntry();
    }
  }, [user, id]);

  const fetchEntry = async () => {
    setLoadingData(true);
    const { data, error } = await supabase
      .from("chronology_entries")
      .select(`
        *,
        young_people:young_person_id (
          first_name,
          last_name,
          focus_id
        )
      `)
      .eq("id", id)
      .single();
    
    if (!error && data) {
      setEntry(data);
    }
    setLoadingData(false);
  };

  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case "High": return "destructive";
      case "Medium": return "warning";
      case "Low": return "secondary";
      default: return "secondary";
    }
  };

  if (loading || loadingData) {
    return null;
  }

  if (!entry) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
        <ModuleHeader />
        <div className="container py-8 px-4">
          <p className="text-muted-foreground">Entry not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <ModuleHeader />
      <div className="container py-8 px-4 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/chronology")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Chronology
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">
                  {entry.young_people?.first_name} {entry.young_people?.last_name}
                </CardTitle>
                <CardDescription>
                  {entry.young_people?.focus_id}
                </CardDescription>
              </div>
              {entry.significance && (
                <Badge variant={getSignificanceColor(entry.significance) as any} className="text-sm">
                  {entry.significance} Significance
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {entry.summary && (
              <div>
                <h3 className="font-semibold text-lg mb-2">{entry.summary}</h3>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Date:</span>
                <span>{format(new Date(entry.entry_date), "PPP")}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Time:</span>
                <span>{entry.entry_time}</span>
              </div>

              {entry.category && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Category:</span>
                  <Badge variant="outline">{entry.category}</Badge>
                </div>
              )}

              {entry.entry_type && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Type:</span>
                  <Badge variant="outline">{entry.entry_type}</Badge>
                </div>
              )}

              {entry.author_name && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Author:</span>
                  <span>{entry.author_name}</span>
                </div>
              )}

              {entry.flagged_for_report && (
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="default" className="bg-yellow-500">★ Flagged for Report</Badge>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-semibold mb-2">Details / Observation</h4>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-muted-foreground">{entry.observation}</p>
              </div>
            </div>

            {entry.tags && entry.tags.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Tags:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
