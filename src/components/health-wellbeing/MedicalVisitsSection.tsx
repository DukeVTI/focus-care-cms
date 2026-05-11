import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Stethoscope, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { visitTypeOptions } from "@/lib/healthDropdownOptions";
import { format } from "date-fns";

interface MedicalVisit {
  id: string;
  visit_type: string;
  date_of_visit: string;
  provider_name: string;
  outcome_notes: string | null;
  next_appointment_date: string | null;
  created_at: string;
}

interface MedicalVisitsSectionProps {
  youngPersonId: string;
  visits: MedicalVisit[];
  onRefresh: () => void;
}

export function MedicalVisitsSection({ youngPersonId, visits, onRefresh }: MedicalVisitsSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [visitType, setVisitType] = useState("");
  const [dateOfVisit, setDateOfVisit] = useState("");
  const [providerName, setProviderName] = useState("");
  const [outcomeNotes, setOutcomeNotes] = useState("");
  const [nextAppointmentDate, setNextAppointmentDate] = useState("");

  const handleSave = async () => {
    if (!visitType || !dateOfVisit || !providerName) {
      toast({ title: "Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("medical_appointment_logs").insert({
      young_person_id: youngPersonId,
      visit_type: visitType,
      date_of_visit: dateOfVisit,
      provider_name: providerName,
      outcome_notes: outcomeNotes || null,
      next_appointment_date: nextAppointmentDate || null,
      recorded_by: user?.id,
    });

    if (error) {
      toast({ title: "Error", description: "Failed to save medical visit.", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Medical visit recorded." });
      resetForm();
      onRefresh();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("medical_appointment_logs").delete().eq("id", id);
    if (!error) {
      toast({ title: "Deleted", description: "Visit removed." });
      onRefresh();
    }
  };

  const resetForm = () => {
    setVisitType("");
    setDateOfVisit("");
    setProviderName("");
    setOutcomeNotes("");
    setNextAppointmentDate("");
    setShowForm(false);
  };

  const getVisitBadgeColor = (type: string) => {
    switch (type) {
      case "gp": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "hospital": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "dental": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "optician": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getVisitLabel = (type: string) => visitTypeOptions.find(o => o.value === type)?.label || type;

  // Group visits by type for dental/optician future appointment tracking
  const upcomingAppointments = visits.filter(v => v.next_appointment_date && new Date(v.next_appointment_date) >= new Date());

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Stethoscope className="h-5 w-5" />
            Medical Visits Log
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{visits.length} visits</Badge>
            <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-1" />
              Log Visit
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upcoming Appointments Alert */}
        {upcomingAppointments.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Upcoming Appointments</p>
            </div>
            <div className="space-y-1">
              {upcomingAppointments.map(apt => (
                <p key={apt.id} className="text-xs text-blue-700 dark:text-blue-300">
                  {getVisitLabel(apt.visit_type)} at {apt.provider_name} — {format(new Date(apt.next_appointment_date!), "dd MMM yyyy")}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Add Form */}
        {showForm && (
          <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Visit Type *</Label>
                <Select value={visitType} onValueChange={setVisitType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {visitTypeOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date of Visit *</Label>
                <Input type="date" value={dateOfVisit} onChange={(e) => setDateOfVisit(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Provider Name *</Label>
                <Input value={providerName} onChange={(e) => setProviderName(e.target.value)} placeholder="e.g. Dr. Smith, St Thomas Hospital" />
              </div>
              <div className="space-y-2">
                <Label>Next Appointment Date</Label>
                <Input type="date" value={nextAppointmentDate} onChange={(e) => setNextAppointmentDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Outcome Notes</Label>
              <Textarea
                value={outcomeNotes}
                onChange={(e) => setOutcomeNotes(e.target.value)}
                placeholder="Summary of the visit, diagnosis, or treatment plan..."
                className="min-h-[80px]"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={resetForm}>Cancel</Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Visit"}
              </Button>
            </div>
          </div>
        )}

        {/* Existing Visits */}
        {visits.length === 0 && !showForm ? (
          <p className="text-sm text-muted-foreground text-center py-6">No medical visits logged yet.</p>
        ) : (
          <div className="space-y-3">
            {visits.map((visit) => (
              <div key={visit.id} className="border rounded-lg p-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getVisitBadgeColor(visit.visit_type)}`}>
                      {getVisitLabel(visit.visit_type)}
                    </span>
                    <p className="font-medium text-sm">{visit.provider_name}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Visit date: {format(new Date(visit.date_of_visit), "dd MMM yyyy")}
                  </p>
                  {visit.outcome_notes && (
                    <p className="text-sm text-muted-foreground mt-2">{visit.outcome_notes}</p>
                  )}
                  {visit.next_appointment_date && (
                    <p className="text-xs text-primary mt-1">
                      Next appointment: {format(new Date(visit.next_appointment_date), "dd MMM yyyy")}
                    </p>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(visit.id)} className="text-destructive hover:text-destructive shrink-0">
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
