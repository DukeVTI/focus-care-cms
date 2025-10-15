import { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface StepProps {
  form: UseFormReturn<any>;
}

const riskOptions = [
  { value: "cse", label: "Child Sexual Exploitation (CSE)" },
  { value: "substance-misuse", label: "Substance Misuse" },
  { value: "self-harm", label: "Self-harm" },
  { value: "violence", label: "Violence / Aggression" },
  { value: "missing", label: "Going Missing" },
  { value: "gangs", label: "Gang Association" },
  { value: "online-safety", label: "Online Safety Concerns" },
  { value: "bullying", label: "Bullying" },
  { value: "other", label: "Other Risks" },
];

export const SafeguardingStep = ({ form }: StepProps) => {
  const knownRisks = form.watch("knownRisks") || [];

  const toggleRisk = (risk: string) => {
    const current = knownRisks;
    if (current.includes(risk)) {
      form.setValue("knownRisks", current.filter((r: string) => r !== risk));
    } else {
      form.setValue("knownRisks", [...current, risk]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
        <p className="text-sm text-amber-900 dark:text-amber-100">
          <strong>Important:</strong> This section captures baseline safeguarding information. Complete risk assessments should be conducted separately using the Risk Assessment feature.
        </p>
      </div>

      <div className="space-y-3">
        <Label className="text-base font-semibold">Known Risks</Label>
        <p className="text-sm text-muted-foreground">
          Select all known risk factors (check all that apply)
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {riskOptions.map((option) => (
            <div
              key={option.value}
              className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent"
            >
              <Checkbox
                id={option.value}
                checked={knownRisks.includes(option.value)}
                onCheckedChange={() => toggleRisk(option.value)}
              />
              <Label htmlFor={option.value} className="cursor-pointer flex-1">{option.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <FormField
        control={form.control}
        name="triggers"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Triggers / Early Warning Signs</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe behaviors, situations, or circumstances that may trigger concerning behaviors or indicate increased risk..."
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="protectiveFactors"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Protective Factors / Strengths</FormLabel>
            <FormControl>
              <Textarea
                placeholder="List positive relationships, coping strategies, interests, achievements, and other protective factors..."
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="initialRiskSummary"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Initial Risk Summary *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Provide a brief initial risk summary (20-400 characters). This is a high-level overview - detailed assessments should be completed separately."
                className="min-h-[120px]"
                {...field}
              />
            </FormControl>
            <p className="text-xs text-muted-foreground">
              {field.value?.length || 0} / 400 characters (minimum 20)
            </p>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
