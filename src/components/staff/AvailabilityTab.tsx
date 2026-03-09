import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Clock, Edit2, Check, X } from "lucide-react";

interface StaffAvailability {
  id: string;
  full_name: string;
  email: string;
  team?: string;
  availability_status: string;
  availability_note?: string;
}

interface AvailabilityTabProps {
  staff: StaffAvailability[];
  isAdmin: boolean;
  onUpdateAvailability: (userId: string, status: string, note: string) => void;
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  available: { label: "Available", color: "bg-emerald-500/15 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  busy: { label: "Busy", color: "bg-amber-500/15 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  on_leave: { label: "On Leave", color: "bg-sky-500/15 text-sky-700 border-sky-200", dot: "bg-sky-500" },
  off_shift: { label: "Off Shift", color: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground" },
};

export const AvailabilityTab = ({ staff, isAdmin, onUpdateAvailability }: AvailabilityTabProps) => {
  const { user } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editNote, setEditNote] = useState("");

  const startEdit = (member: StaffAvailability) => {
    setEditingId(member.id);
    setEditStatus(member.availability_status || "available");
    setEditNote(member.availability_note || "");
  };

  const saveEdit = () => {
    if (editingId) {
      onUpdateAvailability(editingId, editStatus, editNote);
      setEditingId(null);
    }
  };

  const grouped: Record<string, StaffAvailability[]> = {};
  for (const s of staff) {
    const status = s.availability_status || "available";
    if (!grouped[status]) grouped[status] = [];
    grouped[status].push(s);
  }

  const statusOrder = ["available", "busy", "on_leave", "off_shift"];

  return (
    <div className="space-y-6">
      {/* Summary badges */}
      <div className="flex flex-wrap gap-3">
        {statusOrder.map(status => {
          const count = grouped[status]?.length || 0;
          const config = statusConfig[status];
          return (
            <div key={status} className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card">
              <div className={`h-2.5 w-2.5 rounded-full ${config.dot}`} />
              <span className="text-sm font-medium">{config.label}</span>
              <Badge variant="secondary" className="text-xs">{count}</Badge>
            </div>
          );
        })}
      </div>

      {/* Staff list by status */}
      {statusOrder.map(status => {
        const members = grouped[status];
        if (!members?.length) return null;
        const config = statusConfig[status];

        return (
          <div key={status}>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${config.dot}`} />
              {config.label} ({members.length})
            </h3>
            <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {members.map(member => (
                <Card key={member.id} className="transition-all hover:shadow-sm">
                  <CardContent className="pt-4 pb-4">
                    {editingId === member.id ? (
                      <div className="space-y-3">
                        <p className="font-medium">{member.full_name}</p>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Status</Label>
                          <Select value={editStatus} onValueChange={setEditStatus}>
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOrder.map(s => (
                                <SelectItem key={s} value={s}>{statusConfig[s].label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Note</Label>
                          <Input
                            value={editNote}
                            onChange={(e) => setEditNote(e.target.value)}
                            placeholder="e.g. Back Monday"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="default" onClick={saveEdit} className="h-7 text-xs">
                            <Check className="h-3 w-3 mr-1" /> Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-7 text-xs">
                            <X className="h-3 w-3 mr-1" /> Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-sm">
                            {member.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{member.full_name}</p>
                            {member.availability_note && (
                              <p className="text-xs text-muted-foreground italic">"{member.availability_note}"</p>
                            )}
                            {member.team && <p className="text-xs text-muted-foreground">{member.team}</p>}
                          </div>
                        </div>
                        {(isAdmin || member.id === user?.id) && (
                          <Button size="sm" variant="ghost" onClick={() => startEdit(member)} className="h-7 w-7 p-0">
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
