import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface StepProps {
  form: UseFormReturn<any>;
}

const socialMediaPlatforms = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "snapchat", label: "Snapchat" },
  { value: "twitter", label: "X (Twitter)" },
  { value: "youtube", label: "YouTube" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "telegram", label: "Telegram" },
  { value: "discord", label: "Discord" },
  { value: "other", label: "Other" },
];

const idTypes = [
  { value: "passport", label: "Passport" },
  { value: "nino", label: "NINO" },
  { value: "bank-account", label: "Bank Account Details" },
  { value: "driving-licence", label: "Driving Licence" },
  { value: "biometric-card", label: "Biometric Card" },
  { value: "birth-certificate", label: "Birth Certificate" },
  { value: "nhs-number", label: "NHS Number" },
];

export const IdentityBasicsStep = ({ form }: StepProps) => {
  const socialMediaAccounts = form.watch("socialMediaAccounts") || [];
  const structuredIds = form.watch("structuredIds") || [];

  const addSocialMedia = () => {
    form.setValue("socialMediaAccounts", [
      ...socialMediaAccounts,
      { platform: "", handle: "", notes: "" },
    ]);
  };

  const removeSocialMedia = (index: number) => {
    form.setValue(
      "socialMediaAccounts",
      socialMediaAccounts.filter((_: any, i: number) => i !== index)
    );
  };

  const updateSocialMedia = (index: number, field: string, value: string) => {
    const updated = [...socialMediaAccounts];
    updated[index] = { ...updated[index], [field]: value };
    form.setValue("socialMediaAccounts", updated);
  };

  const addStructuredId = () => {
    form.setValue("structuredIds", [
      ...structuredIds,
      { type: "", value: "", expiryDate: "" },
    ]);
  };

  const removeStructuredId = (index: number) => {
    form.setValue(
      "structuredIds",
      structuredIds.filter((_: any, i: number) => i !== index)
    );
  };

  const updateStructuredId = (index: number, field: string, value: string) => {
    const updated = [...structuredIds];
    updated[index] = { ...updated[index], [field]: value };
    form.setValue("structuredIds", updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <FormField
          control={form.control}
          name="profilePhoto"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Profile Photo (JPG/PNG, max 5MB)</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => onChange(e.target.files)}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name *</FormLabel>
              <FormControl>
                <Input placeholder="John" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name *</FormLabel>
              <FormControl>
                <Input placeholder="Smith" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="preferredName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Preferred Name</FormLabel>
            <FormControl>
              <Input placeholder="Optional" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="dateOfBirth"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Date of Birth *</FormLabel>
            <FormControl>
              <Input type="date" max={new Date().toISOString().split('T')[0]} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="pronouns"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pronouns</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pronouns" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="she/her">She/Her</SelectItem>
                  <SelectItem value="he/him">He/Him</SelectItem>
                  <SelectItem value="they/them">They/Them</SelectItem>
                  <SelectItem value="other">Self-describe</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="non-binary">Non-binary</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="ethnicity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ethnicity</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ethnicity" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="white-british">White British</SelectItem>
                  <SelectItem value="white-irish">White Irish</SelectItem>
                  <SelectItem value="gypsy-irish-traveller">Gypsy or Irish Traveller</SelectItem>
                  <SelectItem value="other-white">Any Other White Background</SelectItem>
                  <SelectItem value="black-caribbean">Black Caribbean</SelectItem>
                  <SelectItem value="black-african">Black African</SelectItem>
                  <SelectItem value="other-black">Any Other Black Background</SelectItem>
                  <SelectItem value="asian-pakistani">Asian Pakistani</SelectItem>
                  <SelectItem value="asian-bangladeshi">Asian Bangladeshi</SelectItem>
                  <SelectItem value="asian-indian">Asian Indian</SelectItem>
                  <SelectItem value="other-asian">Any Other Asian Background</SelectItem>
                  <SelectItem value="mixed-white-black-caribbean">Mixed White & Black Caribbean</SelectItem>
                  <SelectItem value="mixed-white-black-african">Mixed White & Black African</SelectItem>
                  <SelectItem value="mixed-white-asian">Mixed White & Asian</SelectItem>
                  <SelectItem value="other-mixed">Any Other Mixed Background</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer Not to Say</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="nationality"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nationality *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select nationality" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="british">British</SelectItem>
                  <SelectItem value="irish">Irish</SelectItem>
                  <SelectItem value="eu-national">EU National</SelectItem>
                  <SelectItem value="non-eu-national">Non-EU National</SelectItem>
                  <SelectItem value="asylum-seeker">Asylum Seeker</SelectItem>
                  <SelectItem value="refugee">Refugee</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Structured IDs */}
      <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Identification Documents</h3>
          <Button type="button" variant="outline" size="sm" onClick={addStructuredId} className="gap-1">
            <Plus className="h-3 w-3" /> Add ID
          </Button>
        </div>
        
        {structuredIds.length === 0 && (
          <p className="text-sm text-muted-foreground">No identification documents added yet.</p>
        )}

        {structuredIds.map((id: any, index: number) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end border-b pb-3 last:border-0 last:pb-0">
            <div className="md:col-span-4">
              <Label className="text-xs">ID Type</Label>
              <Select value={id.type} onValueChange={(v) => updateStructuredId(index, "type", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {idTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-4">
              <Label className="text-xs">Reference / Number</Label>
              <Input
                placeholder="Enter reference"
                value={id.value}
                onChange={(e) => updateStructuredId(index, "value", e.target.value)}
              />
            </div>
            <div className="md:col-span-3">
              <Label className="text-xs">Expiry Date</Label>
              <Input
                type="date"
                value={id.expiryDate || ""}
                onChange={(e) => updateStructuredId(index, "expiryDate", e.target.value)}
              />
            </div>
            <div className="md:col-span-1">
              <Button type="button" variant="ghost" size="icon" onClick={() => removeStructuredId(index)} className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Social Media Accounts */}
      <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Social Media Accounts</h3>
          <Button type="button" variant="outline" size="sm" onClick={addSocialMedia} className="gap-1">
            <Plus className="h-3 w-3" /> Add Account
          </Button>
        </div>

        {socialMediaAccounts.length === 0 && (
          <p className="text-sm text-muted-foreground">No social media accounts tracked yet.</p>
        )}

        {socialMediaAccounts.map((account: any, index: number) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end border-b pb-3 last:border-0 last:pb-0">
            <div className="md:col-span-4">
              <Label className="text-xs">Platform</Label>
              <Select value={account.platform} onValueChange={(v) => updateSocialMedia(index, "platform", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {socialMediaPlatforms.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-4">
              <Label className="text-xs">Username / Handle</Label>
              <Input
                placeholder="@username"
                value={account.handle}
                onChange={(e) => updateSocialMedia(index, "handle", e.target.value)}
              />
            </div>
            <div className="md:col-span-3">
              <Label className="text-xs">Notes</Label>
              <Input
                placeholder="e.g. monitored"
                value={account.notes || ""}
                onChange={(e) => updateSocialMedia(index, "notes", e.target.value)}
              />
            </div>
            <div className="md:col-span-1">
              <Button type="button" variant="ghost" size="icon" onClick={() => removeSocialMedia(index)} className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Associated Areas */}
      <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
        <h3 className="text-sm font-semibold">Associated Areas / Frequented Locations</h3>
        <FormField
          control={form.control}
          name="associatedAreas"
          render={() => {
            const areas = form.watch("associatedAreas") || [];
            const [newArea, setNewArea] = useState("");
            return (
              <FormItem>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add area (e.g. Camden Town, Brixton)"
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newArea.trim()) {
                        e.preventDefault();
                        form.setValue("associatedAreas", [...areas, newArea.trim()]);
                        setNewArea("");
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (newArea.trim()) {
                        form.setValue("associatedAreas", [...areas, newArea.trim()]);
                        setNewArea("");
                      }
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                {areas.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {areas.map((area: string, i: number) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-accent text-accent-foreground text-xs">
                        {area}
                        <button
                          type="button"
                          onClick={() => form.setValue("associatedAreas", areas.filter((_: string, idx: number) => idx !== i))}
                          className="hover:text-destructive"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name="associatedAreasNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes on associated areas</FormLabel>
              <FormControl>
                <Input placeholder="e.g. frequently visits after school" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-2">
        <FormField
          control={form.control}
          name="primaryLanguage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Language</FormLabel>
              <FormControl>
                <Input placeholder="English" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="interpreterRequired"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <Label>Interpreter required</Label>
              </div>
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="photoConsent"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Photo Consent</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select consent status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="yes">Yes - Consent given</SelectItem>
                <SelectItem value="no">No - Consent refused</SelectItem>
                <SelectItem value="not_obtained">Not yet obtained</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
