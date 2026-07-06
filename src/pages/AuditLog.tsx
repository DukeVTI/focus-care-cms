import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ModuleHeader } from "@/components/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { AlertCircle, ArrowUpDown } from "lucide-react";
import { BadgeVariant } from "@/lib/types";

interface AuditEntry {
  id: string;
  created_at: string;
  user_id: string;
  actor_name: string | null;
  action: string;
  record_type: string;
  record_id: string;
  field_changed: string | null;
  old_value: string | null;
  new_value: string | null;
  notes: string | null;
}

const ITEMS_PER_PAGE = 25;

const ACTION_TYPES = [
  "INSERT",
  "UPDATE",
  "DELETE",
];

const RECORD_TYPES = [
  "young_people",
  "tasks",
  "missing_episodes",
  "risk_assessments",
  "chronology_entries",
  "keywork_sessions",
  "health_condition_entries",
  "medical_appointment_logs",
  "young_person_medications",
  "young_person_documents",
  "profiles",
  "user_roles",
  "safeguarding_risks",
  "mood_entries",
  "calendar_events",
  "alerts",
];

export default function AuditLog() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [auditData, setAuditData] = useState<AuditEntry[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filter states
  const [searchActor, setSearchActor] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [selectedRecordType, setSelectedRecordType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState<"timestamp" | "actor">("timestamp");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Check admin access
  useEffect(() => {
    if (user) {
      checkAdminAccess();
    }
  }, [user]);

  const checkAdminAccess = async () => {
    try {
      const result = await supabase.rpc("has_role", {
        _user_id: user?.id || "",
        _role: "admin",
      });
      if (result.data !== true) {
        navigate("/dashboard");
        return;
      }
      setIsAdmin(true);
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate("/dashboard");
    }
  };

  // Fetch audit log
  useEffect(() => {
    if (isAdmin) {
      fetchAuditLog();
    }
  }, [isAdmin, currentPage, searchActor, selectedAction, selectedRecordType, startDate, endDate, sortBy, sortOrder]);

  const fetchAuditLog = async () => {
    setDataLoading(true);
    try {
      let query = supabase.from("audit_log").select("*", { count: "exact" });

      // Apply filters
      if (searchActor.trim()) {
        query = query.ilike("actor_name", `%${searchActor}%`);
      }

      if (selectedAction) {
        query = query.eq("action", selectedAction);
      }

      if (selectedRecordType) {
        query = query.eq("record_type", selectedRecordType);
      }

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query = query.gte("created_at", start.toISOString());
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query = query.lte("created_at", end.toISOString());
      }

      // Apply sorting
      const orderParam = sortOrder === "asc" ? { ascending: true } : { ascending: false };
      if (sortBy === "timestamp") {
        query = query.order("created_at", orderParam);
      } else if (sortBy === "actor") {
        query = query.order("actor_name", { ascending: sortOrder === "asc" });
      }

      // Apply pagination
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      query = query.range(offset, offset + ITEMS_PER_PAGE - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      setAuditData(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error fetching audit log:", error);
      setAuditData([]);
    } finally {
      setDataLoading(false);
    }
  };

  const toggleSort = (sortKey: "timestamp" | "actor") => {
    if (sortBy === sortKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(sortKey);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchActor("");
    setSelectedAction("");
    setSelectedRecordType("");
    setStartDate("");
    setEndDate("");
    setSortBy("timestamp");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  const getActionColor = (action: string): BadgeVariant => {
    switch (action) {
      case "INSERT":
        return "default";
      case "UPDATE":
        return "secondary";
      case "DELETE":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "INSERT":
        return "Created";
      case "UPDATE":
        return "Updated";
      case "DELETE":
        return "Deleted";
      default:
        return action;
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  if (loading || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <ModuleHeader />
      <div className="container py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Audit Log</h1>
          <p className="text-muted-foreground">Monitor all system changes and user activities</p>
        </div>

        {/* Filters Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-6">
              {/* Actor Name */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Actor Name
                </label>
                <Input
                  placeholder="Search by staff name..."
                  value={searchActor}
                  onChange={(e) => {
                    setSearchActor(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-9"
                />
              </div>

              {/* Action Type */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Action Type
                </label>
                <Select
                  value={selectedAction}
                  onValueChange={(val) => {
                    setSelectedAction(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All actions</SelectItem>
                    {ACTION_TYPES.map((action) => (
                      <SelectItem key={action} value={action}>
                        {getActionLabel(action)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Record Type */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Record Type
                </label>
                <Select
                  value={selectedRecordType}
                  onValueChange={(val) => {
                    setSelectedRecordType(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    {RECORD_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  From Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-9"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  To Date
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-9"
                />
              </div>

              {/* Reset Button */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="w-full h-9"
                >
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Info */}
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{" "}
          {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} entries
        </div>

        {/* Table Card */}
        <Card>
          <CardContent className="p-0">
            {dataLoading ? (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">Loading audit log...</p>
              </div>
            ) : auditData.length === 0 ? (
              <div className="p-12 text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">No audit log entries found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground cursor-pointer hover:bg-muted/70" onClick={() => toggleSort("timestamp")}>
                        <div className="flex items-center gap-2">
                          Timestamp
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground cursor-pointer hover:bg-muted/70" onClick={() => toggleSort("actor")}>
                        <div className="flex items-center gap-2">
                          Actor
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Action</th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Record Type</th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Field Changed</th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Old Value</th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">New Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditData.map((entry, idx) => (
                      <tr key={`${entry.id}-${idx}`} className="border-b hover:bg-accent/50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-xs">
                          {format(new Date(entry.created_at), "PPp")}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {entry.actor_name || "Unknown"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={getActionColor(entry.action)}>
                            {getActionLabel(entry.action)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                          {entry.record_type}
                        </td>
                        <td className="px-4 py-3 text-xs font-mono">
                          {entry.field_changed || (entry.action === "DELETE" ? "N/A" : "-")}
                        </td>
                        <td className="px-4 py-3 text-xs max-w-xs truncate">
                          {entry.old_value ? (
                            <code className="bg-muted px-2 py-1 rounded text-xs">
                              {entry.old_value.length > 50
                                ? entry.old_value.substring(0, 50) + "..."
                                : entry.old_value}
                            </code>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs max-w-xs truncate">
                          {entry.new_value ? (
                            <code className="bg-muted px-2 py-1 rounded text-xs">
                              {entry.new_value.length > 50
                                ? entry.new_value.substring(0, 50) + "..."
                                : entry.new_value}
                            </code>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                  )
                  .map((page, idx, arr) => (
                    <div key={page}>
                      {idx > 0 && arr[idx - 1] !== page - 1 && (
                        <PaginationItem>
                          <span className="px-2 py-1">...</span>
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={page === currentPage}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    </div>
                  ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
