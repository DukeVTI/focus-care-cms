import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface NotificationChecklistProps {
  form: UseFormReturn<any>;
}

export const NotificationChecklist = ({ form }: NotificationChecklistProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Notifications</h3>
      
      <FormField
        control={form.control}
        name="police_notified"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Police Notified</FormLabel>
            </div>
          </FormItem>
        )}
      />

      {form.watch("police_notified") && (
        <FormField
          control={form.control}
          name="police_reference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Police Reference Number</FormLabel>
              <FormControl>
                <Input placeholder="e.g., URN123456" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="social_worker_notified"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Social Worker Notified</FormLabel>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="placing_authority_notified"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Placing Authority Notified</FormLabel>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
};
