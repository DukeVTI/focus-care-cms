# FocusCMS — Phase 2 Delivery Report

**Prepared by:** Nimbly HQ Development Team
**Date:** 17 March 2026
**Project:** FocusCMS — Safeguarding & Care Management Platform
**Platform URL:** https://focusflow-care-33426-09730-64038-08699-22624.lovable.app

---

## Executive Summary

Phase 2 of FocusCMS has delivered a significant expansion of the platform's capabilities, transforming it from a basic care record system into a compliance-ready, data-driven safeguarding platform. The development has focused on five core modules as outlined in the Phase 2 Technical Roadmap, with approximately **75–80% of all specified requirements now fully implemented and functional**.

The platform is built on a modern, secure technology stack (React, TypeScript, Supabase/Lovable Cloud) with role-based access control, full audit logging, and structured data models designed for Ofsted-compliant reporting.

---

## 1. Modules Delivered — Detailed Breakdown

### 1.1 Missing/Incident Report Module ✅ COMPLETE

**Status:** Fully built and functional
**Route:** `/missing-episodes`, `/missing-episodes/new`, `/missing-episodes/:id`

This module is the most comprehensive deliverable in Phase 2, implementing the statutory missing persons workflow as specified in the requirements document.

#### What Has Been Built:

| Feature | Status | Notes |
|---------|--------|-------|
| Child/Young Person details pre-populated from profile | ✅ Complete | Name, DOB, age, ethnicity, gender, placement type auto-fill |
| Missing Episode Details form | ✅ Complete | Date/time last seen, location missing from, circumstances dropdown |
| Police notification tracking | ✅ Complete | Police reference number, notification timestamp |
| Multi-select notification checklist | ✅ Complete | Police, Parents/Carers, Social Worker, LADO, Emergency Services |
| Return & Follow-Up section | ✅ Complete | Date/time returned, who found them, return interview fields |
| Automated Case ID generation | ✅ Complete | Format: MEP-YYYY-0001 (auto-incrementing via database sequence) |
| Duration of Missing calculation | ✅ Complete | Visual timestamp showing hours/minutes between reported and returned |
| Escalation levels | ✅ Complete | Standard → Urgent → Critical with visual badges |
| Episode Timeline | ✅ Complete | Visual timeline from Reported → Found → Interview → Approved |
| Risk level per episode | ✅ Complete | Unknown/Low/Medium/High/Critical tracking |
| Clothing description & distinguishing features | ✅ Complete | Detailed physical description fields for police |
| Known associates & likely destinations | ✅ Complete | Structured fields for search coordination |
| Transport mode tracking | ✅ Complete | How the young person may be travelling |
| Manager Approval workflow | ✅ Complete | Manager can approve with timestamp and ID recorded |
| Linked task creation on return | ✅ Complete | Auto-generates "Update Risk Assessment" task |
| Return Interview recording | ✅ Complete | Date, notes, completion status tracked |
| EDT (Emergency Duty Team) contact | ✅ Complete | Contact tracking for out-of-hours incidents |
| Missing Person "Grab Pack" export | ✅ Complete | One-click PDF generation with physical description, photo, contacts |
| Filters (status, risk level, date range) | ✅ Complete | Searchable and filterable episode list |

#### How to Test:
1. Navigate to **Missing Episodes** from the dashboard
2. Click **"Report Missing"** to create a new episode
3. Fill in the episode details — note how child details pre-populate
4. Save and observe the **Case ID** auto-generated (MEP-2026-XXXX)
5. On the detail page, observe the **Episode Timeline** and **Duration** calculation
6. Use **"Report Return"** to log the return — this triggers automatic task creation
7. Test the **Manager Approval** section
8. Click **"Missing Person Grab Pack"** to generate a PDF export

---

### 1.2 Health & Wellbeing Module ✅ COMPLETE

**Status:** Fully built and functional
**Route:** `/health-wellbeing?youngPersonId=<id>`

#### What Has Been Built:

| Feature | Status | Notes |
|---------|--------|-------|
| Three core assessment categories | ✅ Complete | Physical Health, Substance Misuse, Mental Health |
| Top 20 condition dropdowns per category | ✅ Complete | Sourced from UK public health data + "Other" free-text option |
| 1–5 severity rating per condition | ✅ Complete | Radio/slider input (1=Low Impact, 5=Crisis) |
| Free-text comment per condition | ✅ Complete | Detailed notes per individual condition entry |
| Medical Visits Log | ✅ Complete | GP, Hospital, Dental, Optician visit types |
| Visit outcome notes | ✅ Complete | Summary of diagnosis/treatment recorded |
| Next appointment date tracking | ✅ Complete | Future appointments for dental/optician follow-ups |
| Recorded-by user tracking | ✅ Complete | Staff member ID and timestamp on every entry |
| Medications tracking | ✅ Complete | Separate table for medication name, dosage, frequency |

