import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/untypedClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Phone, Mail, Building2, Edit, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface KeyContactsWidgetProps {
  youngPersonId: string;
}

interface Contact {
  id: string;
  contact_name: string;
  role: string | null;
  relationship: string | null;
  organisation: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  is_primary: boolean | null;
}

const ROLE_OPTIONS = [
  "Social Worker",
  "Parent",
  "Guardian",
  "Carer",
  "IRO (Independent Reviewing Officer)",
  "Personal Advisor (PA)",
  "Key Worker",
  "Teacher",
  "Other"
];

export const KeyContactsWidget = ({ youngPersonId }: KeyContactsWidgetProps) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({
    contact_name: "",
    role: "",
    relationship: "",
    organisation: "",
    phone: "",
    email: "",
    notes: "",
    is_primary: false
  });

  useEffect(() => {
    fetchContacts();
  }, [youngPersonId]);

  const fetchContacts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("young_person_contacts")
      .select("*")
      .eq("young_person_id", youngPersonId)
      .order("is_primary", { ascending: false })
      .order("contact_name", { ascending: true });

    if (!error && data) {
      setContacts(data);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      contact_name: "",
      role: "",
      relationship: "",
      organisation: "",
      phone: "",
      email: "",
      notes: "",
      is_primary: false
    });
    setEditingContact(null);
  };

  const handleSubmit = async () => {
    if (!formData.contact_name.trim()) {
      toast.error("Contact name is required");
      return;
    }

    try {
      // If setting as primary, unset other primary contacts first
      if (formData.is_primary) {
        await supabase
          .from("young_person_contacts")
          .update({ is_primary: false })
          .eq("young_person_id", youngPersonId)
          .neq("id", editingContact?.id || "");
      }

      if (editingContact) {
        // Update existing contact
        const { error } = await supabase
          .from("young_person_contacts")
          .update(formData)
          .eq("id", editingContact.id);

        if (error) throw error;
        toast.success("Contact updated successfully");
      } else {
        // Create new contact
        const { error } = await supabase
          .from("young_person_contacts")
          .insert({
            young_person_id: youngPersonId,
            ...formData
          });

        if (error) throw error;
        toast.success("Contact added successfully");
      }

      setDialogOpen(false);
      resetForm();
      fetchContacts();
    } catch (error: any) {
      toast.error(error.message || "Failed to save contact");
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      contact_name: contact.contact_name,
      role: contact.role || "",
      relationship: contact.relationship || "",
      organisation: contact.organisation || "",
      phone: contact.phone || "",
      email: contact.email || "",
      notes: contact.notes || "",
      is_primary: contact.is_primary || false
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!contactToDelete) return;

    try {
      const { error } = await supabase
        .from("young_person_contacts")
        .delete()
        .eq("id", contactToDelete);

      if (error) throw error;
      toast.success("Contact deleted successfully");
      fetchContacts();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete contact");
    } finally {
      setDeleteDialogOpen(false);
      setContactToDelete(null);
    }
  };

  const confirmDelete = (id: string) => {
    setContactToDelete(id);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Key Contacts
            </CardTitle>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingContact ? "Edit Contact" : "Add New Contact"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="contact_name">Name *</Label>
                      <Input
                        id="contact_name"
                        value={formData.contact_name}
                        onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                        placeholder="Full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_OPTIONS.map(role => (
                            <SelectItem key={role} value={role}>{role}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="relationship">Relationship</Label>
                      <Input
                        id="relationship"
                        value={formData.relationship}
                        onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                        placeholder="e.g., Mother, Foster Carer"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="organisation">Organisation / Agency</Label>
                      <Input
                        id="organisation"
                        value={formData.organisation}
                        onChange={(e) => setFormData({ ...formData, organisation: e.target.value })}
                        placeholder="Organisation name"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Email address"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes"
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_primary"
                      checked={formData.is_primary}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_primary: checked as boolean })}
                    />
                    <Label htmlFor="is_primary" className="cursor-pointer">
                      Mark as primary contact
                    </Label>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                      {editingContact ? "Update Contact" : "Add Contact"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading contacts...</p>
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No contacts added yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.map((contact) => (
                <div key={contact.id} className="border rounded-lg p-4 bg-card hover:bg-accent/30 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm">{contact.contact_name}</h4>
                        {contact.is_primary && (
                          <Star className="h-4 w-4 fill-primary text-primary shrink-0" />
                        )}
                      </div>
                      <div className="grid gap-2 text-sm">
                        {contact.role && (
                          <div className="flex items-start gap-2 text-muted-foreground">
                            <span className="font-medium shrink-0">Role:</span> 
                            <span>{contact.role}</span>
                          </div>
                        )}
                        {contact.relationship && (
                          <div className="flex items-start gap-2 text-muted-foreground">
                            <span className="font-medium shrink-0">Relationship:</span> 
                            <span>{contact.relationship}</span>
                          </div>
                        )}
                        {contact.organisation && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Building2 className="h-4 w-4 shrink-0" />
                            <span>{contact.organisation}</span>
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4 shrink-0" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                        {contact.email && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4 shrink-0" />
                            <span className="truncate">{contact.email}</span>
                          </div>
                        )}
                        {contact.notes && (
                          <div className="text-muted-foreground mt-2 pt-2 border-t text-xs">
                            {contact.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(contact)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => confirmDelete(contact.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this contact? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
