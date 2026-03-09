import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/untypedClient";
import { toast } from "sonner";

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

interface InlineEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  youngPersonId: string;
  section: "social_media" | "structured_ids" | "associated_areas";
  initialData: any;
  onSaved: () => void;
}

export const InlineEditDialog = ({ open, onOpenChange, youngPersonId, section, initialData, onSaved }: InlineEditDialogProps) => {
  const [saving, setSaving] = useState(false);

  // Social media state
  const [socialAccounts, setSocialAccounts] = useState<{ platform: string; handle: string; notes: string }[]>([]);
  // Structured IDs state
  const [structuredIds, setStructuredIds] = useState<{ type: string; value: string; expiryDate: string }[]>([]);
  // Associated areas state
  const [areas, setAreas] = useState<string[]>([]);
  const [areasNotes, setAreasNotes] = useState("");
  const [newArea, setNewArea] = useState("");

  useEffect(() => {
    if (open) {
      if (section === "social_media") {
        setSocialAccounts((initialData || []).map((a: any) => ({ ...a })));
      } else if (section === "structured_ids") {
        setStructuredIds((initialData || []).map((a: any) => ({ ...a })));
      } else if (section === "associated_areas") {
        setAreas([...(initialData?.areas || [])]);
        setAreasNotes(initialData?.notes || "");
        setNewArea("");
      }
    }
  }, [open, section, initialData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      let updateData: Record<string, any> = {};

      if (section === "social_media") {
        const valid = socialAccounts.filter(a => a.platform.trim() && a.handle.trim());
        updateData = { social_media_accounts: valid };
      } else if (section === "structured_ids") {
        const valid = structuredIds.filter(i => i.type.trim() && i.value.trim());
        updateData = { structured_ids: valid };
      } else if (section === "associated_areas") {
        updateData = { associated_areas: areas, associated_areas_notes: areasNotes || null };
      }

      const { error } = await supabase
        .from("young_people")
        .update(updateData)
        .eq("id", youngPersonId);

      if (error) throw error;
      toast.success("Updated successfully");
      onSaved();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const title = section === "social_media" ? "Edit Social Media Accounts"
    : section === "structured_ids" ? "Edit Identification Documents"
    : "Edit Associated Areas";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {section === "social_media" && (
            <>
              {socialAccounts.map((acc, i) => (
                <div key={i} className="flex gap-2 items-start border rounded-lg p-3">
                  <div className="flex-1 space-y-2">
                    <Select value={acc.platform} onValueChange={(v) => {
                      const updated = [...socialAccounts];
                      updated[i] = { ...updated[i], platform: v };
                      setSocialAccounts(updated);
                    }}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {socialMediaPlatforms.map(p => (
                          <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Handle / username"
                      value={acc.handle}
                      onChange={(e) => {
                        const updated = [...socialAccounts];
                        updated[i] = { ...updated[i], handle: e.target.value };
                        setSocialAccounts(updated);
                      }}
                      className="h-9"
                    />
                    <Input
                      placeholder="Notes (optional)"
                      value={acc.notes || ""}
                      onChange={(e) => {
                        const updated = [...socialAccounts];
                        updated[i] = { ...updated[i], notes: e.target.value };
                        setSocialAccounts(updated);
                      }}
                      className="h-9"
                    />
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSocialAccounts(socialAccounts.filter((_, j) => j !== i))} className="text-destructive h-9 w-9 p-0 shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setSocialAccounts([...socialAccounts, { platform: "", handle: "", notes: "" }])} className="w-full gap-1">
                <Plus className="h-4 w-4" /> Add Account
              </Button>
              {socialAccounts.some(a => !a.platform.trim() || !a.handle.trim()) && socialAccounts.length > 0 && (
                <p className="text-xs text-amber-600">Rows with empty platform or handle will be removed on save.</p>
              )}
            </>
          )}

          {section === "structured_ids" && (
            <>
              {structuredIds.map((id, i) => (
                <div key={i} className="flex gap-2 items-start border rounded-lg p-3">
                  <div className="flex-1 space-y-2">
                    <Select value={id.type} onValueChange={(v) => {
                      const updated = [...structuredIds];
                      updated[i] = { ...updated[i], type: v };
                      setStructuredIds(updated);
                    }}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Document type" />
                      </SelectTrigger>
                      <SelectContent>
                        {idTypes.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Reference number"
                      value={id.value}
                      onChange={(e) => {
                        const updated = [...structuredIds];
                        updated[i] = { ...updated[i], value: e.target.value };
                        setStructuredIds(updated);
                      }}
                      className="h-9"
                    />
                    <div>
                      <Label className="text-xs text-muted-foreground">Expiry date (optional)</Label>
                      <Input
                        type="date"
                        value={id.expiryDate || ""}
                        onChange={(e) => {
                          const updated = [...structuredIds];
                          updated[i] = { ...updated[i], expiryDate: e.target.value };
                          setStructuredIds(updated);
                        }}
                        className="h-9"
                      />
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setStructuredIds(structuredIds.filter((_, j) => j !== i))} className="text-destructive h-9 w-9 p-0 shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setStructuredIds([...structuredIds, { type: "", value: "", expiryDate: "" }])} className="w-full gap-1">
                <Plus className="h-4 w-4" /> Add Document
              </Button>
              {structuredIds.some(i => !i.type.trim() || !i.value.trim()) && structuredIds.length > 0 && (
                <p className="text-xs text-amber-600">Rows with empty type or reference will be removed on save.</p>
              )}
            </>
          )}

          {section === "associated_areas" && (
            <>
              <div className="flex flex-wrap gap-2">
                {areas.map((area, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent text-accent-foreground rounded-md text-sm">
                    {area}
                    <button onClick={() => setAreas(areas.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive ml-1">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add area (e.g. Camden Town)"
                  value={newArea}
                  onChange={(e) => setNewArea(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newArea.trim()) {
                      e.preventDefault();
                      setAreas([...areas, newArea.trim()]);
                      setNewArea("");
                    }
                  }}
                  className="h-9"
                />
                <Button variant="outline" size="sm" onClick={() => {
                  if (newArea.trim()) {
                    setAreas([...areas, newArea.trim()]);
                    setNewArea("");
                  }
                }} className="shrink-0 h-9">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <Label className="text-sm">Notes</Label>
                <Textarea
                  value={areasNotes}
                  onChange={(e) => setAreasNotes(e.target.value)}
                  placeholder="Notes on associated areas..."
                  className="min-h-[60px] mt-1"
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
