import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ModuleHeader } from "@/components/ModuleHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";
import { FileText, Send, Save, BrainCircuit, Calendar as CalendarIcon, CheckCircle2 } from "lucide-react";

export default function MonthlyReports() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isManager, setIsManager] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editGoals, setEditGoals] = useState(["", "", ""]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      checkRole();
      fetchReports();
    }
  }, [user]);

  const checkRole = async () => {
    try {
      const { data } = await supabase.rpc("has_role", {
        _user_id: user?.id || "",
        _role: "manager",
      });
      setIsManager(data === true);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchReports = async () => {
    setLoadingData(true);
    const { data, error } = await supabase
      .from("monthly_reports")
      .select(`
        *,
        young_people:young_person_id (first_name, last_name)
      `)
      .order("report_month", { ascending: false });

    if (!error && data) {
      setReports(data);
    }
    setLoadingData(false);
  };

  const startEditing = (report: any) => {
    setEditingId(report.id);
    setEditContent(report.final_content || report.ai_draft_content || "");
    const goals = report.smart_goals || [];
    setEditGoals([
      goals[0]?.goal || "",
      goals[1]?.goal || "",
      goals[2]?.goal || "",
    ]);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent("");
    setEditGoals(["", "", ""]);
  };

  const saveReport = async (reportId: string, publish: boolean = false) => {
    setSaving(true);
    const formattedGoals = editGoals.filter(g => g.trim() !== "").map(g => ({ goal: g, target_date: null }));
    
    const updates = {
      final_content: editContent,
      smart_goals: formattedGoals,
      status: publish ? "published" : "draft",
    };

    const { error } = await supabase
      .from("monthly_reports")
      .update(updates)
      .eq("id", reportId);

    if (error) {
      toast.error(`Failed to ${publish ? 'publish' : 'save'}: ${error.message}`);
    } else {
      toast.success(publish ? "Report published successfully" : "Draft saved");
      setEditingId(null);
      fetchReports();
    }
    setSaving(false);
  };

  const triggerGeneration = async () => {
    if (!isManager) {
      toast.error("Only managers can manually trigger generation");
      return;
    }
    
    toast.info("Triggering LLM generation. This may take a minute...");
    // Mock for now, in a real scenario this would call the edge function via supabase.functions.invoke
    try {
      const { error } = await supabase.functions.invoke('generate-monthly-report');
      if (error) throw error;
      toast.success("Generation completed");
      fetchReports();
    } catch (err: any) {
      toast.error(`Generation failed: ${err.message}`);
    }
  };

  if (loading || loadingData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <ModuleHeader />
      <div className="container py-8 px-4 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <BrainCircuit className="h-8 w-8 text-primary" />
              AI Monthly Reports
            </h1>
            <p className="text-muted-foreground">
              Review and publish AI-generated monthly progress reports.
            </p>
          </div>
          {isManager && (
            <Button onClick={triggerGeneration} variant="outline" className="gap-2">
              <BrainCircuit className="h-4 w-4" />
              Force Generate
            </Button>
          )}
        </div>

        {reports.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="pt-6">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Reports Available</h3>
              <p className="text-muted-foreground mb-4">
                Monthly reports are generated automatically on the 1st of every month.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {reports.map((report) => (
              <Card key={report.id} className={report.status === "published" ? "border-l-4 border-l-success" : "border-l-4 border-l-warning"}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        {report.young_people?.first_name} {report.young_people?.last_name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        {format(new Date(report.report_month), "MMMM yyyy")}
                      </CardDescription>
                    </div>
                    <Badge variant={report.status === "published" ? "default" : "secondary"}>
                      {report.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Utilization Metrics summary */}
                  {report.utilization_metrics && Object.keys(report.utilization_metrics).length > 0 && (
                    <div className="flex gap-4 mb-4 p-3 bg-muted/50 rounded-lg text-sm">
                      <div><span className="text-muted-foreground">Task Success:</span> <span className="font-medium">{report.utilization_metrics.task_success_rate || 0}%</span></div>
                      <div><span className="text-muted-foreground">Night Checks:</span> <span className="font-medium">{report.utilization_metrics.night_checks || 0}</span></div>
                      <div><span className="text-muted-foreground">Crises:</span> <span className="font-medium text-destructive">{report.utilization_metrics.crisis_events || 0}</span></div>
                    </div>
                  )}

                  {editingId === report.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Letter Content</label>
                        <Textarea 
                          value={editContent} 
                          onChange={(e) => setEditContent(e.target.value)} 
                          className="min-h-[200px]"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">SMART Goals for Next Month</label>
                        <div className="space-y-2">
                          {[0, 1, 2].map(i => (
                            <Input 
                              key={i} 
                              placeholder={`Goal ${i+1}`} 
                              value={editGoals[i]} 
                              onChange={(e) => {
                                const newGoals = [...editGoals];
                                newGoals[i] = e.target.value;
                                setEditGoals(newGoals);
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={cancelEditing} disabled={saving}>Cancel</Button>
                        <Button variant="secondary" onClick={() => saveReport(report.id, false)} disabled={saving} className="gap-2">
                          <Save className="h-4 w-4" /> Save Draft
                        </Button>
                        <Button onClick={() => saveReport(report.id, true)} disabled={saving} className="gap-2">
                          <CheckCircle2 className="h-4 w-4" /> Publish
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="whitespace-pre-wrap text-sm text-foreground/90 bg-card border rounded-lg p-4">
                        {report.final_content || report.ai_draft_content || "No content generated yet."}
                      </div>
                      
                      {report.smart_goals && report.smart_goals.length > 0 && (
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-primary mb-2">SMART Goals</h4>
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            {report.smart_goals.map((g: any, i: number) => (
                              <li key={i}>{g.goal}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {report.status !== "published" && (
                        <div className="flex justify-end pt-2">
                          <Button onClick={() => startEditing(report)} variant="outline" className="gap-2">
                            Review & Edit Draft
                          </Button>
                        </div>
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
