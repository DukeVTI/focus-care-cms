import { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X } from "lucide-react";
import { useState } from "react";

interface StepProps {
  form: UseFormReturn<any>;
}

const communicationOptions = [
  { value: "phone", label: "Phone Call" },
  { value: "sms", label: "SMS / Text" },
  { value: "email", label: "Email" },
  { value: "in-app", label: "In-app Messages" },
  { value: "face-to-face", label: "Face-to-face Only" },
];

export const CulturePreferencesStep = ({ form }: StepProps) => {
  const [dietaryInput, setDietaryInput] = useState("");
  const [activityInput, setActivityInput] = useState("");

  const dietaryRequirements = form.watch("dietaryRequirements") || [];
  const activitiesInterests = form.watch("activitiesInterests") || [];
  const communicationPreferences = form.watch("communicationPreferences") || [];

  const addTag = (field: string, value: string, setValue: (v: string) => void) => {
    if (value.trim()) {
      const currentValues = form.getValues(field) || [];
      form.setValue(field, [...currentValues, value.trim()]);
      setValue("");
    }
  };

  const removeTag = (field: string, index: number) => {
    const currentValues = form.getValues(field) || [];
    form.setValue(field, currentValues.filter((_: any, i: number) => i !== index));
  };

  const toggleCommunication = (pref: string) => {
    const current = communicationPreferences;
    if (current.includes(pref)) {
      form.setValue("communicationPreferences", current.filter((p: string) => p !== pref));
    } else {
      form.setValue("communicationPreferences", [...current, pref]);
    }
  };

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="religion"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Religion / Spiritual Needs</FormLabel>
            <FormControl>
              <Input placeholder="Religious affiliation, spiritual practices, or preferences" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div>
        <Label>Dietary Requirements</Label>
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="Add dietary requirement and press Enter"
            value={dietaryInput}
            onChange={(e) => setDietaryInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag("dietaryRequirements", dietaryInput, setDietaryInput);
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => addTag("dietaryRequirements", dietaryInput, setDietaryInput)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          e.g., Vegetarian, Halal, Gluten-free, Lactose intolerant
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          {dietaryRequirements.map((requirement: string, index: number) => (
            <Badge key={index} variant="secondary" className="gap-1">
              {requirement}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeTag("dietaryRequirements", index)}
              />
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label>Activities & Interests</Label>
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="Add activity/interest and press Enter"
            value={activityInput}
            onChange={(e) => setActivityInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag("activitiesInterests", activityInput, setActivityInput);
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => addTag("activitiesInterests", activityInput, setActivityInput)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Hobbies, sports, creative activities, social interests
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          {activitiesInterests.map((activity: string, index: number) => (
            <Badge key={index} variant="outline" className="gap-1">
              {activity}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeTag("activitiesInterests", index)}
              />
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-base font-semibold">Communication Preferences</Label>
        <p className="text-sm text-muted-foreground">
          How does the young person prefer to be contacted? (Select all that apply)
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {communicationOptions.map((option) => (
            <div
              key={option.value}
              className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent"
            >
              <Checkbox
                id={option.value}
                checked={communicationPreferences.includes(option.value)}
                onCheckedChange={() => toggleCommunication(option.value)}
              />
              <Label htmlFor={option.value} className="cursor-pointer flex-1">{option.label}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