#### Database Tables:
- `health_condition_entries` — Stores all condition assessments with category, rating, and comments
- `medical_appointment_logs` — Tracks all medical visits with provider details
- `young_person_medications` — Tracks prescribed medications

#### How to Test:
1. Open a **Young Person's profile** and navigate to **Health & Wellbeing**
2. Add a condition under each category (Physical, Substance, Mental Health)
3. Select from the **Top 20 dropdown** or choose "Other" for free-text entry
4. Set a **severity rating** (1–5) and add comments
5. Log a **Medical Visit** (GP, Hospital, Dental, or Optician)
6. Verify the **next appointment date** is captured for future tracking
7. Add a **Medication** entry with dosage and frequency

---

### 1.3 Document Management Module ✅ COMPLETE

**Status:** Fully built and functional
**Route:** `/documents?youngPersonId=<id>`

#### What Has Been Built:

| Feature | Status | Notes |
|---------|--------|-------|
| Categorized document uploads | ✅ Complete | Health, Legal, Identification, Education, Employment, Finance, Official Document, Pathway Plan, Referral, Accommodation, Other |
| "Action Required" toggle | ✅ Complete | Flag documents needing follow-up with action notes |
| Audit metadata | ✅ Complete | uploaded_by (UUID + name), timestamp, file_size |
| Secure cloud storage | ✅ Complete | Supabase Storage bucket with authenticated access only |
| Documents widget on profile | ✅ Complete | Shows latest 5 documents with action indicators |
| Category badge colors | ✅ Complete | Visual distinction between document types |
| File download/view | ✅ Complete | Click to access stored documents |

#### Security:
- All documents stored in a **private storage bucket** (`young-person-documents`)
- Row-Level Security ensures users can only access documents for their own young people
- Full audit trail of who uploaded what and when

#### How to Test:
1. Navigate to a **Young Person's profile** → **Documents widget** → **View All**
2. Click **"Upload Document"**
3. Select a **category** from the dropdown and name the document
4. Toggle **"Action Required"** and add action notes
5. Upload a file and verify it appears in the list with correct metadata
6. Check the **action indicator** (red flag) for documents requiring follow-up

---

### 1.4 Monthly Report & Utilisation ⚠️ PARTIALLY COMPLETE

**Status:** Core structure built, advanced features pending
**Route:** Generated from Young Person profile via "Monthly Report" button

#### What Has Been Built:

| Feature | Status | Notes |
|---------|--------|-------|
| PDF export with branded layout | ✅ Complete | Professional formatted report generation |
| Risk trend analysis | ✅ Complete | Current vs previous period comparison |
| Task completion summary | ✅ Complete | Completed vs pending tasks listed |
| Chronology flagged entries | ✅ Complete | Entries flagged for report inclusion |
| Safeguarding risk summary | ✅ Complete | Active risks and severity listed |
| Missing episodes summary | ✅ Complete | Count and status of episodes in period |

#### What Remains (Advanced Features):

| Feature | Status | Complexity |
|---------|--------|------------|
| AI-powered "Letter" generator (empathetic YP-centered tone) | ❌ Not built | High — requires LLM integration |
| Tiered summarization (daily → weekly → monthly) | ❌ Not built | High — requires background processing |
| Utilisation gauge (nights slept onsite) | ❌ Not built | Medium — requires night check data model |
| Mood/Sentiment tracking & visualization | ❌ Not built | Medium — requires daily mood capture |
| SMART goal setting (3 goals per period, carry-forward) | ❌ Not built | Medium |
| Comparative reports (quarterly, annual) | ❌ Not built | Medium |
| Automated monthly trigger (1st of month) | ❌ Not built | Medium — requires scheduled jobs |
| Staff review/approval before publishing | ❌ Not built | Low–Medium |

---

### 1.5 Risk Assessment Module ✅ COMPLETE

**Status:** Fully built and functional
**Route:** `/risk-assessments`, `/risk-assessments/new`, `/risk-assessments/:id`

#### What Has Been Built:

| Feature | Status | Notes |
|---------|--------|-------|
| Configurable assessment sections | ✅ Complete | 8 weighted sections (Safety, Mental Health, Substance Use, etc.) |
| Weighted scoring system | ✅ Complete | Each section has configurable weight multipliers |
| Risk level thresholds | ✅ Complete | Configurable Low/Medium/High boundaries |
| Level change detection | ✅ Complete | Database trigger flags when risk escalates to High |
| Previous level tracking | ✅ Complete | Stores previous risk level for comparison |
| Section scores as JSON | ✅ Complete | Granular breakdown stored per assessment |
| Linked task creation | ✅ Complete | Follow-up tasks created from assessments |
| Risk factors & protective factors | ✅ Complete | Text fields for detailed analysis |
| Interventions recommended | ✅ Complete | Structured recommendations field |
| PDF export | ✅ Complete | Professional formatted risk assessment export |

