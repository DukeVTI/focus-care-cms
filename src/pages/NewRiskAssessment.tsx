import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/untypedClient";
import { ModuleHeader } from "@/components/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

const DEFAULT_SECTIONS = [
  { key: "safety_missing", label: "Safety & Missing Episodes", weight: 1 },
  { key: "mental_health", label: "Mental Health & Wellbeing", weight: 1.2 },
  { key: "substance_use", label: "Substance Use", weight: 1.1 },
  { key: "peer_relationships", label: "Peer/Relationship Risks", weight: 0.9 },
  { key: "education", label: "Education/Attendance Risks", weight: 0.8 },
  { key: "online_safety", label: "Online/Social Media Risks", weight: 1 },
  { key: "environmental", label: "Environmental/Family Factors", weight: 1 },
  { key: "other", label: "Other Identified Risks", weight: 0.7 }
];

const sectionSchema = z.object({
  score: z.number().min(0).max(5),
  notes: z.string().max(800).optional(),
  flags: z.array(z.string()).optional()
});

const formSchema = z.object({
  young_person_id: z.string().min(1, "Please select a young person"),
  assessment_date: z.string().min(1, "Assessment date is required"),
  sections: z.record(sectionSchema),
  recommendations: z.string().max(2000).optional(),
  follow_up_needed: z.boolean().default(false),
  task_title: z.string().optional(),
  task_due_date: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

export default function NewRiskAssessment() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [youngPeople, setYoungPeople] = useState<any[]>([]);
  const [selectedYP, setSelectedYP] = useState<any>(null);
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [saving, setSaving] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const preselectedYP = searchParams.get("yp");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      young_person_id: preselectedYP || "",
      assessment_date: new Date().toISOString().split('T')[0],
      sections: DEFAULT_SECTIONS.reduce((acc, section) => ({
        ...acc,
        [section.key]: { score: 0, notes: "", flags: [] }
      }), {}),
      recommendations: "",
      follow_up_needed: false
    }
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchYoungPeople();
      loadConfig();
    }
  }, [user]);

  const fetchYoungPeople = async () => {
    const { data } = await supabase
      .from("young_people")
      .select("id, first_name, last_name, focus_id")
      .eq("user_id", user!.id)
      .order("first_name");
    
    if (data) {
      setYoungPeople(data);
      if (preselectedYP) {
        const yp = data.find(y => y.id === preselectedYP);
        if (yp) setSelectedYP(yp);
      }
    }
  };

  const loadConfig = async () => {
    const { data } = await supabase
      .from("risk_assessment_config")
      .select("sections")
      .eq("user_id", user!.id)
      .single();
    
    if (data?.sections) {
      setSections(data.sections);
    }
  };

  const calculateRiskScore = (sectionValues: Record<string, any>) => {
    let totalScore = 0;
    sections.forEach(section => {
      const sectionData = sectionValues[section.key];
      if (sectionData) {
        totalScore += (sectionData.score || 0) * section.weight;
      }
    });
    return Math.round(totalScore);
  };

  const getRiskLevel = (score: number): string => {
    if (score < 10) return "Low";
    if (score < 20) return "Medium";
    return "High";
  };

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    try {
      const totalScore = calculateRiskScore(values.sections);
      const riskLevel = getRiskLevel(totalScore);

      // Create linked task if needed
      let linkedTaskId = null;
      if (values.follow_up_needed && values.task_title) {
        const { data: taskData, error: taskError } = await supabase
          .from("tasks")
          .insert({
            title: values.task_title,
            young_person_id: values.young_person_id,
            assigned_to: user!.id,
            due_date: values.task_due_date,
            importance: "High",
            requires_support: "No",
            status: "pending"
          })
          .select()
          .single();

        if (taskError) throw taskError;
        linkedTaskId = taskData.id;
      }

      // Create assessment
      const { error } = await supabase
        .from("risk_assessments")
        .insert({
          young_person_id: values.young_person_id,
          assessed_by: user!.id,
          assessment_date: values.assessment_date,
          section_scores: values.sections,
          risk_score: totalScore,
          risk_level: riskLevel,
          recommendations: values.recommendations,
          follow_up_needed: values.follow_up_needed,
          linked_task_id: linkedTaskId
        });

      if (error) throw error;

      toast({
        title: "Assessment saved",
        description: `Risk level: ${riskLevel} (Score: ${totalScore})`
      });

      navigate(`/young-people/${values.young_person_id}?tab=risk`);
    } catch (error: any) {
      toast({
        title: "Error saving assessment",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Auto-save draft every 5 seconds
  useEffect(() => {
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    
    const timer = setTimeout(() => {
      const values = form.getValues();
      if (values.young_person_id) {
        localStorage.setItem(
          `risk_assessment_draft_${values.young_person_id}`,
          JSON.stringify(values)
        );
      }
    }, 5000);

    setAutoSaveTimer(timer);
    return () => clearTimeout(timer);
  }, [form.watch()]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <ModuleHeader />
      <div className="container py-8 px-4 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/risk-assessments")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assessments
          </Button>
          <h1 className="text-3xl font-bold">New Risk Assessment</h1>
          <p className="text-muted-foreground mt-1">
            Complete a comprehensive risk assessment with section-based scoring
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Header Section */}
            <Card>
              <CardHeader>
                <CardTitle>Assessment Details</CardTitle>
                <CardDescription>Basic information about this assessment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="young_person_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Young Person</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          const yp = youngPeople.find(y => y.id === value);
                          setSelectedYP(yp);
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select young person" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {youngPeople.map((yp) => (
                            <SelectItem key={yp.id} value={yp.id}>
                              {yp.first_name} {yp.last_name} ({yp.focus_id})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assessment_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assessment Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Risk Sections */}
            {sections.map((section, idx) => (
              <Card key={section.key}>
                <CardHeader>
                  <CardTitle className="text-lg">{section.label}</CardTitle>
                  <CardDescription>Score: 0 (None) - 5 (Critical)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name={`sections.${section.key}.score`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Risk Score</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          defaultValue={String(field.value || 0)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0">0 - No Risk</SelectItem>
                            <SelectItem value="1">1 - Very Low</SelectItem>
                            <SelectItem value="2">2 - Low</SelectItem>
                            <SelectItem value="3">3 - Medium</SelectItem>
                            <SelectItem value="4">4 - High</SelectItem>
                            <SelectItem value="5">5 - Critical</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`sections.${section.key}.notes`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes & Rationale</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Explain the reasoning behind this score..."
                            className="min-h-[100px]"
                            maxLength={800}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {field.value?.length || 0}/800 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            ))}

            {/* Recommendations & Follow-up */}
            <Card>
              <CardHeader>
                <CardTitle>Summary & Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="recommendations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recommendations</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What actions or interventions are recommended?"
                          className="min-h-[120px]"
                          maxLength={2000}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0}/2000 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <FormField
                  control={form.control}
                  name="follow_up_needed"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Follow-up action required</FormLabel>
                        <FormDescription>
                          Create a linked task for follow-up actions
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch("follow_up_needed") && (
                  <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                    <FormField
                      control={form.control}
                      name="task_title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Task Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Schedule mental health review" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="task_due_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preview Risk Score */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Calculated Risk Score: {calculateRiskScore(form.watch("sections"))}</strong>
                <br />
                Level: {getRiskLevel(calculateRiskScore(form.watch("sections")))}
              </AlertDescription>
            </Alert>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/risk-assessments")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Assessment"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}