import { UseFormReturn } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface SessionFormProps {
  form: UseFormReturn<any>;
  onSubmit: (values: any) => void;
  youngPeople: any[];
  staffList: any[];
  submitting: boolean;
  isEditMode?: boolean;
  youngPersonName?: string;
  showTaskForm: boolean;
  onToggleTaskForm: (value: boolean) => void;
}

export function SessionForm({
  form,
  onSubmit,
  youngPeople,
  staffList,
  submitting,
  isEditMode = false,
  youngPersonName,
  showTaskForm,
  onToggleTaskForm
}: SessionFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          
          {!isEditMode && (
            <FormField
              control={form.control}
              name="young_person_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Young Person</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select young person" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {youngPeople.map((yp) => (
                        <SelectItem key={yp.id} value={yp.id}>
                          {yp.first_name} {yp.last_name} {yp.focus_id && `(${yp.focus_id})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {isEditMode && youngPersonName && (
            <div>
              <Label>Young Person</Label>
              <p className="text-sm text-muted-foreground mt-1">{youngPersonName}</p>
            </div>
          )}

          <FormField
            control={form.control}
            name="session_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Session Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select author" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {staffList.map((staff) => (
                      <SelectItem key={staff.id} value={staff.full_name || staff.email}>
                        {staff.full_name || staff.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Session Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Session Details</h3>

          <FormField
            control={form.control}
            name="session_type"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Session Type</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Was this session planned or unplanned?
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value === "Planned"}
                    onCheckedChange={(checked) => field.onChange(checked ? "Planned" : "Unplanned")}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration_minutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))} 
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="topic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Session Topic/Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Education progress">Education progress</SelectItem>
                    <SelectItem value="Family contact">Family contact</SelectItem>
                    <SelectItem value="Health & wellbeing">Health & wellbeing</SelectItem>
                    <SelectItem value="Life skills">Life skills</SelectItem>
                    <SelectItem value="Relationships">Relationships</SelectItem>
                    <SelectItem value="Behaviour support">Behaviour support</SelectItem>
                    <SelectItem value="Future planning">Future planning</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="relevant_standard"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Relevant Standard</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select relevant standard" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Supported Accommodation Standards 2023">
                      Supported Accommodation Standards 2023
                    </SelectItem>
                    <SelectItem value="Children's Home Standards 2015">
                      Children's Home Standards 2015
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Onsite">Onsite</SelectItem>
                    <SelectItem value="Offsite">Offsite</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Session Content */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Session Content</h3>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Brief session title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Session Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="What was discussed, observations, outcomes..."
                    rows={6}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="follow_on_action"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Follow-On Action</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Actions required following this session..."
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="standards_met"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Standards Met (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Which care standards were addressed in this session..."
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="follow_up_required"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Follow-up required</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>

        {/* Task Integration */}
        {!isEditMode && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Task Integration</h3>
                  <p className="text-sm text-muted-foreground">
                    Create a linked task from this session
                  </p>
                </div>
                <Switch
                  checked={showTaskForm}
                  onCheckedChange={onToggleTaskForm}
                />
              </div>

              {showTaskForm && (
                <div className="space-y-4 p-4 border rounded-lg bg-accent/10">
                  <FormField
                    control={form.control}
                    name="task_title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Task Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Task title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="task_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Task Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Task details"
                            rows={3}
                            {...field}
                          />
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
            </div>
          </>
        )}
      </form>
    </Form>
  );
}
