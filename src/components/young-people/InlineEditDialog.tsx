import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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

const exploitationOptions = [
  { value: "cse", label: "Child Sexual Exploitation (CSE)" },
  { value: "cce", label: "Child Criminal Exploitation (CCE)" },
  { value: "county-lines", label: "County Lines" },
  { value: "modern-slavery", label: "Modern Slavery / Trafficking" },
  { value: "radicalisation", label: "Radicalisation / Extremism" },
  { value: "financial-exploitation", label: "Financial Exploitation" },
  { value: "online-exploitation", label: "Online Exploitation" },
  { value: "forced-marriage", label: "Forced Marriage" },
  { value: "fgm", label: "FGM" },
  { value: "honour-based", label: "Honour-Based Abuse" },
];

const probationOrders = [
  { value: "referral-order", label: "Referral Order" },
  { value: "youth-rehabilitation", label: "Youth Rehabilitation Order (YRO)" },
  { value: "detention-training", label: "Detention & Training Order (DTO)" },
  { value: "youth-conditional-caution", label: "Youth Conditional Caution" },
  { value: "community-resolution", label: "Community Resolution" },
  { value: "bail-conditions", label: "Bail Conditions" },
  { value: "issp", label: "ISSP (Intensive Supervision)" },
  { value: "other", label: "Other" },
];

export type EditSection = "social_media" | "structured_ids" | "associated_areas" | "exploitation" | "yot_details";

interface InlineEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  youngPersonId: string;
  section: EditSection;
  initialData: any;
  onSaved: () => void;
}

