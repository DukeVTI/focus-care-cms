import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/untypedClient";
import { useAuth } from "@/contexts/AuthContext";
import { categoryOptions, categoryLabels, severityLabels } from "@/lib/healthDropdownOptions";
import { format } from "date-fns";

interface HealthEntry {
  id: string;
  condition_name: string;
  free_text_condition: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
  recorded_by: string;
}

interface HealthConditionSectionProps {
  category: "physical" | "substance" | "mental_health";
  youngPersonId: string;
  entries: HealthEntry[];
  onRefresh: () => void;
}

export function HealthConditionSection({ category, youngPersonId, entries, onRefresh }: HealthConditionSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [conditionName, setConditionName] = useState("");
  const [freeTextCondition, setFreeTextCondition] = useState("");
  const [rating, setRating] = useState(1);
  const [comment, setComment] = useState("");

  const options = categoryOptions[category];
  const title = categoryLabels[category];

  const handleSave = async () => {
    if (!conditionName) {
      toast({ title: "Error", description: "Please select a condition.", variant: "destructive" });
      return;
    }
    if (conditionName === "Other" && !freeTextCondition.trim()) {
      toast({ title: "Error", description: "Please specify the condition.", variant: "destructive" });
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("health_condition_entries").insert({
      young_person_id: youngPersonId,
      category,
      condition_name: conditionName,
      free_text_condition: conditionName === "Other" ? freeTextCondition : null,
      rating,
      comment: comment || null,
      recorded_by: user?.id,
    });

    if (error) {
      toast({ title: "Error", description: "Failed to save condition.", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Condition recorded successfully." });
      resetForm();
      onRefresh();

      // Risk trigger: rating of 5 triggers alert + creates persistent alert
      if (rating === 5) {
        toast({
          title: "⚠️ High Severity Alert",
          description: "A severity rating of 5 (Crisis) has been recorded. Please review and update the Risk Assessment immediately.",
          variant: "destructive",
        });
        // Create a persistent alert in the alerts table
        const displayCondition = conditionName === "Other" ? freeTextCondition : conditionName;
        await supabase.from("alerts").insert({
          user_id: user?.id,
          young_person_id: youngPersonId,
          alert_type: "health_crisis",
          title: `Crisis-Level Health Rating: ${displayCondition}`,
          message: `A severity rating of 5 (Crisis) was recorded for "${displayCondition}" in ${title}. Mandatory Risk Assessment review required.`,
          severity: "critical",
        });
      }
    }
    setSaving(false);
  };

  const handleDelete = async (entryId: string) => {
    const { error } = await supabase.from("health_condition_entries").delete().eq("id", entryId);
    if (!error) {
      toast({ title: "Deleted", description: "Entry removed." });
      onRefresh();
    }
  };

  const resetForm = () => {
    setConditionName("");
    setFreeTextCondition("");
    setRating(1);
    setComment("");
    setShowForm(false);
  };

  const getSeverityColor = (r: number) => {
    if (r <= 1) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
    if (r <= 2) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    if (r <= 3) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    if (r <= 4) return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{entries.length} recorded</Badge>
            <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Form */}
        {showForm && (
          <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Condition</Label>
                <Select value={conditionName} onValueChange={setConditionName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition..." />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {conditionName === "Other" && (
                <div className="space-y-2">
                  <Label>Specify Condition</Label>
                  <Input
                    value={freeTextCondition}
                    onChange={(e) => setFreeTextCondition(e.target.value)}
                    placeholder="Enter condition name..."
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Severity Rating (1-5)</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRating(r)}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium border transition-all ${
                      rating === r
                        ? getSeverityColor(r) + " border-current ring-2 ring-current/20"
                        : "bg-background border-border hover:bg-muted"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{severityLabels[rating]}</p>
              {rating >= 4 && (
                <div className="flex items-center gap-2 text-xs text-destructive">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {rating === 5 ? "Crisis level — Risk Assessment review will be triggered" : "Significant impact — consider updating Risk Assessment"}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Comments</Label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Detail the condition's history, current impact, and treatment..."
                className="min-h-[80px]"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={resetForm}>Cancel</Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Condition"}
              </Button>
            </div>
          </div>
        )}

        {/* Existing Entries */}
        {entries.length === 0 && !showForm ? (
          <p className="text-sm text-muted-foreground text-center py-6">No {title.toLowerCase()} recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div key={entry.id} className="border rounded-lg p-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-medium text-sm">
                      {entry.condition_name === "Other" ? entry.free_text_condition : entry.condition_name}
                    </p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getSeverityColor(entry.rating)}`}>
                      Rating: {entry.rating}/5
                    </span>
                  </div>
                  {entry.comment && (
                    <p className="text-sm text-muted-foreground mt-1">{entry.comment}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Recorded: {format(new Date(entry.created_at), "dd MMM yyyy HH:mm")}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(entry.id)} className="text-destructive hover:text-destructive shrink-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
