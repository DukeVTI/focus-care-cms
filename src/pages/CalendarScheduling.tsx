import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ModuleHeader } from "@/components/ModuleHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Plus, ChevronLeft, ChevronRight, Clock, MapPin, User, Users, LinkIcon, Trash2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from "date-fns";
import { CreateEventDialog } from "@/components/calendar/CreateEventDialog";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { downloadICS } from "@/utils/icsExport";
import { CalendarEvent } from "@/lib/types";

const EVENT_TYPE_COLORS: Record<string, string> = {
  meeting: "bg-primary/15 text-primary border-primary/30",
  keywork_session: "bg-success/15 text-success border-success/30",
  review: "bg-warning/15 text-warning border-warning/30",
  court_hearing: "bg-destructive/15 text-destructive border-destructive/30",
  medical: "bg-accent text-accent-foreground border-accent",
  education: "bg-secondary text-secondary-foreground border-secondary",
  home_visit: "bg-primary/10 text-primary border-primary/20",
  supervision: "bg-muted text-muted-foreground border-muted",
  training: "bg-success/10 text-success border-success/20",
  other: "bg-muted text-muted-foreground border-muted",
};

export default function CalendarScheduling() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [createOpen, setCreateOpen] = useState(false);
  const [view, setView] = useState<"individual" | "group">("individual");

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading]);

  useEffect(() => {
    if (user) fetchEvents();
  }, [user, currentMonth]);

  const fetchEvents = async () => {
    const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
    const end = format(endOfMonth(currentMonth), "yyyy-MM-dd");
    const { data } = await supabase
      .from("calendar_events")
      .select("*, young_people:young_person_id(first_name, last_name), tasks:linked_task_id(title)")
      .gte("event_date", start)
      .lte("event_date", end)
      .order("event_date")
      .order("start_time");
    if (data) setEvents(data);
  };

  const filteredEvents = useMemo(() => {
    if (view === "group") return events.filter(e => e.is_group_event);
    return events;
  }, [events, view]);

  const selectedDayEvents = useMemo(() => {
    return filteredEvents.filter(e => isSameDay(new Date(e.event_date), selectedDate));
  }, [filteredEvents, selectedDate]);

  const eventDates = useMemo(() => {
    const dates = new Set<string>();
    filteredEvents.forEach(e => dates.add(e.event_date));
    return dates;
  }, [filteredEvents]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("calendar_events").delete().eq("id", id);
    if (!error) {
      toast({ title: "Event deleted" });
      fetchEvents();
    }
  };

  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <ModuleHeader backTo="/dashboard" />
      <main className="container py-6 px-4 md:px-6 max-w-7xl mx-auto space-y-6">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs value={view} onValueChange={(v) => setView(v as any)}>
            <TabsList>
              <TabsTrigger value="individual" className="gap-1.5"><User className="h-3.5 w-3.5" />Individual</TabsTrigger>
              <TabsTrigger value="group" className="gap-1.5"><Users className="h-3.5 w-3.5" />Group</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" /> New Event
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Calendar Grid */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(m => subMonths(m, 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <CardTitle className="text-lg">{format(currentMonth, "MMMM yyyy")}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(m => addMonths(m, 1))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                  <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
                ))}
              </div>
              {/* Day cells */}
              <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
                {monthDays.map(day => {
                  const dateStr = format(day, "yyyy-MM-dd");
                  const hasEvents = eventDates.has(dateStr);
                  const isSelected = isSameDay(day, selectedDate);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isToday = isSameDay(day, new Date());
                  const dayEvents = filteredEvents.filter(e => e.event_date === dateStr);

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        "min-h-[72px] md:min-h-[90px] p-1.5 text-left bg-card transition-colors hover:bg-accent/30 flex flex-col",
                        !isCurrentMonth && "opacity-40",
                        isSelected && "ring-2 ring-primary ring-inset bg-primary/5",
                        isToday && "bg-accent/20"
                      )}
                    >
                      <span className={cn(
                        "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full",
                        isToday && "bg-primary text-primary-foreground"
                      )}>
                        {format(day, "d")}
                      </span>
                      <div className="flex-1 mt-0.5 space-y-0.5 overflow-hidden">
                        {dayEvents.slice(0, 2).map(ev => (
                          <div key={ev.id} className={cn("text-[10px] px-1 py-0.5 rounded truncate border", EVENT_TYPE_COLORS[ev.event_type] || EVENT_TYPE_COLORS.other)}>
                            {ev.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <span className="text-[10px] text-muted-foreground px-1">+{dayEvents.length - 2} more</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Sidebar: Selected Day Events */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {format(selectedDate, "EEEE, d MMMM yyyy")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDayEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground mb-3">No events scheduled</p>
                    <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)} className="gap-1.5">
                      <Plus className="h-3.5 w-3.5" /> Add Event
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDayEvents.map(ev => (
                      <div key={ev.id} className="p-3 rounded-xl bg-muted/50 space-y-2 group relative">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-sm">{ev.title}</p>
                            <Badge variant="outline" className={cn("text-[10px] mt-1", EVENT_TYPE_COLORS[ev.event_type])}>
                              {ev.event_type.replace(/_/g, " ")}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost" size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => downloadICS(ev)}
                              title="Export .ics"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost" size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                              onClick={() => handleDelete(ev.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            {ev.start_time?.slice(0, 5)}{ev.end_time ? ` – ${ev.end_time.slice(0, 5)}` : ""}
                          </div>
                          {ev.location && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3 w-3" />{ev.location}
                            </div>
                          )}
                          {ev.young_people && (
                            <div className="flex items-center gap-1.5">
                              <User className="h-3 w-3" />{ev.young_people.first_name} {ev.young_people.last_name}
                            </div>
                          )}
                          {ev.tasks && (
                            <div className="flex items-center gap-1.5">
                              <LinkIcon className="h-3 w-3" />Task: {ev.tasks.title}
                            </div>
                          )}
                          {ev.is_group_event && ev.participant_names?.length > 0 && (
                            <div className="flex items-center gap-1.5">
                              <Users className="h-3 w-3" />{ev.participant_names.join(", ")}
                            </div>
                          )}
                        </div>
                        {ev.description && <p className="text-xs text-muted-foreground/80 mt-1">{ev.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Upcoming This Month</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredEvents.filter(e => new Date(e.event_date) >= new Date()).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No upcoming events</p>
                ) : (
                  <div className="space-y-2">
                    {filteredEvents
                      .filter(e => new Date(e.event_date) >= new Date())
                      .slice(0, 5)
                      .map(ev => (
                        <div
                          key={ev.id}
                          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => setSelectedDate(new Date(ev.event_date))}
                        >
                          <div className="text-center min-w-[40px]">
                            <p className="text-lg font-bold leading-none">{format(new Date(ev.event_date), "d")}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">{format(new Date(ev.event_date), "EEE")}</p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{ev.title}</p>
                            <p className="text-[11px] text-muted-foreground">{ev.start_time?.slice(0, 5)} · {ev.event_type.replace(/_/g, " ")}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <CreateEventDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={fetchEvents}
        defaultDate={selectedDate}
      />
    </div>
  );
}
