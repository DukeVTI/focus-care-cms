/**
 * Email Notification Service
 * Handles notification queueing, logging, and preferences management
 */

import { supabase } from "@/integrations/supabase/client";
import { NotificationType, NOTIFICATION_TYPES } from "@/lib/constants";
import { NotificationQueueItem, NotificationPreferences } from "@/lib/types";

// ============================================================================
// NOTIFICATION PAYLOAD TYPES
// ============================================================================

export interface HealthCrisisPayload {
  young_person_name: string;
  young_person_id: string;
  condition_name: string;
  rating: number;
  severity_level: string;
}

export interface CalendarEventPayload {
  event_title: string;
  event_date: string;
  event_time: string;
  location?: string;
  young_person_name?: string;
  hours_until_event?: number;
}

export interface TaskPayload {
  task_title: string;
  task_id: string;
  due_date: string;
  young_person_name?: string;
  hours_until_due?: number;
}

export interface RiskAssessmentPayload {
  risk_level: string;
  risk_score: number;
  young_person_name: string;
  assessment_date: string;
  recommendations?: string;
}

// ============================================================================
// NOTIFICATION SERVICE
// ============================================================================

export class NotificationService {
  /**
   * Enqueue a notification for sending
   */
  static async enqueueNotification(
    recipientEmail: string,
    recipientUserId: string | null,
    notificationType: NotificationType,
    payload: Record<string, any>,
    scheduledFor: Date = new Date()
  ): Promise<NotificationQueueItem | null> {
    try {
      const { data, error } = await supabase
        .from("notification_queue")
        .insert({
          notification_type: notificationType,
          recipient_email: recipientEmail,
          recipient_user_id: recipientUserId,
          payload,
          scheduled_for: scheduledFor.toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Failed to enqueue notification:", error);
        return null;
      }

      return data;
    } catch (err) {
      console.error("Error enqueuing notification:", err);
      return null;
    }
  }

  /**
   * Get user's notification preferences
   */
  static async getPreferences(
    userId: string
  ): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned, which is expected for new users
        console.error("Failed to fetch preferences:", error);
        return null;
      }

      // If no preferences exist, create defaults
      if (!data) {
        return await NotificationService.initializePreferences(userId);
      }

