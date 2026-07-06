import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Plus, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface SafeguardingRisksWidgetProps {
  youngPersonId: string;
}

interface Risk {
  id: string;
  risk_category: string;
  description: string;
  mitigation_plan: string | null;
  date_added: string;
  is_active: boolean | null;
  severity: string | null;
}

const RISK_CATEGORIES = [
  "Physical Safety",
  "Emotional Wellbeing",
  "Online Safety",
  "Substance Misuse",
  "Criminal Exploitation",
  "Sexual Exploitation",
  "Missing Episodes",
  "Self-Harm",
  "Mental Health",
  "Other"
];

export const SafeguardingRisksWidget = ({ youngPersonId }: SafeguardingRisksWidgetProps) => {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    risk_category: "",
    description: "",
    mitigation_plan: "",
    date_added: new Date().toISOString().split('T')[0],
    severity: "Medium"
  });

  useEffect(() => {
    fetchRisks();
  }, [youngPersonId]);

  const fetchRisks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("safeguarding_risks")
      .select("*")
      .eq("young_person_id", youngPersonId)
      .eq("is_active", true)
      .order("date_added", { ascending: false });

    if (!error && data) {
      setRisks(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const payload = {
      ...formData,
      young_person_id: youngPersonId,
      added_by: user.id,
      is_active: true
    };

    let error;
    if (editingRisk) {
      ({ error } = await supabase
        .from("safeguarding_risks")
        .update(payload)
        .eq("id", editingRisk.id));
    } else {
      ({ error } = await supabase
        .from("safeguarding_risks")
        .insert([payload]));
    }

    if (error) {
      toast({
        title: "Error",
        description: "Could not save risk entry",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: `Risk entry ${editingRisk ? 'updated' : 'added'} successfully`,
    });

    setDialogOpen(false);
    setEditingRisk(null);
    setFormData({
      risk_category: "",
      description: "",
      mitigation_plan: "",
      date_added: new Date().toISOString().split('T')[0],
      severity: "Medium"
    });
    fetchRisks();
  };

  const handleEdit = (risk: Risk) => {
    setEditingRisk(risk);
    setFormData({
      risk_category: risk.risk_category,
      description: risk.description,
      mitigation_plan: risk.mitigation_plan || "",
      date_added: risk.date_added,
      severity: risk.severity || "Medium"
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("safeguarding_risks")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Could not delete risk entry",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Risk entry removed",
    });
    fetchRisks();
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Safeguarding & Risks
            </CardTitle>
            <CardDescription>Active risk factors and mitigation plans</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => {
                setEditingRisk(null);
                setFormData({
                  risk_category: "",
                  description: "",
                  mitigation_plan: "",
                  date_added: new Date().toISOString().split('T')[0],
                  severity: "Medium"
                });
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingRisk ? 'Edit' : 'Add'} Risk Entry</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Risk Category *</Label>
                  <Select 
                    value={formData.risk_category} 
                    onValueChange={(value) => setFormData({...formData, risk_category: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {RISK_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Description *</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe the risk..."
                    required
                  />
                </div>
                <div>
                  <Label>Mitigation Plan</Label>
                  <Textarea
                    value={formData.mitigation_plan}
                    onChange={(e) => setFormData({...formData, mitigation_plan: e.target.value})}
                    placeholder="What steps are being taken to mitigate this risk?"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Severity *</Label>
                    <Select value={formData.severity} onValueChange={(value) => setFormData({ ...formData, severity: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Date Added *</Label>
                    <Input
                      type="date"
                      value={formData.date_added}
                      onChange={(e) => setFormData({...formData, date_added: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingRisk ? 'Update' : 'Add'} Risk
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading risks...</p>
          </div>
        ) : risks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No active risks recorded</p>
          </div>
        ) : (
          <div className="space-y-3">
            {risks.map((risk) => (
              <div key={risk.id} className="border rounded-lg p-4 bg-card hover:bg-accent/30 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-md text-xs font-medium">
                        {risk.risk_category}
                      </span>
                      {risk.severity && (
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                          risk.severity === "High" ? "bg-destructive/10 text-destructive" :
                          risk.severity === "Medium" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {risk.severity}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(risk.date_added), "dd MMM yyyy")}
                      </span>
                    </div>
                    <p className="text-sm">{risk.description}</p>
                    {risk.mitigation_plan && (
                      <div className="mt-2 p-2.5 bg-muted/50 rounded-md">
                        <p className="font-medium text-xs text-muted-foreground mb-1">Mitigation Plan:</p>
                        <p className="text-sm">{risk.mitigation_plan}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(risk)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(risk.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
