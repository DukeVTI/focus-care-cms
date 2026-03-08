import { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const exploitationOptions = [
  { value: "cse", label: "Child Sexual Exploitation (CSE)" },
  { value: "cce", label: "Child Criminal Exploitation (CCE)" },
  { value: "county-lines", label: "County Lines" },
  { value: "modern-slavery", label: "Modern Slavery / Trafficking" },
  { value: "radicalisation", label: "Radicalisation / Extremism" },
  { value: "financial-exploitation", label: "Financial Exploitation" },
  { value: "online-exploitation", label: "Online Exploitation" },
  { value: "forced-marriage", label: "Forced Marriage" },
  { value: "fgm", label: "FGM" },
  { value: "honour-based", label: "Honour-Based Abuse" },
];

export const SafeguardingStep = ({ form }: StepProps) => {
  const knownRisks = form.watch("knownRisks") || [];
  const exploitationCategories = form.watch("exploitationCategories") || [];
  const offendingHistory = form.watch("offendingHistory");
  const yotInvolved = form.watch("yotInvolved");

  const toggleRisk = (risk: string) => {
    const current = knownRisks;
    if (current.includes(risk)) {
      form.setValue("knownRisks", current.filter((r: string) => r !== risk));
    } else {
      form.setValue("knownRisks", [...current, risk]);
    }
  };

  const toggleExploitation = (category: string) => {
    const current = exploitationCategories;
    if (current.includes(category)) {
      form.setValue("exploitationCategories", current.filter((c: string) => c !== category));
    } else {
      form.setValue("exploitationCategories", [...current, category]);
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
        <p className="text-sm text-muted-foreground">Select all known risk factors (check all that apply)</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {riskOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent">
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

      {/* Exploitation Categories */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Exploitation Categories</Label>
        <p className="text-sm text-muted-foreground">Select any applicable exploitation concerns</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {exploitationOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent">
              <Checkbox
                id={`exploit-${option.value}`}
                checked={exploitationCategories.includes(option.value)}
                onCheckedChange={() => toggleExploitation(option.value)}
              />
              <Label htmlFor={`exploit-${option.value}`} className="cursor-pointer flex-1">{option.label}</Label>
            </div>
          ))}
        </div>
        {exploitationCategories.length > 0 && (
          <FormField
            control={form.control}
            name="exploitationNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exploitation Notes</FormLabel>
                <FormControl>
                  <Textarea placeholder="Provide additional context on exploitation concerns..." className="min-h-[80px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      <FormField
        control={form.control}
        name="triggers"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Triggers / Early Warning Signs</FormLabel>
            <FormControl>
              <Textarea placeholder="Describe behaviors, situations, or circumstances that may trigger concerning behaviors..." className="min-h-[100px]" {...field} />
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
              <Textarea placeholder="List positive relationships, coping strategies, interests, achievements..." className="min-h-[100px]" {...field} />
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
              <Textarea placeholder="Provide a brief initial risk summary (20-400 characters)..." className="min-h-[120px]" {...field} />
            </FormControl>
            <p className="text-xs text-muted-foreground">{field.value?.length || 0} / 400 characters (minimum 20)</p>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Offending History */}
      <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
        <h3 className="text-sm font-semibold">Offending History</h3>
        <FormField
          control={form.control}
          name="offendingHistory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Offending History</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="previous-charges">Previous Charges</SelectItem>
                  <SelectItem value="currently-monitored">Currently Monitored</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {offendingHistory === "yes" && (
          <div className="space-y-4 pl-4 border-l-2 border-primary">
            <FormField
              control={form.control}
              name="offendingDetails.description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Incident Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the incident..." className="min-h-[80px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="offendingDetails.date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Incident</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="offendingDetails.outcome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Outcome</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the outcome..." className="min-h-[60px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </div>

      {/* YOT / Probation */}
      <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
        <h3 className="text-sm font-semibold">YOT / Probation Details</h3>
        <FormField
          control={form.control}
          name="yotInvolved"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <Label>Youth Offending Team (YOT) Involved</Label>
              </div>
            </FormItem>
          )}
        />

        {yotInvolved && (
          <div className="space-y-4 pl-4 border-l-2 border-primary">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="yotWorkerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>YOT Worker Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="yotWorkerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>YOT Worker Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="yotWorkerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YOT Worker Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="probationOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Probation / Court Order Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select order type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="referral-order">Referral Order</SelectItem>
                      <SelectItem value="youth-rehabilitation">Youth Rehabilitation Order (YRO)</SelectItem>
                      <SelectItem value="detention-training">Detention & Training Order (DTO)</SelectItem>
                      <SelectItem value="youth-conditional-caution">Youth Conditional Caution</SelectItem>
                      <SelectItem value="community-resolution">Community Resolution</SelectItem>
                      <SelectItem value="bail-conditions">Bail Conditions</SelectItem>
                      <SelectItem value="issp">ISSP (Intensive Supervision)</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="probationEndDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order End Date</FormLabel>
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
    </div>
  );
};