      return data;
    } catch (err) {
      console.error("Error fetching preferences:", err);
      return null;
    }
  }

  /**
   * Initialize default notification preferences for new user
   */
  static async initializePreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .insert({
          user_id: userId,
          // All notifications enabled by default
          notify_health_crisis: true,
          notify_health_updates: true,
          notify_calendar_created: true,
          notify_calendar_24h: true,
          notify_calendar_48h: false,
          notify_task_assigned: true,
          notify_task_due: true,
          notify_task_48h: false,
          notify_risk_updated: true,
          notify_risk_high: true,
          notify_document_uploaded: true,
          digest_enabled: false,
          digest_frequency: "daily",
        })
        .select()
        .single();

      if (error) {
        console.error("Failed to initialize preferences:", error);
        return null;
      }

      return data;
    } catch (err) {
      console.error("Error initializing preferences:", err);
      return null;
    }
  }

  /**
   * Check if a specific notification type is enabled for user
   */
  static async isNotificationEnabled(
    userId: string,
    notificationType: NotificationType
  ): Promise<boolean> {
    const prefs = await NotificationService.getPreferences(userId);
    if (!prefs) return true; // Default to enabled if we can't fetch prefs

    const typeToPreferenceMap: Record<NotificationType, keyof NotificationPreferences> = {
      [NOTIFICATION_TYPES.HEALTH_CRISIS]: "notify_health_crisis",
      [NOTIFICATION_TYPES.HEALTH_UPDATE]: "notify_health_updates",
      [NOTIFICATION_TYPES.CALENDAR_CREATED]: "notify_calendar_created",
      [NOTIFICATION_TYPES.CALENDAR_24H_REMINDER]: "notify_calendar_24h",
      [NOTIFICATION_TYPES.CALENDAR_48H_REMINDER]: "notify_calendar_48h",
      [NOTIFICATION_TYPES.TASK_ASSIGNED]: "notify_task_assigned",
      [NOTIFICATION_TYPES.TASK_DUE]: "notify_task_due",
      [NOTIFICATION_TYPES.TASK_48H_REMINDER]: "notify_task_48h",
      [NOTIFICATION_TYPES.RISK_ASSESSMENT_UPDATED]: "notify_risk_updated",
      [NOTIFICATION_TYPES.RISK_ASSESSMENT_HIGH]: "notify_risk_high",
      [NOTIFICATION_TYPES.DOCUMENT_UPLOADED]: "notify_document_uploaded",
    };

    const prefKey = typeToPreferenceMap[notificationType];
    return prefs[prefKey as keyof NotificationPreferences] !== false;
  }

  /**
   * Send health crisis notification
   */
  static async notifyHealthCrisis(
    userId: string,
    userEmail: string,
    payload: HealthCrisisPayload
  ): Promise<boolean> {
    // Check if user has enabled health crisis notifications
    const isEnabled = await NotificationService.isNotificationEnabled(
      userId,
      NOTIFICATION_TYPES.HEALTH_CRISIS
    );

    if (!isEnabled) return false;

    const subject = `🚨 Health Crisis Alert: ${payload.young_person_name}`;

    return await NotificationService.enqueueNotification(
      userEmail,
      userId,
      NOTIFICATION_TYPES.HEALTH_CRISIS,
      payload
    ).then(result => result !== null);
  }

  /**
   * Send calendar event reminder notification
   */
  static async notifyCalendarReminder(
    userId: string,
    userEmail: string,
    hoursUntil: number,
    payload: CalendarEventPayload
  ): Promise<boolean> {
    const notificationType =
      hoursUntil >= 24
        ? NOTIFICATION_TYPES.CALENDAR_24H_REMINDER
        : NOTIFICATION_TYPES.CALENDAR_48H_REMINDER;

    const isEnabled = await NotificationService.isNotificationEnabled(
      userId,
      notificationType
    );

    if (!isEnabled) return false;

    const hourText = hoursUntil === 24 ? "in 24 hours" : "in 48 hours";
    const subject = `📅 Reminder: ${payload.event_title} ${hourText}`;

    return await NotificationService.enqueueNotification(
      userEmail,
      userId,
      notificationType,
      { ...payload, hours_until_event: hoursUntil }
    ).then(result => result !== null);
  }

  /**
   * Send task reminder notification
   */
  static async notifyTaskReminder(
    userId: string,
    userEmail: string,
    hoursUntil: number,
    payload: TaskPayload
  ): Promise<boolean> {
    const notificationType =
      hoursUntil >= 24
        ? NOTIFICATION_TYPES.TASK_DUE
        : NOTIFICATION_TYPES.TASK_48H_REMINDER;

    const isEnabled = await NotificationService.isNotificationEnabled(
      userId,
      notificationType
    );

    if (!isEnabled) return false;

    const subject = `⏰ Task Reminder: ${payload.task_title}`;

    return await NotificationService.enqueueNotification(
      userEmail,
      userId,
      notificationType,
      { ...payload, hours_until_due: hoursUntil }
    ).then(result => result !== null);
  }

  /**
   * Send risk assessment notification
   */
  static async notifyRiskAssessment(
    userId: string,
    userEmail: string,
    isHighRisk: boolean,
    payload: RiskAssessmentPayload
  ): Promise<boolean> {
    const notificationType = isHighRisk
      ? NOTIFICATION_TYPES.RISK_ASSESSMENT_HIGH
      : NOTIFICATION_TYPES.RISK_ASSESSMENT_UPDATED;

    const isEnabled = await NotificationService.isNotificationEnabled(
      userId,
      notificationType
    );

    if (!isEnabled) return false;

    const subject = isHighRisk
      ? `⚠️ High Risk Assessment: ${payload.young_person_name}`
      : `📋 Risk Assessment Updated: ${payload.young_person_name}`;

    return await NotificationService.enqueueNotification(
      userEmail,
      userId,
      notificationType,
      payload
    ).then(result => result !== null);
  }

  /**
   * Log a sent notification
   */
  static async logNotification(
    recipientEmail: string,
    recipientUserId: string | null,
    notificationType: NotificationType,
    subject: string,
    bodyText?: string,
    bodyHtml?: string,
    contextIds?: {
      health_entry_id?: string;
      calendar_event_id?: string;
      task_id?: string;
      risk_assessment_id?: string;
      young_person_id?: string;
    }
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("email_notification_log")
        .insert({
          recipient_email: recipientEmail,
          recipient_user_id: recipientUserId,
          notification_type: notificationType,
          subject,
          body_text: bodyText,
          body_html: bodyHtml,
          sent_at: new Date().toISOString(),
          status: "sent",
          ...contextIds,
        });

      if (error) {
        console.error("Failed to log notification:", error);
        return false;
      }

      return true;
    } catch (err) {
      console.error("Error logging notification:", err);
      return false;
    }
  }

  /**
   * Get notification history for a user
   */
  static async getNotificationHistory(
    userId: string,
    limit = 50
  ): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("email_notification_log")
        .select("*")
        .eq("recipient_user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Failed to fetch notification history:", error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error("Error fetching notification history:", err);
      return [];
    }
  }

  /**
   * Update notification preferences
   */
  static async updatePreferences(
    userId: string,
    updates: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .update(updates)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        console.error("Failed to update preferences:", error);
        return null;
      }

      return data;
    } catch (err) {
      console.error("Error updating preferences:", err);
      return null;
    }
  }
}
