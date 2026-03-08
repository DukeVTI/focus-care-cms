import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";

interface IncidentDetailsFormProps {
  form: UseFormReturn<any>;
}

export const IncidentDetailsForm = ({ form }: IncidentDetailsFormProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Incident Details</h3>
      
      <FormField
        control={form.control}
        name="clothing_description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Clothing Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="What was the young person wearing when last seen?"
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="distinguishing_features"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Distinguishing Features</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Scars, tattoos, piercings, etc."
                className="min-h-[60px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="known_associates"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Known Associates</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Names or descriptions of people they may be with..."
                className="min-h-[60px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="likely_destinations"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Likely Destinations</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Places the young person is known to frequent..."
                className="min-h-[60px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="transport_mode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Mode of Transport</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="How might they be travelling?" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="on_foot">On Foot</SelectItem>
                <SelectItem value="public_transport">Public Transport</SelectItem>
                <SelectItem value="vehicle">In a Vehicle</SelectItem>
                <SelectItem value="bicycle">Bicycle</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="risk_level"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Initial Risk Level</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Assess initial risk" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="low">Low - No immediate concerns</SelectItem>
                <SelectItem value="medium">Medium - Some risk factors present</SelectItem>
                <SelectItem value="high">High - Significant vulnerability/risk</SelectItem>
                <SelectItem value="critical">Critical - Immediate danger suspected</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
