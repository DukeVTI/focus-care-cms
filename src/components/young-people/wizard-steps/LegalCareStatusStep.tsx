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

export const LegalCareStatusStep = ({ form }: StepProps) => {
  const lookedAfterChild = form.watch("lookedAfterChild");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="placementType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Placement Type *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select placement type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="foster">Foster Care</SelectItem>
                  <SelectItem value="residential">Residential Care</SelectItem>
                  <SelectItem value="kinship">Kinship Care</SelectItem>
                  <SelectItem value="semi-independent">Semi-independent</SelectItem>
                  <SelectItem value="secure">Secure Accommodation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="placementStartDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Placement Start Date *</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
        <h3 className="text-sm font-semibold">Placement Details</h3>
        
        <FormField
          control={form.control}
          name="placementAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Placement Address *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter full placement address..."
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="placementRoadName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Road Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter road name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="placementPostcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postcode *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g. SW1A 1AA" 
                    {...field} 
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
        <h3 className="text-sm font-semibold">Placement & Authority Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="placingAuthority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Placing Authority</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select authority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="local-authority">Local Authority</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="voluntary">Voluntary</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="residingLocalAuthority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Residing Local Authority</FormLabel>
                <FormControl>
                  <Input placeholder="Enter local authority name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="previousPlacement"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Previous Placement</FormLabel>
              <FormControl>
                <Input placeholder="Previous placement details (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reasonForPlacement"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason for Placement</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="family-breakdown">Family Breakdown</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="welfare">Welfare</SelectItem>
                  <SelectItem value="justice">Justice</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="legalStatus"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Legal Status *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select legal status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="section-20">Section 20 (Voluntary)</SelectItem>
                <SelectItem value="care-order">Care Order</SelectItem>
                <SelectItem value="interim-care-order">Interim Care Order</SelectItem>
                <SelectItem value="emergency-protection">Emergency Protection Order</SelectItem>
                <SelectItem value="special-guardianship">Special Guardianship Order</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="lookedAfterChild"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <Label>Looked After Child (LAC)</Label>
              <p className="text-sm text-muted-foreground">
                Check if this young person is a Looked After Child
              </p>
            </div>
          </FormItem>
        )}
      />

      {lookedAfterChild && (
        <>
          <FormField
            control={form.control}
            name="iroName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Independent Reviewing Officer (IRO) Name</FormLabel>
                <FormControl>
                  <Input placeholder="IRO full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nextLacReviewDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Next LAC Review Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}

      <FormField
        control={form.control}
        name="courtOrders"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Court Orders / Restrictions</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Detail any court orders, restrictions, or legal requirements..."
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