---

## 2. Supporting Infrastructure Delivered

### 2.1 Role-Based Access Control (RBAC)

| Feature | Status |
|---------|--------|
| User roles system (staff, keyworker, manager, admin) | ✅ Complete |
| Roles stored in dedicated `user_roles` table (security best practice) | ✅ Complete |
| `has_role()` security definer function (prevents RLS recursion) | ✅ Complete |
| Admin role management | ✅ Complete |

### 2.2 Staff Management

| Feature | Status |
|---------|--------|
| Staff directory with profiles | ✅ Complete |
| Availability tracking (Available, Busy, On Leave, Off Shift) | ✅ Complete |
| Caseload view (assigned young people, open tasks, active missing episodes) | ✅ Complete |
| Reassign young people between staff | ✅ Complete |

### 2.3 Audit & Compliance

| Feature | Status |
|---------|--------|
| Full audit log table | ✅ Complete |
| Actor name, action, field changed, old/new values tracked | ✅ Complete |
| Immutable audit entries (no UPDATE or DELETE allowed) | ✅ Complete |
| RLS policies on all tables | ✅ Complete |

### 2.4 Dashboard & Analytics

| Feature | Status |
|---------|--------|
| Overview dashboard with key metrics | ✅ Complete |
| Risk trend chart (line graph over time) | ✅ Complete |
| Caseload distribution chart | ✅ Complete |
| Task completion chart (donut visualization) | ✅ Complete |
| Notifications bell with unread count | ✅ Complete |
| Quick-access module cards | ✅ Complete |

### 2.5 Additional Modules

| Module | Status |
|--------|--------|
| Chronology (daily observations with tagging & flagging) | ✅ Complete |
| Keywork Sessions (with Ofsted standards framework) | ✅ Complete |
| Task Management (with reassignment history) | ✅ Complete |
| Young Person Profile ("Focus Sheet") | ✅ Complete |
| Safeguarding Risks tracking | ✅ Complete |
| Key Contacts management | ✅ Complete |
| New Young Person registration wizard (9-step) | ✅ Complete |

---

## 3. Database Architecture

The platform uses **16 database tables** with full Row-Level Security:

| Table | Purpose | RLS |
|-------|---------|-----|
| `young_people` | Core young person records | ✅ User-scoped |
| `profiles` | Staff profiles | ✅ Authenticated read, user-scoped write |
| `user_roles` | RBAC role assignments | ✅ Admin-managed + user can view own |
| `missing_episodes` | Missing incident records | ✅ Reporter-scoped |
| `health_condition_entries` | Health assessments (1–5 ratings) | ✅ YP-owner scoped |
| `medical_appointment_logs` | Medical visit tracking | ✅ YP-owner scoped |
| `young_person_medications` | Medication records | ✅ YP-owner scoped |
| `young_person_documents` | Uploaded documents metadata | ✅ YP-owner scoped |
| `young_person_contacts` | Key contacts & emergency contacts | ✅ YP-owner scoped |
| `risk_assessments` | Risk assessment records | ✅ Assessor-scoped |
| `risk_assessment_config` | Configurable sections & thresholds | ✅ User-scoped |
| `safeguarding_risks` | Active safeguarding concerns | ✅ YP-owner scoped |
| `chronology_entries` | Daily observations & logs | ✅ Staff-scoped |
| `keywork_sessions` | 1:1 and group session records | ✅ Staff-scoped |
| `tasks` | Task management with escalation | ✅ Assignee-scoped |
| `alerts` | Notification system | ✅ User-scoped |
| `audit_log` | Immutable audit trail | ✅ Insert-only, user-scoped read |

**Database Functions:** 8 custom functions including auto-age calculation, Focus ID generation, case ID sequencing, risk level change detection, and role checking.

**Storage Buckets:** 2 private buckets for young person documents and photos.

---

## 4. Security & Compliance Summary

| Security Measure | Implementation |
|------------------|----------------|
| Authentication | Email/password with email verification required |
| Row-Level Security | All 16 tables have RLS policies enforced |
| Role-Based Access | 4-tier role system (staff → keyworker → manager → admin) |
| Audit Trail | Immutable log of all data changes |
| Data Isolation | Users can only see their own young people and related records |
| Secure Storage | Private buckets with authenticated-only access |
| Session Management | JWT-based with automatic refresh |
| Input Validation | Client-side form validation on all data entry |

---

## 5. What Remains — Phase 2 Outstanding Items

