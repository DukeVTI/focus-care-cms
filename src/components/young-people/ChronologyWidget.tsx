import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ChronologyEntryWithYoungPerson } from "@/lib/types";

interface ChronologyWidgetProps {
  youngPersonId: string;
}

export function ChronologyWidget({ youngPersonId }: ChronologyWidgetProps) {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<ChronologyEntryWithYoungPerson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentEntries();
  }, [youngPersonId]);

  const fetchRecentEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("chronology_entries")
      .select("*")
      .eq("young_person_id", youngPersonId)
      .order("entry_date", { ascending: false })
      .order("entry_time", { ascending: false })
      .limit(3);
    
    if (!error && data) {
      setEntries(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Chronology</CardTitle>
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
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Recent Chronology</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/chronology")}
          >
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              No chronology entries yet
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/chronology/new")}
            >
              Add First Entry
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="p-3 rounded-lg border bg-card hover:bg-accent/5 cursor-pointer transition-colors"
                onClick={() => navigate(`/chronology/${entry.id}`)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(entry.entry_date), "PP")}
                    <Clock className="h-3 w-3 ml-2" />
                    {entry.entry_time}
                  </div>
                  {entry.significance && (
                    <Badge
                      variant={
                        entry.significance === "High"
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {entry.significance}
                    </Badge>
                  )}
                </div>
                <p className="text-sm line-clamp-2">{entry.observation}</p>
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {entry.tags.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {entry.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{entry.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
