import { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { useState } from "react";

interface StepProps {
  form: UseFormReturn<any>;
}

export const SystemAssignmentStep = ({ form }: StepProps) => {
  const [tagInput, setTagInput] = useState("");
  const tags = form.watch("tags") || [];

  const addTag = () => {
    if (tagInput.trim()) {
      const currentTags = form.getValues("tags") || [];
      form.setValue("tags", [...currentTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (index: number) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue("tags", currentTags.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900 rounded-lg p-4">
        <p className="text-sm text-green-900 dark:text-green-100">
          <strong>Almost done!</strong> Review system settings and assignment details before creating the profile.
        </p>
      </div>

      <FormField
        control={form.control}
        name="assignedTeam"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Assigned Team</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="residential-team-a">Residential Team A</SelectItem>
                <SelectItem value="residential-team-b">Residential Team B</SelectItem>
                <SelectItem value="fostering-team">Fostering Team</SelectItem>
                <SelectItem value="independent-living">Independent Living Team</SelectItem>
                <SelectItem value="assessment-team">Assessment Team</SelectItem>
                <SelectItem value="other">Other Team</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="visibility"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Profile Visibility</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="all_staff">All Staff - Visible to everyone</SelectItem>
                <SelectItem value="case_team">Case Team Only - Restricted to assigned team</SelectItem>
                <SelectItem value="custom">Custom - Set specific permissions</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Controls who can view and edit this young person's information
            </p>
            <FormMessage />
          </FormItem>
        )}
      />

      <div>
        <Label>Profile Tags</Label>
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="Add tag and press Enter (e.g., High priority, New admission)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={addTag}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Tags help categorize and filter profiles (e.g., "High priority", "New admission", "Transition planning")
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag: string, index: number) => (
            <Badge key={index} className="gap-1">
              {tag}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeTag(index)}
              />
            </Badge>
          ))}
        </div>
      </div>

      <FormField
        control={form.control}
        name="internalNotes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Internal Notes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Add any internal staff notes, observations, or important information not captured elsewhere. These notes are for staff use only and not shared externally."
                className="min-h-[120px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="border-t pt-6 space-y-4">
        <h3 className="text-lg font-semibold">What happens next?</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>A unique FOCUS ID will be automatically generated for this profile</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>The assigned key worker will be notified of the new profile</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>You'll be redirected to the dashboard where you can add risk assessments, log sessions, and create tasks</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Use "Save as Draft" if you need to complete this later</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
