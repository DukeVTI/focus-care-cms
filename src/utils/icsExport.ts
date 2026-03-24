import { format } from "date-fns";

interface CalendarEvent {
  title: string;
  description?: string | null;
  event_date: string;
  start_time: string;
  end_time?: string | null;
  location?: string | null;
}

function formatICSDate(dateStr: string, timeStr: string): string {
  const [y, m, d] = dateStr.split("-");
  const [h, min] = timeStr.split(":");
  return `${y}${m}${d}T${h}${min}00`;
}

function escapeICS(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function generateICS(event: CalendarEvent): string {
  const dtStart = formatICSDate(event.event_date, event.start_time);
  const dtEnd = event.end_time
    ? formatICSDate(event.event_date, event.end_time)
    : formatICSDate(event.event_date, event.start_time);
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@focusflow`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FocusFlow//Calendar//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeICS(event.title)}`,
  ];

  if (event.description) lines.push(`DESCRIPTION:${escapeICS(event.description)}`);
  if (event.location) lines.push(`LOCATION:${escapeICS(event.location)}`);

  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadICS(event: CalendarEvent) {
  const icsContent = generateICS(event);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.title.replace(/[^a-zA-Z0-9]/g, "_")}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
