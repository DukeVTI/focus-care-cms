import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { YoungPerson, Task, Profile } from "@/lib/types";
import { NotificationService } from "@/utils/notificationService";
import { 
  CALENDAR_ACTIVITY_TYPE_LABELS, 
  CALENDAR_EVENT_STATUS_LABELS,
  CALENDAR_ACTIVITY_TYPES,
  CALENDAR_EVENT_STATUSES
} from "@/lib/constants";

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
  defaultDate?: Date;
}

const EVENT_TYPES = [
  { value: "meeting", label: "Meeting" },
  { value: "keywork_session", label: "Keywork Session" },
  { value: "review", label: "Review / LAC Review" },
  { value: "court_hearing", label: "Court Hearing" },
  { value: "medical", label: "Medical Appointment" },
  { value: "education", label: "Education Meeting" },
  { value: "home_visit", label: "Home Visit" },
  { value: "supervision", label: "Supervision" },
  { value: "training", label: "Training" },
  { value: "other", label: "Other" },
];

export function CreateEventDialog({ open, onOpenChange, onCreated, defaultDate }: CreateEventDialogProps) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [youngPeople, setYoungPeople] = useState<YoungPerson[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [staff, setStaff] = useState<Profile[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("meeting");
  const [eventDate, setEventDate] = useState<Date | undefined>(defaultDate || new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [location, setLocation] = useState("");
  const [youngPersonId, setYoungPersonId] = useState("");
  const [linkedTaskId, setLinkedTaskId] = useState("");
  const [isGroupEvent, setIsGroupEvent] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [recurrence, setRecurrence] = useState("none");
  const [notes, setNotes] = useState("");
  const [activityType, setActivityType] = useState<string>(CALENDAR_ACTIVITY_TYPES.ADMINISTRATIVE);
  const [status, setStatus] = useState<string>(CALENDAR_EVENT_STATUSES.SCHEDULED);

  useEffect(() => {
    if (open && user) {
      fetchDropdowns();
    }
  }, [open, user]);

  useEffect(() => {
    if (defaultDate) setEventDate(defaultDate);
  }, [defaultDate]);

  const fetchDropdowns = async () => {
    if (!user) return;
    const [ypRes, taskRes, staffRes] = await Promise.all([
      supabase.from("young_people").select("id, first_name, last_name").eq("user_id", user.id).order("first_name"),
      supabase.from("tasks").select("id, title").eq("assigned_to", user.id).eq("status", "pending").order("created_at", { ascending: false }).limit(20),
      supabase.from("profiles").select("id, full_name").order("full_name"),
    ]);
    if (ypRes.data) setYoungPeople(ypRes.data as any);
    if (taskRes.data) setTasks(taskRes.data as any);
    if (staffRes.data) setStaff(staffRes.data.filter((s: any) => s.id !== user.id) as any);
  };

  const handleSave = async () => {
    if (!title.trim() || !eventDate || !user) {
      toast({ title: "Title and date are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const participantNames = staff.filter(s => selectedParticipants.includes(s.id)).map(s => s.full_name || "Unknown");

    const { error } = await supabase.from("calendar_events").insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      event_type: eventType,
      event_date: format(eventDate, "yyyy-MM-dd"),
      start_time: startTime,
      end_time: endTime || null,
      location: location.trim() || null,
      young_person_id: youngPersonId || null,
      linked_task_id: linkedTaskId || null,
      is_group_event: isGroupEvent,
      participants: selectedParticipants,
      participant_names: participantNames,
      recurrence,
      activity_type: activityType,
      status: status,
      notes: notes.trim() || null,
    });

    setSaving(false);
    if (error) {
      toast({ title: "Failed to create event", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Event created" });
      
      // Send notifications to participants
      if (selectedParticipants.length > 0 && user?.email) {
        for (const participantId of selectedParticipants) {
          const participant = staff.find(s => s.id === participantId);
          if (participant?.email) {
            await NotificationService.enqueueNotification(
              participant.email,
              participantId,
              "calendar_created",
              {
                event_title: title,
                event_date: format(eventDate!, "PPP"),
                event_time: startTime,
                location: location || "TBD",
              }
            );
          }
        }
      }
      
      resetForm();
      onCreated();
      onOpenChange(false);
    }
  };

  const resetForm = () => {
    setTitle(""); 
    setDescription(""); 
    setEventType("meeting"); 
    setStartTime("09:00"); 
    setEndTime("10:00");
    setLocation(""); 
    setYoungPersonId(""); 
    setLinkedTaskId(""); 
    setIsGroupEvent(false);
    setSelectedParticipants([]); 
    setRecurrence("none"); 
    setNotes("");
    setActivityType(CALENDAR_ACTIVITY_TYPES.ADMINISTRATIVE);
    setStatus(CALENDAR_EVENT_STATUSES.SCHEDULED);
  };

  const toggleParticipant = (id: string) => {
    setSelectedParticipants(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Event</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Title *</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Event title" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Type</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !eventDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {eventDate ? format(eventDate, "PPP") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={eventDate} onSelect={setEventDate} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Start Time</Label>
              <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
            </div>
            <div>
              <Label>End Time</Label>
              <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Location</Label>
            <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Office, Virtual, Home Visit" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Activity Type</Label>
              <Select value={activityType} onValueChange={setActivityType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CALENDAR_ACTIVITY_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CALENDAR_EVENT_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Young Person</Label>
            <Select value={youngPersonId} onValueChange={setYoungPersonId}>
              <SelectTrigger><SelectValue placeholder="Select young person (optional)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {youngPeople.map(yp => <SelectItem key={yp.id} value={yp.id}>{yp.first_name} {yp.last_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Link to Task (Diarize)</Label>
            <Select value={linkedTaskId} onValueChange={setLinkedTaskId}>
              <SelectTrigger><SelectValue placeholder="Link a task (optional)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {tasks.map(t => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label>Group Event</Label>
            <Switch checked={isGroupEvent} onCheckedChange={setIsGroupEvent} />
          </div>

          {isGroupEvent && staff.length > 0 && (
            <div>
              <Label>Participants</Label>
              <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1 mt-1">
                {staff.map(s => (
                  <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-1 rounded">
                    <input type="checkbox" checked={selectedParticipants.includes(s.id)} onChange={() => toggleParticipant(s.id)} className="rounded" />
                    {s.full_name || "Unknown"}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label>Recurrence</Label>
            <Select value={recurrence} onValueChange={setRecurrence}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="fortnightly">Fortnightly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Event details..." rows={2} />
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional notes..." rows={2} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Create Event"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