### 5.1 Calendar & Scheduling Module ❌ NOT STARTED

This is the largest outstanding deliverable. The requirements specify:
- Individual and Group calendar views
- Meeting diarization with standardized dropdowns (Type, Location, Status)
- Task diarization with completion tracking (Completed/Postponed/Cancelled)
- .ics file generation for Outlook/Windows Calendar integration
- Email reminders for meetings (24hr prior) and tasks (48hr prior)
- Activity type reporting with charts (volume by type, completion rates)

**Estimated effort:** Significant — this is an entire new module.

### 5.2 Email Notification System ❌ NOT STARTED

Multiple documents reference automated email notifications:
- Escalation alerts when tasks breach deadlines
- Meeting/task reminders
- Report approval notifications
- Risk assessment update notifications to Keyworker/Manager/PA

**Requirement:** Needs a high-volume email service (SendGrid, AWS SES, or similar) to be configured.

### 5.3 AI-Powered Report Generator ❌ NOT STARTED

The Monthly Report document specifies an LLM-powered letter generator that:
- Uses empathetic, young-person-centered language
- Implements tiered summarization (daily → weekly → monthly → annual)
- Calculates Risk Delta and adjusts tone accordingly
- Tracks SMART goals across reporting periods
- Requires staff review before publication

**Requirement:** LLM integration (supported via Lovable AI with Gemini/GPT models).

### 5.4 Automated Escalation Logic ⚠️ PARTIAL

- Task creation on missing person return: ✅ Built
- 24-hour countdown timer with auto-escalation: ❌ Needs background job processing
- Pre-escalation reminders (1 hour before deadline): ❌ Needs scheduled jobs
- Auto-status update to "Escalated" on deadline breach: ❌ Needs background processing
- Level 5 health rating → mandatory Risk Assessment prompt: ❌ Not implemented

### 5.5 Advanced Data Visualizations ⚠️ PARTIAL

- Risk trend charts: ✅ Built
- Task completion charts: ✅ Built
- Caseload distribution: ✅ Built
- Utilisation gauge (nights onsite): ❌ Not built
- Mood/sentiment heatmap: ❌ Not built
- Activity breakdown bar charts: ❌ Not built (requires Calendar module)
- Health condition cohort analytics: ❌ Not built

### 5.6 Document Management Enhancements ⚠️ PARTIAL

- File type validation (restrict to PDF, DOCX, JPG, PNG): ❌ Not enforced
- Duplicate filename uniqueness check per category: ❌ Not implemented
- Email document directly from platform: ❌ Requires email service
- RBAC-specific delete/modify permissions: ❌ Uses owner-based RLS only

---

## 6. Recommendations for Next Steps

### Priority 1 — Quick Wins (Low Effort, High Impact)
1. **File type validation** on document uploads — add client-side check
2. **Duplicate filename check** — add pre-save query
3. **Level 5 health trigger** — add UI prompt when rating = 5

### Priority 2 — Medium Effort
4. **Calendar Module** — core calendar with meeting/task creation
5. **Enhanced escalation** — background timer for 24-hour deadline tracking

### Priority 3 — High Effort (Phase 3 Candidates)
6. **Email notification system** — requires external mail service setup
7. **AI letter generator** — LLM integration for empathetic monthly reports
8. **Comparative reporting** — quarterly and annual trend analysis
9. **Outlook integration** — .ics file generation

---

## 7. How to Access & Test the Platform

**Live URL:** https://focusflow-care-33426-09730-64038-08699-22624.lovable.app

### Testing Workflow:
1. **Sign up** with an email address (verification required)
2. **Dashboard** loads with overview metrics and module cards
3. **Add a Young Person** via the 9-step registration wizard
4. **Navigate modules** via dashboard cards or sidebar:
   - Young People → Profile → Focus Sheet
   - Missing Episodes → Report Missing → Report Return
   - Health & Wellbeing → Add conditions, log visits
   - Documents → Upload and categorize files
   - Risk Assessments → Create weighted assessment
   - Chronology → Log daily observations
   - Keywork Sessions → Record 1:1 sessions
   - Tasks → Create, assign, and track tasks
   - Staff Management → View directory, caseloads, availability

---

## 8. Technical Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui component library |
| State Management | TanStack React Query |
| Routing | React Router v6 |
| Backend | Lovable Cloud (Supabase) |
| Database | PostgreSQL with Row-Level Security |
| Authentication | Email/password with JWT sessions |
| File Storage | Supabase Storage (private buckets) |
| Charts | Recharts |
| PDF Generation | Client-side report generators |

---

*This report was prepared for the Phase 2 delivery review. All features listed as "Complete" are live and testable on the platform URL above.*

**— Nimbly HQ Development Team**
