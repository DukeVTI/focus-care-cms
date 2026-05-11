import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ReassignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: any;
  onReassigned: () => void;
}

export function ReassignDialog({ open, onOpenChange, task, onReassigned }: ReassignDialogProps) {
  const [newUserId, setNewUserId] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleReassign = async () => {
    if (!newUserId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a user ID",
        variant: "destructive"
      });
      return;
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(newUserId)) {
      toast({
        title: "Error",
        description: "Invalid user ID format",
        variant: "destructive"
      });
      return;
    }

    // Prevent self-assignment
    const currentAssignee = task.assigned_to_user_id || task.assigned_to;
    if (newUserId === currentAssignee) {
      toast({
        title: "Error",
        description: "Task is already assigned to this user",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    // Verify user exists and has valid role
    const { data: targetUser, error: userError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('id', newUserId)
      .single();

    if (userError || !targetUser) {
      toast({
        title: "Error",
        description: "User not found or inactive",
        variant: "destructive"
      });
      setSubmitting(false);
      return;
    }

    // Check if user has a valid role in user_roles table
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', newUserId);

    if (roleError || !userRoles || userRoles.length === 0) {
      toast({
        title: "Error",
        description: "User does not have permission to be assigned tasks",
        variant: "destructive"
      });
      setSubmitting(false);
      return;
    }

    // Get current reassignment history
    const history = task.reassigned_history || [];
    
    // Add new entry to history
    const newHistoryEntry = {
      fromUserId: currentAssignee,
      toUserId: newUserId,
      at: new Date().toISOString(),
      note: note || undefined
    };

    const { error } = await supabase
      .from("tasks")
      .update({
        assignee_type: "STAFF_NAMED",
        assigned_to_user_id: newUserId,
        assigned_to: newUserId,
        reassigned_history: [...history, newHistoryEntry]
      })
      .eq("id", task.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to reassign task",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: `Task reassigned to ${targetUser.full_name}`
      });
      setNewUserId("");
      setNote("");
      onOpenChange(false);
      onReassigned();
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reassign Task</DialogTitle>
          <DialogDescription>
            Assign this task to a different staff member.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="newUserId">New Assignee User ID</Label>
            <Input
              id="newUserId"
              value={newUserId}
              onChange={(e) => setNewUserId(e.target.value)}
              placeholder="Enter user ID"
            />
            <p className="text-xs text-muted-foreground">
              Future enhancement: User picker dropdown
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Reason for reassignment..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleReassign} disabled={submitting}>
            {submitting ? "Reassigning..." : "Reassign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
