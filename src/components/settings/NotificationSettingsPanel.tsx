import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationService } from "@/utils/notificationService";
import { NotificationPreferences } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { DIGEST_FREQUENCY_LABELS } from "@/lib/constants";
import { Bell, CheckCircle2, AlertCircle } from "lucide-react";

export function NotificationSettingsPanel() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadPreferences();
    }
  }, [user?.id]);

  const loadPreferences = async () => {
    setLoading(true);
    const prefs = await NotificationService.getPreferences(user?.id || "");
    setPreferences(prefs);
    setLoading(false);
  };

  const handleToggle = async (
    key: keyof NotificationPreferences,
    value: boolean
  ) => {
    if (!preferences || !user?.id) return;

    setSaving(true);
    const updated = await NotificationService.updatePreferences(user.id, {
      [key]: value,
    } as Partial<NotificationPreferences>);

    if (updated) {
      setPreferences(updated);
      toast({ title: "Preference updated" });
    } else {
      toast({
        title: "Failed to update preference",
        variant: "destructive",
      });
    }
    setSaving(false);
  };

  const handleDigestChange = async (frequency: string) => {
    if (!preferences || !user?.id) return;

    setSaving(true);
    const updated = await NotificationService.updatePreferences(user.id, {
      digest_frequency: frequency,
    } as Partial<NotificationPreferences>);

    if (updated) {
      setPreferences(updated);
      toast({ title: "Digest settings updated" });
    } else {
      toast({
        title: "Failed to update digest settings",
        variant: "destructive",
      });
    }
    setSaving(false);
  };

  if (loading) return <div>Loading notification settings...</div>;
  if (!preferences) return <div>Could not load notification settings</div>;

  return (
    <div className="space-y-6">
      {/* Health & Wellbeing Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Health & Wellbeing
          </CardTitle>
          <CardDescription>
            Alerts about health conditions and crisis situations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Crisis-Level Health Alerts (Rating 5)</Label>
            <Switch
              checked={preferences.notify_health_crisis}
              onCheckedChange={(v) => handleToggle("notify_health_crisis", v)}
              disabled={saving}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Health Condition Updates</Label>
            <Switch
              checked={preferences.notify_health_updates}
              onCheckedChange={(v) => handleToggle("notify_health_updates", v)}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Calendar Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            Calendar & Meetings
          </CardTitle>
          <CardDescription>
            Reminders about scheduled events and appointments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Event Created Notifications</Label>
            <Switch
              checked={preferences.notify_calendar_created}
              onCheckedChange={(v) => handleToggle("notify_calendar_created", v)}
              disabled={saving}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>24-Hour Before Event</Label>
            <Switch
              checked={preferences.notify_calendar_24h}
              onCheckedChange={(v) => handleToggle("notify_calendar_24h", v)}
              disabled={saving}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>48-Hours Before Event</Label>
            <Switch
              checked={preferences.notify_calendar_48h}
              onCheckedChange={(v) => handleToggle("notify_calendar_48h", v)}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Task Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            Tasks & Actions
          </CardTitle>
          <CardDescription>
            Reminders about task assignments and deadlines
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Task Assigned to Me</Label>
            <Switch
              checked={preferences.notify_task_assigned}
              onCheckedChange={(v) => handleToggle("notify_task_assigned", v)}
              disabled={saving}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Task Due Soon</Label>
            <Switch
              checked={preferences.notify_task_due}
              onCheckedChange={(v) => handleToggle("notify_task_due", v)}
              disabled={saving}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>48-Hours Before Task Due</Label>
            <Switch
              checked={preferences.notify_task_48h}
              onCheckedChange={(v) => handleToggle("notify_task_48h", v)}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Risk Assessment
          </CardTitle>
          <CardDescription>
            Alerts about risk assessments and changes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Risk Assessment Updated</Label>
            <Switch
              checked={preferences.notify_risk_updated}
              onCheckedChange={(v) => handleToggle("notify_risk_updated", v)}
              disabled={saving}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>High Risk Assessment Alert</Label>
            <Switch
              checked={preferences.notify_risk_high}
              onCheckedChange={(v) => handleToggle("notify_risk_high", v)}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Document Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>
            Notifications about uploaded documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label>Document Uploaded</Label>
            <Switch
              checked={preferences.notify_document_uploaded}
              onCheckedChange={(v) => handleToggle("notify_document_uploaded", v)}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Email Digest Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Email Digest</CardTitle>
          <CardDescription>
            Receive a summary of all notifications at once
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable Email Digest</Label>
            <Switch
              checked={preferences.digest_enabled}
              onCheckedChange={(v) => handleToggle("digest_enabled", v)}
              disabled={saving}
            />
          </div>
          {preferences.digest_enabled && (
            <div>
              <Label className="block mb-2">Digest Frequency</Label>
              <Select
                value={preferences.digest_frequency}
                onValueChange={handleDigestChange}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DIGEST_FREQUENCY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
