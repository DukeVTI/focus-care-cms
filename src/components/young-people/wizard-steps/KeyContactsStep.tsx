import { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/untypedClient";
import { Plus, Trash2 } from "lucide-react";

interface StepProps {
  form: UseFormReturn<any>;
}

interface KeyContact {
  id: string;
  contact_name: string;
  relationship: string;
  phone: string;
  email: string;
  organization: string;
  notes: string;
}

export const KeyContactsStep = ({ form }: StepProps) => {
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [keyContacts, setKeyContacts] = useState<KeyContact[]>([
    {
      id: crypto.randomUUID(),
      contact_name: "",
      relationship: "",
      phone: "",
      email: "",
      organization: "",
      notes: ""
    }
  ]);

  useEffect(() => {
    loadStaffMembers();
    const savedContacts = form.getValues("keyContacts");
    if (savedContacts && savedContacts.length > 0) {
      setKeyContacts(savedContacts);
    }
  }, []);

  useEffect(() => {
    form.setValue("keyContacts", keyContacts);
  }, [keyContacts, form]);

  const loadStaffMembers = async () => {
    const { data } = await supabase.from("profiles").select("id, full_name, email");
    if (data) setStaffMembers(data);
  };

  const addContact = () => {
    setKeyContacts([...keyContacts, {
      id: crypto.randomUUID(),
      contact_name: "",
      relationship: "",
      phone: "",
      email: "",
      organization: "",
      notes: ""
    }]);
  };

  const removeContact = (id: string) => {
    if (keyContacts.length > 1) {
      setKeyContacts(keyContacts.filter(c => c.id !== id));
    }
  };

  const updateContact = (id: string, field: keyof KeyContact, value: string) => {
    setKeyContacts(keyContacts.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold mb-4">Social Worker Details</h3>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="socialWorkerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Social Worker Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="socialWorkerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Social Worker Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="socialWorkerPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Social Worker Phone</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="Phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold mb-4">Key Worker Assignment</h3>
        <FormField
          control={form.control}
          name="keyWorkerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assigned Key Worker *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select key worker" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {staffMembers.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.full_name || staff.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="border-b pb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Other Key Contacts</h3>
          <Button type="button" onClick={addContact} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>
        <div className="space-y-6">
          {keyContacts.map((contact, index) => (
            <div key={contact.id} className="border rounded-lg p-4 space-y-4 relative">
              {keyContacts.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => removeContact(contact.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <h4 className="font-medium text-sm">Contact {index + 1}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FormLabel>Name</FormLabel>
                  <Input
                    value={contact.contact_name}
                    onChange={(e) => updateContact(contact.id, "contact_name", e.target.value)}
                    placeholder="Contact name"
                  />
                </div>
                <div>
                  <FormLabel>Relationship</FormLabel>
                  <Input
                    value={contact.relationship}
                    onChange={(e) => updateContact(contact.id, "relationship", e.target.value)}
                    placeholder="e.g., Family member, Advocate"
                  />
                </div>
                <div>
                  <FormLabel>Phone</FormLabel>
                  <Input
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => updateContact(contact.id, "phone", e.target.value)}
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={contact.email}
                    onChange={(e) => updateContact(contact.id, "email", e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <FormLabel>Organization</FormLabel>
                  <Input
                    value={contact.organization}
                    onChange={(e) => updateContact(contact.id, "organization", e.target.value)}
                    placeholder="Organization name"
                  />
                </div>
              </div>
              <div>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  value={contact.notes}
                  onChange={(e) => updateContact(contact.id, "notes", e.target.value)}
                  placeholder="Additional information..."
                  rows={2}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="emergencyContactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emergencyContactRelationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Parent, Guardian" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="emergencyContactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="Emergency contact number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="emergencyContactNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes</FormLabel>
                <FormControl>
                  <Textarea placeholder="Any additional information about this contact..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
};
