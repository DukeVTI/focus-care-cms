import { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface StepProps {
  form: UseFormReturn<any>;
}

export const EducationStep = ({ form }: StepProps) => {
  const ehcpStatus = form.watch("ehcpStatus");
  const attendanceConcerns = form.watch("attendanceConcerns");

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="educationSetting"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Education Setting</FormLabel>
            <FormControl>
              <Input placeholder="School, college, training provider name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="yearGroup"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Year Group / Programme</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Year 10, Level 2 Vocational" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="border rounded-lg p-4 space-y-4">
        <FormField
          control={form.control}
          name="ehcpStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Education, Health and Care Plan (EHCP)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select EHCP status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="yes">Yes - Has EHCP</SelectItem>
                  <SelectItem value="no">No EHCP</SelectItem>
                  <SelectItem value="pending">EHCP Pending/In Progress</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {ehcpStatus === "yes" && (
          <FormField
            control={form.control}
            name="ehcpReviewDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>EHCP Review Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      <div className="border rounded-lg p-4 space-y-4">
        <FormField
          control={form.control}
          name="attendanceConcerns"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <Label>Attendance Concerns</Label>
                <p className="text-sm text-muted-foreground">
                  Check if there are any attendance or engagement concerns
                </p>
              </div>
            </FormItem>
          )}
        />

        {attendanceConcerns && (
          <FormField
            control={form.control}
            name="attendanceDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Describe Attendance Concerns</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Detail attendance patterns, reasons for absence, interventions in place..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  );
};
