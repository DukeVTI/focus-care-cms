import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/untypedClient";
import { format } from "date-fns";
import { toast } from "sonner";
import { ModuleHeader } from "@/components/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

const AVAILABLE_TAGS = [
  "Health",
  "Education",
  "Incident",
  "Safeguarding",
  "Positive",
  "Missing episode",
  "Family contact",
  "Behaviour",
  "Achievement",
  "Other"
];

const CATEGORIES = [
  "General",
  "Health",
  "Education",
  "Behaviour",
  "Contact with Family",
  "Professional Contact",
  "Incident / Safeguarding",
  "Missing / Return",
  "Positive Achievement",
  "Other"
];

const ENTRY_TYPES = [
  "Observation",
  "Phone call",
  "Meeting",
  "Visit",
  "Keywork session reference",
  "Incident record",
  "Other"
];

const SIGNIFICANCE_LEVELS = ["Low", "Medium", "High"];

const formSchema = z.object({
  young_person_id: z.string().uuid({ message: "Please select a young person" }),
  entry_date: z.date({ required_error: "Entry date is required" }),
  entry_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  category: z.string().min(1, { message: "Category is required" }),
  entry_type: z.string().min(1, { message: "Entry type is required" }),
  summary: z.string()
    .min(5, { message: "Summary must be at least 5 characters" })
    .max(200, { message: "Summary must not exceed 200 characters" }),
  observation: z.string()
    .min(20, { message: "Details must be at least 20 characters" })
    .max(5000, { message: "Details must not exceed 5000 characters" }),
  tags: z.array(z.string()).default([]),
  significance: z.string().optional(),
  author_name: z.string().optional(),
  flagged_for_report: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewChronologyEntry() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [youngPeople, setYoungPeople] = useState<any[]>([]);
  const [loadingYP, setLoadingYP] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entry_date: new Date(),
      entry_time: format(new Date(), "HH:mm"),
      category: "General",
      entry_type: "Observation",
      summary: "",
      observation: "",
      tags: [],
      significance: "Low",
      author_name: "",
      flagged_for_report: false,
    },
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchYoungPeople();
      fetchUserProfile();
    }
  }, [user]);

  const fetchYoungPeople = async () => {
    setLoadingYP(true);
    const { data, error } = await supabase
      .from("young_people")
      .select("id, first_name, last_name, focus_id")
      .eq("user_id", user?.id)
      .order("first_name");
    
    if (!error && data) {
      setYoungPeople(data);
    }
    setLoadingYP(false);
  };

  const fetchUserProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user?.id)
      .single();
    
    if (data?.full_name) {
      form.setValue("author_name", data.full_name);
    }
  };

  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    form.setValue("tags", newTags);
  };

  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    
    setSubmitting(true);
    
    try {
      const { error } = await supabase
        .from("chronology_entries")
        .insert({
          young_person_id: values.young_person_id,
          staff_id: user.id,
          entry_date: format(values.entry_date, "yyyy-MM-dd"),
          entry_time: values.entry_time,
          category: values.category,
          entry_type: values.entry_type,
          summary: values.summary,
          observation: values.observation,
          tags: values.tags,
          significance: values.significance || "Low",
          author_name: values.author_name || null,
          flagged_for_report: values.flagged_for_report,
        });

      if (error) throw error;

      toast.success("Chronology entry created successfully");
      navigate("/chronology");
    } catch (error: any) {
      toast.error(error.message || "Failed to create entry");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || loadingYP) {
    return null;
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
            <CardTitle>New Chronology Entry</CardTitle>
            <CardDescription>
              Record a daily observation or significant event
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="young_person_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Young Person *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="entry_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date > new Date()}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="entry_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time *</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CATEGORIES.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
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
                    name="entry_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entry Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ENTRY_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Summary *</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief summary of this entry" {...field} />
                      </FormControl>
                      <FormDescription>
                        A short title/one-line summary (5-200 characters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="author_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Author</FormLabel>
                      <FormControl>
                        <Input placeholder="Auto-filled from profile" {...field} />
                      </FormControl>
                      <FormDescription>
                        Leave blank to use your profile name
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="significance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Significance Level</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SIGNIFICANCE_LEVELS.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
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
                  name="tags"
                  render={() => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormDescription>
                        Select relevant tags for this entry
                      </FormDescription>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {AVAILABLE_TAGS.map((tag) => (
                          <Badge
                            key={tag}
                            variant={selectedTags.includes(tag) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => toggleTag(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="observation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Details / Observation *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Detailed observation or notes about this entry"
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Main details (minimum 20 characters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="flagged_for_report"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Flag for monthly report</FormLabel>
                        <FormDescription>
                          Highlight this entry for inclusion in monthly/council reports
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Creating..." : "Create Entry"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/chronology")}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
