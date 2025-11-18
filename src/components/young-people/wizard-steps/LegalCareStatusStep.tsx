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
                  <SelectItem value="foster-care">Foster care</SelectItem>
                  <SelectItem value="residential-childrens-home">Residential children's home</SelectItem>
                  <SelectItem value="special-guardianship">Special guardianship</SelectItem>
                  <SelectItem value="parent-address">Parent address</SelectItem>
                  <SelectItem value="supported-accommodation">Supported accommodation</SelectItem>
                  <SelectItem value="street-homeless">Street homeless</SelectItem>
                  <SelectItem value="la-pathway-service">Local authority pathway service</SelectItem>
                  <SelectItem value="secure-unit">Secure unit</SelectItem>
                  <SelectItem value="youth-offenders-institute">Youth Offenders Institute</SelectItem>
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
                <FormLabel>Placing Authority *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select authority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="barking-dagenham">Barking and Dagenham</SelectItem>
                    <SelectItem value="barnet">Barnet</SelectItem>
                    <SelectItem value="bexley">Bexley</SelectItem>
                    <SelectItem value="brent">Brent</SelectItem>
                    <SelectItem value="bromley">Bromley</SelectItem>
                    <SelectItem value="camden">Camden</SelectItem>
                    <SelectItem value="croydon">Croydon</SelectItem>
                    <SelectItem value="ealing">Ealing</SelectItem>
                    <SelectItem value="enfield">Enfield</SelectItem>
                    <SelectItem value="greenwich">Greenwich (Royal Borough of Greenwich)</SelectItem>
                    <SelectItem value="hackney">Hackney</SelectItem>
                    <SelectItem value="hammersmith-fulham">Hammersmith and Fulham</SelectItem>
                    <SelectItem value="haringey">Haringey</SelectItem>
                    <SelectItem value="harrow">Harrow</SelectItem>
                    <SelectItem value="havering">Havering</SelectItem>
                    <SelectItem value="hillingdon">Hillingdon</SelectItem>
                    <SelectItem value="hounslow">Hounslow</SelectItem>
                    <SelectItem value="islington">Islington</SelectItem>
                    <SelectItem value="kensington-chelsea">Kensington and Chelsea</SelectItem>
                    <SelectItem value="kingston">Kingston upon Thames</SelectItem>
                    <SelectItem value="lambeth">Lambeth</SelectItem>
                    <SelectItem value="lewisham">Lewisham</SelectItem>
                    <SelectItem value="merton">Merton</SelectItem>
                    <SelectItem value="newham">Newham</SelectItem>
                    <SelectItem value="redbridge">Redbridge</SelectItem>
                    <SelectItem value="richmond">Richmond upon Thames</SelectItem>
                    <SelectItem value="southwark">Southwark</SelectItem>
                    <SelectItem value="sutton">Sutton</SelectItem>
                    <SelectItem value="tower-hamlets">Tower Hamlets</SelectItem>
                    <SelectItem value="waltham-forest">Waltham Forest</SelectItem>
                    <SelectItem value="wandsworth">Wandsworth</SelectItem>
                    <SelectItem value="westminster">Westminster (City of Westminster)</SelectItem>
                    <SelectItem value="city-of-london">City of London Corporation</SelectItem>
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
                <FormLabel>Residing Local Authority *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select authority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="barking-dagenham">Barking and Dagenham</SelectItem>
                    <SelectItem value="barnet">Barnet</SelectItem>
                    <SelectItem value="bexley">Bexley</SelectItem>
                    <SelectItem value="brent">Brent</SelectItem>
                    <SelectItem value="bromley">Bromley</SelectItem>
                    <SelectItem value="camden">Camden</SelectItem>
                    <SelectItem value="croydon">Croydon</SelectItem>
                    <SelectItem value="ealing">Ealing</SelectItem>
                    <SelectItem value="enfield">Enfield</SelectItem>
                    <SelectItem value="greenwich">Greenwich (Royal Borough of Greenwich)</SelectItem>
                    <SelectItem value="hackney">Hackney</SelectItem>
                    <SelectItem value="hammersmith-fulham">Hammersmith and Fulham</SelectItem>
                    <SelectItem value="haringey">Haringey</SelectItem>
                    <SelectItem value="harrow">Harrow</SelectItem>
                    <SelectItem value="havering">Havering</SelectItem>
                    <SelectItem value="hillingdon">Hillingdon</SelectItem>
                    <SelectItem value="hounslow">Hounslow</SelectItem>
                    <SelectItem value="islington">Islington</SelectItem>
                    <SelectItem value="kensington-chelsea">Kensington and Chelsea</SelectItem>
                    <SelectItem value="kingston">Kingston upon Thames</SelectItem>
                    <SelectItem value="lambeth">Lambeth</SelectItem>
                    <SelectItem value="lewisham">Lewisham</SelectItem>
                    <SelectItem value="merton">Merton</SelectItem>
                    <SelectItem value="newham">Newham</SelectItem>
                    <SelectItem value="redbridge">Redbridge</SelectItem>
                    <SelectItem value="richmond">Richmond upon Thames</SelectItem>
                    <SelectItem value="southwark">Southwark</SelectItem>
                    <SelectItem value="sutton">Sutton</SelectItem>
                    <SelectItem value="tower-hamlets">Tower Hamlets</SelectItem>
                    <SelectItem value="waltham-forest">Waltham Forest</SelectItem>
                    <SelectItem value="wandsworth">Wandsworth</SelectItem>
                    <SelectItem value="westminster">Westminster (City of Westminster)</SelectItem>
                    <SelectItem value="city-of-london">City of London Corporation</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="previousPlacementCategory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Previous Placement Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select previous placement type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="foster-care">Foster care</SelectItem>
                  <SelectItem value="residential-childrens-home">Residential children's home</SelectItem>
                  <SelectItem value="special-guardianship">Special guardianship</SelectItem>
                  <SelectItem value="parent-address">Parent address</SelectItem>
                  <SelectItem value="supported-accommodation">Supported accommodation</SelectItem>
                  <SelectItem value="street-homeless">Street homeless</SelectItem>
                  <SelectItem value="la-pathway-service">Local authority pathway service</SelectItem>
                  <SelectItem value="secure-unit">Secure unit</SelectItem>
                  <SelectItem value="youth-offenders-institute">Youth Offenders Institute</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reasonForPlacement"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason for Placement *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="family-breakdown">Family breakdown</SelectItem>
                  <SelectItem value="abuse">Abuse</SelectItem>
                  <SelectItem value="substance-abuse">Substance abuse</SelectItem>
                  <SelectItem value="health-concerns">Health concerns</SelectItem>
                  <SelectItem value="behavioural-concerns">Behavioural concerns</SelectItem>
                  <SelectItem value="parental-death">Parental death</SelectItem>
                  <SelectItem value="unaccompanied-minor">Unaccompanied minor</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch("reasonForPlacement") === "other" && (
          <FormField
            control={form.control}
            name="reasonForPlacementNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Please specify reason</FormLabel>
                <FormControl>
                  <Input placeholder="Enter specific reason for placement" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
        <h3 className="text-sm font-semibold">Identity & Legal</h3>
        
        <FormField
          control={form.control}
          name="immigrationLegalStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Legal Status (Immigration / Residency) *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select legal status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="british-citizen">British Citizen</SelectItem>
                  <SelectItem value="indefinite-leave">Indefinite Leave to Remain / Settled Status</SelectItem>
                  <SelectItem value="work-visa">Work Visa (Skilled / Temporary)</SelectItem>
                  <SelectItem value="student-visa">Student Visa</SelectItem>
                  <SelectItem value="family-visa">Family Visa</SelectItem>
                  <SelectItem value="visitor-visa">Visitor Visa</SelectItem>
                  <SelectItem value="asylum-seeker">Asylum Seeker</SelectItem>
                  <SelectItem value="refugee-status">Refugee Status</SelectItem>
                  <SelectItem value="humanitarian-protection">Humanitarian Protection</SelectItem>
                  <SelectItem value="limited-leave">Limited Leave to Remain (LLR / NRPF)</SelectItem>
                  <SelectItem value="pre-settled">Pre-Settled Status</SelectItem>
                  <SelectItem value="no-legal-status">No Legal Status / Undocumented</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="careLegalStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Children's Legal Status in Care (Accommodating Under) *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select care legal status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="s17">Section 17 (S17) – Child in Need</SelectItem>
                  <SelectItem value="s20">Section 20 (S20) – Voluntary Accommodation</SelectItem>
                  <SelectItem value="ico">Interim Care Order (ICO)</SelectItem>
                  <SelectItem value="care-order-s31">Care Order (Section 31)</SelectItem>
                  <SelectItem value="placement-order">Placement Order</SelectItem>
                  <SelectItem value="adoption-order">Adoption Order</SelectItem>
                  <SelectItem value="supervision-order">Supervision Order</SelectItem>
                  <SelectItem value="sgo">Special Guardianship Order (SGO)</SelectItem>
                  <SelectItem value="cao">Child Arrangements Order (CAO)</SelectItem>
                  <SelectItem value="epo">Emergency Protection Order (EPO)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="timeLookedAfter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Length of Time Looked After</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="0-6months">0–6 months</SelectItem>
                  <SelectItem value="6-12months">6–12 months</SelectItem>
                  <SelectItem value="12-18months">12–18 months</SelectItem>
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
