import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Calendar, Clock, Download, ChevronLeft, ChevronRight, FileDown, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ModuleHeader } from "@/components/ModuleHeader";
import { useToast } from "@/hooks/use-toast";
import { generateChronologyPDF } from "@/utils/chronologyExport";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RISK_LEVEL_BADGE_VARIANTS } from "@/lib/constants";
import { ChronologyEntryDetail, BadgeVariant } from "@/lib/types";

const ITEMS_PER_PAGE = 10;

export default function Chronology() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [entries, setEntries] = useState<ChronologyEntryDetail[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<ChronologyEntryDetail[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters
  const [searchText, setSearchText] = useState("");
  const [filterAuthor, setFilterAuthor] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterTag, setFilterTag] = useState("all");
  const [authors, setAuthors] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [entries, searchText, filterAuthor, filterCategory, filterTag]);

  const applyFilters = () => {
    let filtered = [...entries];

    if (searchText) {
      filtered = filtered.filter(entry =>
        entry.summary?.toLowerCase().includes(searchText.toLowerCase()) ||
        entry.observation?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (filterAuthor !== "all") {
      filtered = filtered.filter(entry => entry.author_name === filterAuthor);
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter(entry => entry.category === filterCategory);
    }

    if (filterTag !== "all") {
      filtered = filtered.filter(entry => entry.tags?.includes(filterTag));
    }

    setFilteredEntries(filtered);
    setTotalCount(filtered.length);
  };

  const fetchEntries = async () => {
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
      .eq("staff_id", user?.id ?? "")
      .order("entry_date", { ascending: false })
      .order("entry_time", { ascending: false });
    
    if (!error && data) {
      setEntries(data as any);
      setFilteredEntries(data as any);
      setTotalCount(data.length);
      
      // Extract unique authors, categories, and tags for filters
      const uniqueAuthors = [...new Set(data.map(e => e.author_name).filter(Boolean))];
      const uniqueCategories = [...new Set(data.map(e => e.category).filter(Boolean))];
      const uniqueTags = [...new Set(data.flatMap(e => e.tags || []))];
      
      setAuthors(uniqueAuthors as string[]);
      setCategories(uniqueCategories as string[]);
      setAllTags(uniqueTags as string[]);
    }
    setLoadingData(false);
  };

  const exportToCSV = async () => {
    try {
      if (!filteredEntries || filteredEntries.length === 0) {
        toast({
          title: "No data",
          description: "There are no chronology entries to export",
          variant: "destructive"
        });
        return;
      }

      // Create CSV content with new fields
      const headers = ["Date", "Time", "Young Person", "Focus ID", "Category", "Type", "Summary", "Details", "Significance", "Tags", "Author", "Flagged"];
      const rows = filteredEntries.map((entry: any) => [
        format(new Date(entry.entry_date), "dd/MM/yyyy"),
        entry.entry_time,
        `${entry.young_people?.first_name || ""} ${entry.young_people?.last_name || ""}`,
        entry.young_people?.focus_id || "",
        entry.category || "",
        entry.entry_type || "",
        `"${entry.summary?.replace(/"/g, '""') || ""}"`,
        `"${entry.observation?.replace(/"/g, '""') || ""}"`,
        entry.significance || "",
        entry.tags?.join(", ") || "",
        entry.author_name || "",
        entry.flagged_for_report ? "Yes" : "No"
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
      link.setAttribute("download", `chronology-${format(new Date(), "yyyy-MM-dd")}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: "Chronology exported successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to export chronology",
        variant: "destructive"
      });
    }
  };

  const exportToPDF = () => {
    if (!filteredEntries || filteredEntries.length === 0) {
      toast({
        title: "No data",
        description: "There are no chronology entries to export",
        variant: "destructive"
      });
      return;
    }

    generateChronologyPDF(filteredEntries);
    toast({
      title: "Success",
      description: "PDF report generated successfully"
    });
  };

  const getSignificanceColor = (significance: string): BadgeVariant => {
    return RISK_LEVEL_BADGE_VARIANTS[significance as keyof typeof RISK_LEVEL_BADGE_VARIANTS] || "secondary";
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
            <Button variant="outline" onClick={exportToPDF}>
              <FileDown className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button onClick={() => navigate("/chronology/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search summary or details..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={filterAuthor} onValueChange={setFilterAuthor}>
                <SelectTrigger>
                  <SelectValue placeholder="All Authors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Authors</SelectItem>
                  {authors.map(author => (
                    <SelectItem key={author} value={author}>{author}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterTag} onValueChange={setFilterTag}>
                <SelectTrigger>
                  <SelectValue placeholder="All Tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {allTags.map(tag => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {(searchText || filterAuthor !== "all" || filterCategory !== "all" || filterTag !== "all") && (
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <span>Showing {filteredEntries.length} of {entries.length} entries</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchText("");
                    setFilterAuthor("all");
                    setFilterCategory("all");
                    setFilterTag("all");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {filteredEntries.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="pt-6">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {entries.length === 0 ? "No entries yet" : "No matching entries"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {entries.length === 0 
                  ? "Start logging daily observations and significant events"
                  : "Try adjusting your filters"
                }
              </p>
              {entries.length === 0 && (
                <Button onClick={() => navigate("/chronology/new")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <Card
                key={entry.id}
                className="cursor-pointer transition-all hover:shadow-md"
                onClick={() => navigate(`/chronology/${entry.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">
                          {entry.young_people?.first_name} {entry.young_people?.last_name}
                        </CardTitle>
                        {entry.flagged_for_report && (
                          <Badge variant="default" className="bg-yellow-500">★ Flagged</Badge>
                        )}
                      </div>
                      {entry.summary && (
                        <p className="font-semibold text-sm mb-2">{entry.summary}</p>
                      )}
                      <CardDescription className="space-y-1">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(entry.entry_date), "PPP")}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {entry.entry_time}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          {entry.category && <Badge variant="outline">{entry.category}</Badge>}
                          {entry.entry_type && <Badge variant="outline">{entry.entry_type}</Badge>}
                        </div>
                      </CardDescription>
                    </div>
                    {entry.significance && (
                      <Badge variant={getSignificanceColor(entry.significance)}>
                        {entry.significance}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
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