/**
 * Supabase Edge Function: Send Notification
 * Processes notifications from the queue and sends emails
 *
 * Deploy with: supabase functions deploy send-notification
 * Test with: supabase functions invoke send-notification --no-verify
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";

interface NotificationPayload {
  notification_type: string;
  recipient_email: string;
  payload: Record<string, any>;
}

// ICS Generators and Encoders
function encodeBase64Safe(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function generateICS(
  title: string,
  dateStr: string,
  timeStr: string,
  location: string,
  eventId: string
): string {
  let startDateStr = "";
  let endDateStr = "";

  try {
    const d = new Date(`${dateStr}T${timeStr || "09:00"}:00Z`);
    const end = new Date(d.getTime() + 60 * 60 * 1000);
    const formatICSDate = (date: Date) => date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    
    startDateStr = formatICSDate(d);
    endDateStr = formatICSDate(end);
  } catch (e) {
    const now = new Date();
    const formatICSDate = (date: Date) => now.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    startDateStr = formatICSDate(now);
    endDateStr = startDateStr;
  }

  const nowStamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const uid = eventId || crypto.randomUUID();

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//FocusCMS//Calendar//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${nowStamp}
DTSTART:${startDateStr}
DTEND:${endDateStr}
SUMMARY:${title}
LOCATION:${location || ""}
END:VEVENT
END:VCALENDAR`;
}

// Email template builders
function buildHealthCrisisEmail(
  payload: Record<string, any>
): { subject: string; html: string; text: string } {
  const { young_person_name, condition_name, severity_level } = payload;

  return {
    subject: `🚨 URGENT: Health Crisis Alert - ${young_person_name}`,
    text: `A crisis-level health rating (5) has been recorded for ${young_person_name}.\n\nCondition: ${condition_name}\nSeverity: ${severity_level}\n\nPlease review and update the Risk Assessment immediately.`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px;">
        <div style="background-color: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">🚨 HEALTH CRISIS ALERT</h2>
        </div>
        <div style="padding: 20px; background-color: #fef2f2; border: 1px solid #fecaca;">
          <p><strong>Young Person:</strong> ${young_person_name}</p>
          <p><strong>Condition:</strong> ${condition_name}</p>
          <p><strong>Severity Level:</strong> ${severity_level}</p>
          <p style="margin-top: 20px; color: #991b1b;"><strong>⚠️ Mandatory Risk Assessment review required.</strong></p>
          <p>Please log into FocusCMS to review and update the Risk Assessment immediately.</p>
        </div>
      </div>
    `,
  };
}

function buildCalendarReminderEmail(
  payload: Record<string, any>
): { subject: string; html: string; text: string; attachments?: any[] } {
  const { event_title, event_date, event_time, location, hours_until_event, calendar_event_id } = payload;

  const icsString = generateICS(event_title, event_date, event_time, location, calendar_event_id);
  const base64Ics = encodeBase64Safe(icsString);

  const attachments = [
    {
      filename: "invite.ics",
      content: base64Ics
    }
  ];

  return {
    subject: `📅 Calendar Reminder: ${event_title}`,
    text: `Reminder: ${event_title}\n\nDate: ${event_date}\nTime: ${event_time}\nLocation: ${location}\n\nThis event is ${hours_until_event || 24} hours away.`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px;">
        <div style="background-color: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">📅 ${hours_until_event === 24 ? "Upcoming Event" : "Event Reminder"}</h2>
        </div>
        <div style="padding: 20px; border: 1px solid #bfdbfe; background-color: #eff6ff;">
          <h3 style="margin-top: 0;">${event_title}</h3>
          <p><strong>Date:</strong> ${event_date}</p>
          <p><strong>Time:</strong> ${event_time}</p>
          <p><strong>Location:</strong> ${location}</p>
          <p style="margin-top: 20px; color: #1e40af;"><strong>This event is ${hours_until_event || 24} hours away.</strong></p>
        </div>
      </div>
    `,
    attachments
  };
}

function buildTaskReminderEmail(
  payload: Record<string, any>
): { subject: string; html: string; text: string } {
  const { task_title, due_date, hours_until_due } = payload;

  return {
    subject: `⏰ Task Reminder: ${task_title}`,
    text: `Task Due: ${task_title}\n\nDue Date: ${due_date}\n\nThis task is due in ${hours_until_due || 24} hours.`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px;">
        <div style="background-color: #f59e0b; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">⏰ Task Reminder</h2>
        </div>
        <div style="padding: 20px; border: 1px solid #fcd34d; background-color: #fffbeb;">
          <h3 style="margin-top: 0;">${task_title}</h3>
          <p><strong>Due Date:</strong> ${due_date}</p>
          <p style="margin-top: 20px; color: #b45309;"><strong>This task is due in ${hours_until_due || 24} hours.</strong></p>
        </div>
      </div>
    `,
  };
}

function buildRiskAssessmentEmail(
  payload: Record<string, any>,
  isHighRisk: boolean
): { subject: string; html: string; text: string } {
  const { young_person_name, risk_level, risk_score, recommendations } = payload;

  const subject = isHighRisk
    ? `⚠️ High Risk Assessment: ${young_person_name}`
    : `📋 Risk Assessment Updated: ${young_person_name}`;

  return {
    subject,
    text: `Risk Assessment ${isHighRisk ? "Alert" : "Update"}: ${young_person_name}\n\nRisk Level: ${risk_level}\nRisk Score: ${risk_score}\n\n${recommendations ? `Recommendations: ${recommendations}` : ""}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px;">
        <div style="background-color: ${isHighRisk ? "#dc2626" : "#6366f1"}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">${isHighRisk ? "⚠️ HIGH RISK" : "📋 Risk Assessment Update"}</h2>
        </div>
        <div style="padding: 20px; border: 1px solid ${isHighRisk ? "#fecaca" : "#c7d2fe"}; background-color: ${isHighRisk ? "#fef2f2" : "#eef2ff"};">
          <p><strong>Young Person:</strong> ${young_person_name}</p>
          <p><strong>Risk Level:</strong> ${risk_level}</p>
          <p><strong>Risk Score:</strong> ${risk_score}</p>
          ${recommendations ? `<p><strong>Recommendations:</strong> ${recommendations}</p>` : ""}
        </div>
      </div>
    `,
  };
}

function buildHealthUpdateEmail(
  payload: Record<string, any>
): { subject: string; html: string; text: string } {
  const { young_person_name, condition_name, rating } = payload;
  return {
    subject: `📋 Health Update: ${young_person_name}`,
    text: `A health condition has been updated for ${young_person_name}.\n\nCondition: ${condition_name}\nNew Rating: ${rating}/5`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px;">
        <div style="background-color: #0ea5e9; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">📋 Health Condition Updated</h2>
        </div>
        <div style="padding: 20px; border: 1px solid #bae6fd; background-color: #f0f9ff;">
          <p><strong>Young Person:</strong> ${young_person_name}</p>
          <p><strong>Condition:</strong> ${condition_name}</p>
          <p><strong>New Rating:</strong> ${rating}/5</p>
          <p style="margin-top: 20px;">Please log into FocusCMS to review this update.</p>
        </div>
      </div>
    `,
  };
}

function buildDocumentUploadedEmail(
  payload: Record<string, any>
): { subject: string; html: string; text: string } {
  const { young_person_name, document_name, document_type, uploaded_by } = payload;
  return {
    subject: `📁 New Document: ${document_name} — ${young_person_name}`,
    text: `A new document has been uploaded for ${young_person_name}.\n\nDocument: ${document_name}\nType: ${document_type}\nUploaded by: ${uploaded_by}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px;">
        <div style="background-color: #7c3aed; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">📁 New Document Uploaded</h2>
        </div>
        <div style="padding: 20px; border: 1px solid #ddd6fe; background-color: #f5f3ff;">
          <p><strong>Young Person:</strong> ${young_person_name}</p>
          <p><strong>Document:</strong> ${document_name}</p>
          <p><strong>Type:</strong> ${document_type}</p>
          <p><strong>Uploaded by:</strong> ${uploaded_by}</p>
          <p style="margin-top: 20px;">Please log into FocusCMS to view this document.</p>
        </div>
      </div>
    `,
  };
}

function buildDocumentShareEmail(
  payload: Record<string, any>
): { subject: string; html: string; text: string } {
  const { young_person_name, document_name, shared_by, message, secure_link } = payload;
  return {
    subject: `🔐 Secure Document Share: ${document_name} — ${young_person_name}`,
    text: `${shared_by} has securely shared a document with you regarding ${young_person_name}.\n\nDocument: ${document_name}\n${message ? `Message: ${message}\n` : ''}\nView Document (Link valid for 7 days): ${secure_link}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px;">
        <div style="background-color: #0f172a; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">🔐 Secure Document Share</h2>
        </div>
        <div style="padding: 20px; border: 1px solid #e2e8f0; background-color: #f8fafc;">
          <p><strong>${shared_by}</strong> has securely shared a document with you regarding <strong>${young_person_name}</strong>.</p>
          <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #cbd5e1; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Document:</strong> ${document_name}</p>
            ${message ? `<p style="margin: 0;"><strong>Message:</strong><br/>${message.replace(/\n/g, '<br/>')}</p>` : ''}
          </div>
          <a href="${secure_link}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Secure Document</a>
          <p style="margin-top: 20px; font-size: 12px; color: #64748b;">This secure link will expire in 7 days. Please do not forward this email.</p>
        </div>
      </div>
    `,
  };
}

// Send email via Resend API
async function sendEmailViaResend(
  to: string,
  subject: string,
  html: string,
  text: string,
  attachments?: any[]
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured. Email would be sent to:", to);
    return { success: true, messageId: "dev-mode" };
  }

  try {
    const body: any = {
      from: "notifications@focuscms.com",
      to,
      subject,
      html,
      text,
    };

    if (attachments && attachments.length > 0) {
      body.attachments = attachments;
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Resend API error: ${error}` };
    }

    const data = await response.json() as { id: string };
    return { success: true, messageId: data.id };
  } catch (error) {
    return { success: false, error: `Failed to send email: ${error}` };
  }
}

// Main handler
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as NotificationPayload;
    const { notification_type, recipient_email, payload } = body;

    // Build email content based on notification type
    let emailContent;
    switch (notification_type) {
      case "health_crisis":
        emailContent = buildHealthCrisisEmail(payload);
        break;
      case "calendar_created":
      case "calendar_24h_reminder":
      case "calendar_48h_reminder":
        emailContent = buildCalendarReminderEmail(payload);
        break;
      case "task_assigned":
      case "task_due":
      case "task_48h_reminder":
        emailContent = buildTaskReminderEmail(payload);
        break;
      case "risk_assessment_updated":
      case "risk_assessment_high":
        emailContent = buildRiskAssessmentEmail(
          payload,
          notification_type === "risk_assessment_high"
        );
        break;
      case "health_update":
        emailContent = buildHealthUpdateEmail(payload);
        break;
      case "document_uploaded":
        emailContent = buildDocumentUploadedEmail(payload);
        break;
      case "document_share":
        emailContent = buildDocumentShareEmail(payload);
        break;
      default:
        return new Response(
          JSON.stringify({ error: `Unknown notification type: ${notification_type}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    // Send email
    const result = await sendEmailViaResend(
      recipient_email,
      emailContent.subject,
      emailContent.html,
      emailContent.text,
      (emailContent as any).attachments
    );

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        messageId: result.messageId,
        recipient: recipient_email,
        type: notification_type,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing notification:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process notification" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
