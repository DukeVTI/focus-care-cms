import { UseFormReturn, useFieldArray } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus } from "lucide-react";
import { useState } from "react";

interface StepProps {
  form: UseFormReturn<any>;
}

export const HealthWellbeingStep = ({ form }: StepProps) => {
  const { fields: medicationFields, append: appendMedication, remove: removeMedication } = useFieldArray({
    control: form.control,
    name: "medications",
  });

  const mentalHealthSupport = form.watch("mentalHealthSupport");

  const [medicalConditionInput, setMedicalConditionInput] = useState("");
  const [allergyInput, setAllergyInput] = useState("");
  const [disabilityInput, setDisabilityInput] = useState("");

  const medicalConditions = form.watch("medicalConditions") || [];
  const allergies = form.watch("allergies") || [];
  const disabilityNeeds = form.watch("disabilityNeeds") || [];

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

  return (
    <div className="space-y-6">
      <div>
        <Label>Known Medical Conditions</Label>
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="Add condition and press Enter"
            value={medicalConditionInput}
            onChange={(e) => setMedicalConditionInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag("medicalConditions", medicalConditionInput, setMedicalConditionInput);
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => addTag("medicalConditions", medicalConditionInput, setMedicalConditionInput)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {medicalConditions.map((condition: string, index: number) => (
            <Badge key={index} variant="secondary" className="gap-1">
              {condition}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeTag("medicalConditions", index)}
              />
            </Badge>
          ))}
        </div>
      </div>

      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold">Medications</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendMedication({ name: "", dosage: "", frequency: "", notes: "" })}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Medication
          </Button>
        </div>
        {medicationFields.map((field, index) => (
          <div key={field.id} className="border rounded p-3 space-y-3 relative">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeMedication(index)}
              className="absolute top-2 right-2"
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name={`medications.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medication Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`medications.${index}.dosage`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dosage</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 10mg" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name={`medications.${index}.frequency`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Twice daily" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`medications.${index}.notes`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Input placeholder="Additional notes" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        ))}
      </div>

      <div>
        <Label>Allergies</Label>
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="Add allergy and press Enter"
            value={allergyInput}
            onChange={(e) => setAllergyInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag("allergies", allergyInput, setAllergyInput);
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => addTag("allergies", allergyInput, setAllergyInput)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {allergies.map((allergy: string, index: number) => (
            <Badge key={index} variant="destructive" className="gap-1">
              {allergy}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeTag("allergies", index)}
              />
            </Badge>
          ))}
        </div>
      </div>

      <FormField
        control={form.control}
        name="healthSupport"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Health Support</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select health support type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="gp-registered">GP Registered</SelectItem>
                <SelectItem value="dental-care">Dental Care</SelectItem>
                <SelectItem value="specialist-clinic">Specialist Clinic</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="border rounded-lg p-4 space-y-4">
        <FormField
          control={form.control}
          name="mentalHealthSupport"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <Label>Receiving Mental Health Support</Label>
              </div>
            </FormItem>
          )}
        />

        {mentalHealthSupport && (
          <div className="space-y-4 pl-7">
            <FormField
              control={form.control}
              name="mentalHealthService"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Name</FormLabel>
                  <FormControl>
                    <Input placeholder="CAMHS, therapy service, etc." {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mentalHealthWorker"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Worker/Therapist Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Professional name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mentalHealthNextAppointment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Next Appointment</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        )}
      </div>

      <div>
        <Label>Disability / Additional Needs</Label>
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="Add need and press Enter"
            value={disabilityInput}
            onChange={(e) => setDisabilityInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag("disabilityNeeds", disabilityInput, setDisabilityInput);
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => addTag("disabilityNeeds", disabilityInput, setDisabilityInput)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {disabilityNeeds.map((need: string, index: number) => (
            <Badge key={index} variant="outline" className="gap-1">
              {need}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeTag("disabilityNeeds", index)}
              />
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};