export const InlineEditDialog = ({ open, onOpenChange, youngPersonId, section, initialData, onSaved }: InlineEditDialogProps) => {
  const [saving, setSaving] = useState(false);

  // Social media
  const [socialAccounts, setSocialAccounts] = useState<{ platform: string; handle: string; notes: string }[]>([]);
  // Structured IDs
  const [structuredIds, setStructuredIds] = useState<{ type: string; value: string; expiryDate: string }[]>([]);
  // Associated areas
  const [areas, setAreas] = useState<string[]>([]);
  const [areasNotes, setAreasNotes] = useState("");
  const [newArea, setNewArea] = useState("");
  // Exploitation
  const [exploitationCategories, setExploitationCategories] = useState<string[]>([]);
  const [exploitationNotes, setExploitationNotes] = useState("");
  // YOT
  const [yotInvolved, setYotInvolved] = useState(false);
  const [yotWorkerName, setYotWorkerName] = useState("");
  const [yotWorkerPhone, setYotWorkerPhone] = useState("");
  const [yotWorkerEmail, setYotWorkerEmail] = useState("");
  const [probationOrder, setProbationOrder] = useState("");
  const [probationEndDate, setProbationEndDate] = useState("");

  useEffect(() => {
    if (!open) return;
    if (section === "social_media") {
      setSocialAccounts((initialData || []).map((a: any) => ({ ...a })));
    } else if (section === "structured_ids") {
      setStructuredIds((initialData || []).map((a: any) => ({ ...a })));
    } else if (section === "associated_areas") {
      setAreas([...(initialData?.areas || [])]);
      setAreasNotes(initialData?.notes || "");
      setNewArea("");
    } else if (section === "exploitation") {
      setExploitationCategories([...(initialData?.categories || [])]);
      setExploitationNotes(initialData?.notes || "");
    } else if (section === "yot_details") {
      setYotInvolved(!!initialData?.yot_involved);
      setYotWorkerName(initialData?.yot_worker_name || "");
      setYotWorkerPhone(initialData?.yot_worker_phone || "");
      setYotWorkerEmail(initialData?.yot_worker_email || "");
      setProbationOrder(initialData?.probation_order || "");
      setProbationEndDate(initialData?.probation_end_date || "");
    }
  }, [open, section, initialData]);

  const toggleExploitation = (val: string) => {
    setExploitationCategories(prev =>
      prev.includes(val) ? prev.filter(c => c !== val) : [...prev, val]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let updateData: Record<string, any> = {};

      if (section === "social_media") {
        updateData = { social_media_accounts: socialAccounts.filter(a => a.platform.trim() && a.handle.trim()) };
      } else if (section === "structured_ids") {
        updateData = { structured_ids: structuredIds.filter(i => i.type.trim() && i.value.trim()) };
      } else if (section === "associated_areas") {
        updateData = { associated_areas: areas, associated_areas_notes: areasNotes || null };
      } else if (section === "exploitation") {
        updateData = { exploitation_categories: exploitationCategories, exploitation_notes: exploitationNotes || null };
      } else if (section === "yot_details") {
        updateData = {
          yot_involved: yotInvolved,
          yot_worker_name: yotWorkerName || null,
          yot_worker_phone: yotWorkerPhone || null,
          yot_worker_email: yotWorkerEmail || null,
          probation_order: probationOrder || null,
          probation_end_date: probationEndDate || null,
        };
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

  const titles: Record<EditSection, string> = {
    social_media: "Edit Social Media Accounts",
    structured_ids: "Edit Identification Documents",
    associated_areas: "Edit Associated Areas",
    exploitation: "Edit Exploitation Concerns",
    yot_details: "Edit YOT / Probation Details",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{titles[section]}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">

          {/* ── Social Media ── */}
          {section === "social_media" && (
            <>
              {socialAccounts.map((acc, i) => (
                <div key={i} className="flex gap-2 items-start border rounded-lg p-3">
                  <div className="flex-1 space-y-2">
                    <Select value={acc.platform} onValueChange={(v) => { const u = [...socialAccounts]; u[i] = { ...u[i], platform: v }; setSocialAccounts(u); }}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Platform" /></SelectTrigger>
                      <SelectContent>{socialMediaPlatforms.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input placeholder="Handle / username" value={acc.handle} className="h-9"
                      onChange={(e) => { const u = [...socialAccounts]; u[i] = { ...u[i], handle: e.target.value }; setSocialAccounts(u); }} />
                    <Input placeholder="Notes (optional)" value={acc.notes || ""} className="h-9"
                      onChange={(e) => { const u = [...socialAccounts]; u[i] = { ...u[i], notes: e.target.value }; setSocialAccounts(u); }} />
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSocialAccounts(socialAccounts.filter((_, j) => j !== i))} className="text-destructive h-9 w-9 p-0 shrink-0"><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full gap-1" onClick={() => setSocialAccounts([...socialAccounts, { platform: "", handle: "", notes: "" }])}>
                <Plus className="h-4 w-4" /> Add Account
              </Button>
              {socialAccounts.some(a => !a.platform.trim() || !a.handle.trim()) && socialAccounts.length > 0 && (
                <p className="text-xs text-amber-600">Rows with empty platform or handle will be removed on save.</p>
              )}
            </>
          )}

          {/* ── Structured IDs ── */}
          {section === "structured_ids" && (
            <>
              {structuredIds.map((sid, i) => (
                <div key={i} className="flex gap-2 items-start border rounded-lg p-3">
                  <div className="flex-1 space-y-2">
                    <Select value={sid.type} onValueChange={(v) => { const u = [...structuredIds]; u[i] = { ...u[i], type: v }; setStructuredIds(u); }}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Document type" /></SelectTrigger>
                      <SelectContent>{idTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input placeholder="Reference number" value={sid.value} className="h-9"
                      onChange={(e) => { const u = [...structuredIds]; u[i] = { ...u[i], value: e.target.value }; setStructuredIds(u); }} />
                    <div>
                      <Label className="text-xs text-muted-foreground">Expiry date (optional)</Label>
                      <Input type="date" value={sid.expiryDate || ""} className="h-9"
                        onChange={(e) => { const u = [...structuredIds]; u[i] = { ...u[i], expiryDate: e.target.value }; setStructuredIds(u); }} />
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setStructuredIds(structuredIds.filter((_, j) => j !== i))} className="text-destructive h-9 w-9 p-0 shrink-0"><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full gap-1" onClick={() => setStructuredIds([...structuredIds, { type: "", value: "", expiryDate: "" }])}>
                <Plus className="h-4 w-4" /> Add Document
              </Button>
              {structuredIds.some(s => !s.type.trim() || !s.value.trim()) && structuredIds.length > 0 && (
                <p className="text-xs text-amber-600">Rows with empty type or reference will be removed on save.</p>
              )}
            </>
          )}

          {/* ── Associated Areas ── */}
          {section === "associated_areas" && (
            <>
              <div className="flex flex-wrap gap-2 min-h-[32px]">
                {areas.map((area, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent text-accent-foreground rounded-md text-sm">
                    {area}
                    <button onClick={() => setAreas(areas.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive ml-1">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {areas.length === 0 && <p className="text-sm text-muted-foreground">No areas yet.</p>}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Add area (e.g. Camden Town)" value={newArea} className="h-9"
                  onChange={(e) => setNewArea(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && newArea.trim()) { e.preventDefault(); setAreas([...areas, newArea.trim()]); setNewArea(""); } }} />
                <Button variant="outline" size="sm" className="shrink-0 h-9" onClick={() => { if (newArea.trim()) { setAreas([...areas, newArea.trim()]); setNewArea(""); } }}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <Label className="text-sm">Notes</Label>
                <Textarea value={areasNotes} onChange={(e) => setAreasNotes(e.target.value)} placeholder="Notes on associated areas..." className="min-h-[60px] mt-1" />
              </div>
            </>
          )}

          {/* ── Exploitation Concerns ── */}
          {section === "exploitation" && (
            <>
              <div className="grid grid-cols-1 gap-2">
                {exploitationOptions.map(opt => (
                  <div key={opt.value} className="flex items-center gap-3 border rounded-lg p-3 hover:bg-accent/50">
                    <Checkbox
                      id={`exploit-${opt.value}`}
                      checked={exploitationCategories.includes(opt.value)}
                      onCheckedChange={() => toggleExploitation(opt.value)}
                    />
                    <Label htmlFor={`exploit-${opt.value}`} className="cursor-pointer flex-1">{opt.label}</Label>
                  </div>
                ))}
              </div>
              {exploitationCategories.length > 0 && (
                <div>
                  <Label className="text-sm">Additional notes</Label>
                  <Textarea value={exploitationNotes} onChange={(e) => setExploitationNotes(e.target.value)} placeholder="Additional context on exploitation concerns..." className="min-h-[80px] mt-1" />
                </div>
              )}
            </>
          )}

          {/* ── YOT / Probation ── */}
          {section === "yot_details" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 border rounded-lg p-3">
                <Checkbox id="yot-involved" checked={yotInvolved} onCheckedChange={(v) => setYotInvolved(!!v)} />
                <Label htmlFor="yot-involved" className="cursor-pointer font-medium">Youth Offending Team (YOT) Involved</Label>
              </div>
              {yotInvolved && (
                <div className="space-y-3 pl-4 border-l-2 border-primary">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm">YOT Worker Name</Label>
                      <Input value={yotWorkerName} onChange={(e) => setYotWorkerName(e.target.value)} placeholder="Full name" className="h-9 mt-1" />
                    </div>
                    <div>
                      <Label className="text-sm">YOT Worker Phone</Label>
                      <Input value={yotWorkerPhone} onChange={(e) => setYotWorkerPhone(e.target.value)} placeholder="Phone number" className="h-9 mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm">YOT Worker Email</Label>
                    <Input type="email" value={yotWorkerEmail} onChange={(e) => setYotWorkerEmail(e.target.value)} placeholder="email@example.com" className="h-9 mt-1" />
                  </div>
                  <div>
                    <Label className="text-sm">Probation / Court Order Type</Label>
                    <Select value={probationOrder} onValueChange={setProbationOrder}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select order type" /></SelectTrigger>
                      <SelectContent>{probationOrders.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm">Order End Date</Label>
                    <Input type="date" value={probationEndDate} onChange={(e) => setProbationEndDate(e.target.value)} className="h-9 mt-1" />
                  </div>
                </div>
              )}
            </div>
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
