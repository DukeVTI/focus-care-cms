# Phase 2: Technical Gap Analysis & Implementation Roadmap

**Date:** May 8, 2026  
**Document Purpose:** A deep, professional technical analysis comparing the original `.docx` feature requirements against the current FocusCMS codebase state. This document clearly defines what has been successfully implemented and what remains to be built for Phase 2.

---

## 1. Calendar & Scheduling Module
**Requirement Source:** `Focus Calendar (1) (2).docx`

### ✅ What Has Been Built
- **Database Schema:** `calendar_events` table exists with robust tracking (event types, activity types, status, participants).
- **Notification Engine:** The `enqueue_upcoming_reminders` `pg_cron` job successfully triggers 24h and 48h advance reminders.
- **Standardized Data:** Constants are strictly defined in `src/lib/constants.ts` (`CALENDAR_EVENT_TYPES`, `CALENDAR_ACTIVITY_TYPES`) avoiding free-text entry.

### ❌ What is Left (The Gap)
- **iCalendar (.ics) Integration:** The requirement explicitly states meetings must generate and attach an `.ics` file so participants can add events to native calendars (Outlook/Apple). The current `send-notification` edge function sends HTML emails but lacks ICS attachment construction.
- **UI Dual View Implementation:** Requirement specifies a toggle between "Individual Calendar" and "Group Calendar". We need to verify/enhance `CalendarScheduling.tsx` to support the cross-team group view.

---

## 2. Document Uploads & Management
**Requirement Source:** `Focus Document Upload.docx`

### ✅ What Has Been Built
- **Secure Storage:** Supabase Storage buckets are provisioned with RLS policies restricting access to authenticated users.
- **Categorization:** `DOCUMENT_CATEGORIES` enum is enforced on the frontend.
- **Audit Tracking:** The `young_person_documents` table records `created_at` and is tied to the young person.

### ❌ What is Left (The Gap)
- **Pre-Save Uniqueness Constraint:** The spec demands a system check to prevent duplicate filenames *within the same category* for a young person, returning a "409 Conflict" equivalent. Currently missing in the DB constraints.
- **Task Action Workflow:** Selecting "Task Action Required" upon upload must auto-generate a Task or Notification. We need a database trigger or frontend hook to fulfill this.
- **Direct Emailing:** The UI lacks the required permission-based feature to email documents directly from the platform.

---

## 3. Health & Wellbeing
**Requirement Source:** `Focus Health & Wellbeing.docx`

### ✅ What Has Been Built
- **Core Tracking:** `health_condition_entries` (1-5 severity scale) and `medical_appointment_logs` exist with strict RLS.
- **Crisis Alerting:** The `send-notification` edge function handles "Level 5 (Crisis)" alerts flawlessly with a custom HTML template.

### ❌ What is Left (The Gap)
- **Mandatory Risk Assessment Workflow:** While a Level 5 crisis triggers an email alert stating *"review and update the Risk Assessment immediately"*, the system does not programmatically generate a **Task** assigned to the Keyworker with a strict deadline. A trigger is needed to enforce this.

---

## 4. Missing Incident Reports
**Requirement Source:** `Focus Missing Incident Report.docx`

### ✅ What Has Been Built
- **Data Capture:** `missing_episodes` table captures granular data (case ID, police notification, locations, etc.).
- **Escalation Engine:** The `escalation-check` edge function automatically escalates episodes open for >24 hours to `HIGH` priority and flags overdue tasks.

### ❌ What is Left (The Gap)
- **Return Follow-up Automation:** The statutory guidance specifies that upon a young person's return, the system **must automatically create a task to update the Risk Assessment** with a strict 24-hour deadline. We need a Supabase trigger on the `missing_episodes` table (when status changes to `returned`) to insert this mandatory task.
- **Visual Time Stamp:** The UI requires a prominent duration counter (Time Missing to Time Returned) stamped directly on the episode card.

---

## 5. Automated Reporting & Analytics Engine (The "LLM Service")
**Requirement Source:** `Focus Monthly Report Utilisation.docx`

### ✅ What Has Been Built
- **Data Foundations:** The foundational data required for the reports (Tasks, Chronology, Night Checks/Utilization, Risk Scores) is actively being collected in the database.

### ❌ What is Left (The Gap) — *Major Feature*
- **Asynchronous LLM Reporting Service:** This entire module is unbuilt. It requires:
  1. **New Database Tables:** `monthly_reports` to store generated reports, status (draft, published), and historical tasks.
  2. **Cron Trigger:** A `pg_cron` job scheduled for `00:01` on the 1st of every month to trigger generation.
  3. **Data Aggregation Pipeline:** A query to calculate Utilization percentages, Risk Deltas (Current vs Previous), and Task Success Rates.
  4. **AI Edge Function:** A new Edge Function integrating the Gemini or GPT-4 API. It must feed the aggregated JSON data into a structured system prompt to generate the "Letter to the Young Person" (HitL workflow).
  5. **Review & Publish UI:** A dashboard interface for Staff to review the AI draft, override incorrect task assessments, set 3 new SMART goals, and finally "Publish" to PDF or the portal.

---

## Strategic Summary for Phase 2

You have built a highly secure, data-rich operational foundation. The database, RLS, basic UI, and alerting systems are solid.

**Phase 2 must focus on AUTOMATION and INTELLIGENCE.** 
The immediate next steps should be:
1. **Closing Workflow Loops:** Add the missing triggers (Missing Return -> Risk Assessment Task; Crisis -> Risk Task).
2. **Developing the LLM Engine:** Architecting the Monthly Report Edge Function (Data Aggregation -> LLM Prompt -> Review UI).
3. **Enhancing Utilities:** Adding `.ics` generation for calendars and the document uniqueness constraint.
4. **Centralizing the Data Fetching Layer:** Refactoring direct `useEffect` Supabase calls into centralized React Query hooks for better caching, error handling, and future-proofing.
