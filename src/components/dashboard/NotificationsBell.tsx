import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  title: string;
  message: string | null;
  severity: string;
  alert_type: string;
  is_read: boolean;
  created_at: string;
}

export function NotificationsBell() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [open, setOpen] = useState(false);

  const unreadCount = alerts.filter((a) => !a.is_read).length;

  useEffect(() => {
    if (!user) return;
    fetchAlerts();
  }, [user]);

  const fetchAlerts = async () => {
    const { data } = await supabase
      .from("alerts")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setAlerts(data);
  };

  const markAsRead = async (id: string) => {
    await supabase.from("alerts").update({ is_read: true }).eq("id", id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, is_read: true } : a)));
  };

  const markAllRead = async () => {
    const unreadIds = alerts.filter((a) => !a.is_read).map((a) => a.id);
    if (unreadIds.length === 0) return;
    await supabase.from("alerts").update({ is_read: true }).in("id", unreadIds);
    setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })));
  };

  const severityColor: Record<string, string> = {
    critical: "bg-destructive/15 text-destructive",
    high: "bg-warning/15 text-warning",
    info: "bg-primary/15 text-primary",
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground min-w-[18px] h-[18px] px-1">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="text-sm font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={markAllRead}>
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No notifications</p>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "flex flex-col gap-1 px-4 py-3 border-b last:border-0 cursor-pointer transition-colors hover:bg-muted/50",
                  !alert.is_read && "bg-primary/5"
                )}
                onClick={() => markAsRead(alert.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className={cn("text-sm font-medium leading-tight", !alert.is_read && "font-semibold")}>
                    {alert.title}
                  </p>
                  <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0", severityColor[alert.severity] || severityColor.info)}>
                    {alert.severity}
                  </span>
                </div>
                {alert.message && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{alert.message}</p>
                )}
                <p className="text-[11px] text-muted-foreground/70">
                  {format(new Date(alert.created_at), "MMM d, h:mm a")}
                </p>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
