import { UseFormReturn, useFieldArray } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";

interface StepProps {
  form: UseFormReturn<any>;
}

const documentTypes = [
  { value: "id", label: "ID / Passport" },
  { value: "birth-certificate", label: "Birth Certificate" },
  { value: "care-plan", label: "Care Plan" },
  { value: "education-consent", label: "Education Consent" },
  { value: "medical-consent", label: "Medical Consent" },
  { value: "photo-consent", label: "Photo Consent" },
  { value: "trip-consent", label: "Trips/Activities Consent" },
  { value: "other", label: "Other Document" },
];

export const DocumentsConsentsStep = ({ form }: StepProps) => {
  const { fields: documentFields, append: appendDocument, remove: removeDocument } = useFieldArray({
    control: form.control,
    name: "documents",
  });

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>Document Storage:</strong> Uploaded documents are stored securely and linked to this young person's profile. Maximum file size: 10MB per document.
        </p>
      </div>

      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold">Documents to Upload</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendDocument({ type: "", file: null, expiryDate: "" })}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Document
          </Button>
        </div>

        {documentFields.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No documents added yet. Click "Add Document" to begin.
          </p>
        )}

        {documentFields.map((field, index) => (
          <div key={field.id} className="border rounded-lg p-4 space-y-4 relative">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeDocument(index)}
              className="absolute top-2 right-2"
            >
              <X className="h-4 w-4" />
            </Button>

            <FormField
              control={form.control}
              name={`documents.${index}.type`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {documentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`documents.${index}.file`}
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Upload File</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => onChange(e.target.files)}
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Accepted: PDF, Word, JPEG, PNG (max 10MB)
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`documents.${index}.expiryDate`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date (if applicable)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}
      </div>

      <div className="border rounded-lg p-4 space-y-4">
        <Label className="text-lg font-semibold">Data Sharing Consent</Label>
        
        <FormField
          control={form.control}
          name="dataSharingConsent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Consent Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select consent status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="full">Full Consent - Share with all relevant parties</SelectItem>
                  <SelectItem value="partial">Partial Consent - Share with specific parties only</SelectItem>
                  <SelectItem value="no">No Consent - Do not share</SelectItem>
                  <SelectItem value="pending">Pending - Awaiting decision</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dataSharingNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data Sharing Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Specify any restrictions, limitations, or additional details about data sharing consent..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Detail who information can/cannot be shared with and under what circumstances
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
