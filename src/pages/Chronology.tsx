import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Calendar, Clock, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/untypedClient";
import { format } from "date-fns";
import { ModuleHeader } from "@/components/ModuleHeader";
import { useToast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 10;

export default function Chronology() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [entries, setEntries] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user, currentPage]);

  const fetchEntries = async () => {
    setLoadingData(true);
    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    // Get total count
    const { count } = await supabase
      .from("chronology_entries")
      .select("*", { count: "exact", head: true })
      .eq("staff_id", user?.id);

    if (count !== null) {
      setTotalCount(count);
    }

    // Get paginated data
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
      .eq("staff_id", user?.id)
      .order("entry_date", { ascending: false })
      .order("entry_time", { ascending: false })
      .range(from, to);
    
    if (!error && data) {
      setEntries(data);
    }
    setLoadingData(false);
  };

  const exportToCSV = async () => {
    try {
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
        .eq("staff_id", user?.id)
        .order("entry_date", { ascending: false })
        .order("entry_time", { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: "No data",
          description: "There are no chronology entries to export",
          variant: "destructive"
        });
        return;
      }

      // Create CSV content
      const headers = ["Date", "Time", "Young Person", "Focus ID", "Significance", "Observation", "Tags", "Author"];
      const rows = data.map((entry: any) => [
        format(new Date(entry.entry_date), "dd/MM/yyyy"),
        entry.entry_time,
        `${entry.young_people?.first_name || ""} ${entry.young_people?.last_name || ""}`,
        entry.young_people?.focus_id || "",
        entry.significance || "",
        `"${entry.observation?.replace(/"/g, '""') || ""}"`,
        entry.tags?.join(", ") || "",
        entry.author_name || ""
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
      ].join("\n");

      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `chronology_export_${format(new Date(), "yyyy-MM-dd")}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: "Chronology entries exported successfully"
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Error",
        description: "Failed to export chronology entries",
        variant: "destructive"
      });
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <ModuleHeader />
      <div className="container py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Chronology</h1>
            <p className="text-muted-foreground">Daily observations and significant events</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={() => navigate("/chronology/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </div>
        </div>

        {entries.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="pt-6">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No entries yet</h3>
              <p className="text-muted-foreground mb-4">
                Start logging daily observations and significant events
              </p>
              <Button onClick={() => navigate("/chronology/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <Card
                key={entry.id}
                className="cursor-pointer transition-all hover:shadow-md"
                onClick={() => navigate(`/chronology/${entry.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {entry.young_people?.first_name} {entry.young_people?.last_name}
                      </CardTitle>
                      <CardDescription className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(entry.entry_date), "PPP")}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {entry.entry_time}
                        </div>
                      </CardDescription>
                    </div>
                    {entry.significance && (
                      <Badge variant={getSignificanceColor(entry.significance) as any}>
                        {entry.significance} Significance
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                    {entry.observation}
                  </p>
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {entry.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalCount > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between mt-8">
            <p className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} entries
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalCount / ITEMS_PER_PAGE), p + 1))}
                disabled={currentPage >= Math.ceil(totalCount / ITEMS_PER_PAGE)}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}