import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface StaffOption {
  id: string;
  full_name: string;
}

interface ReassignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  youngPeople: { id: string; first_name: string; last_name: string }[];
  staff: StaffOption[];
  onReassign: (youngPersonId: string, newStaffId: string, reason: string) => void;
  isSubmitting: boolean;
}

export const ReassignDialog = ({ open, onOpenChange, youngPeople, staff, onReassign, isSubmitting }: ReassignDialogProps) => {
  const [selectedYP, setSelectedYP] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (selectedYP && selectedStaff) {
      onReassign(selectedYP, selectedStaff, reason);
      setSelectedYP("");
      setSelectedStaff("");
      setReason("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reassign Young Person</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Young Person</Label>
            <Select value={selectedYP} onValueChange={setSelectedYP}>
              <SelectTrigger>
                <SelectValue placeholder="Select young person" />
              </SelectTrigger>
              <SelectContent>
                {youngPeople.map(yp => (
                  <SelectItem key={yp.id} value={yp.id}>
                    {yp.first_name} {yp.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Reassign to</Label>
            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
              <SelectTrigger>
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {staff.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Reason (optional)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for reassignment..."
              className="min-h-[80px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!selectedYP || !selectedStaff || isSubmitting}>
            {isSubmitting ? "Reassigning..." : "Reassign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
