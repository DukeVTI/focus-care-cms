# FocusCMS Platform Remediation Roadmap

**Prepared:** April 10, 2026  
**Purpose:** Strategic plan to address platform issues across safety, code quality, and architecture.

---

## Phase 1: Quick Wins (This Session) — High ROI, Low Effort

### PR-001: Remove Artificial Loading Screen & Improve App Initialization
**Status:** 🟢 Ready to implement  
**Files:** `src/App.tsx`  
**Changes:**
- Remove the 2-second `setTimeout` delay in App.tsx
- Replace with actual auth state checking (already exists)
- Show loading only while auth context initializes
- **Impact:** Snappier UX, more honest loading indicator
- **Effort:** 5 minutes
- **Risk:** None

---

### PR-002: Standardize Status/Role Constants
**Status:** 🟢 Ready to implement  
**Files:** `src/lib/constants.ts` (new) + multiple component files  
**Changes:**
```typescript
// Create constants.ts with all magic strings
export const TASK_STATUSES = {
  PENDING: "pending",
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  DONE: "done",
  ARCHIVED: "archived",
} as const;

export const ROLE_TYPES = {
  STAFF: "staff",
  KEYWORKER: "keyworker",
  MANAGER: "manager",
  ADMIN: "admin",
} as const;

export const MISSING_EPISODE_STATUSES = {
  REPORTED: "reported",
  MISSING: "missing",
  LOCATED: "located",
  RETURNED: "returned",
} as const;
```
- Replace all hardcoded status strings with constants
- Create type-safe enums for validation
- **Impact:** Single source of truth, easier refactoring, fewer bugs
- **Effort:** 2-3 hours
- **Files affected:** ~15 (Tasks, MissingEpisodes, Dashboard, etc.)

---

### PR-003: Fix TypeScript Strictness & Untyped Client
**Status:** 🟡 Moderate effort  
**Files:** `tsconfig.json`, `src/integrations/supabase/`, ~10 component files  
**Changes:**
- Enable strict TypeScript: `"strict": true` in tsconfig.json
- Remove/consolidate `untypedClient.ts` — use auto-generated `client.ts` everywhere
- Add proper types to Supabase queries (use `Database` type from auto-generated types)
- Fix all `any` types with proper typing
- **Impact:** Catch type errors at compile time, IDE autocomplete works better
- **Effort:** 4-6 hours
- **Risk:** May reveal bugs in existing code

**Before:**
```typescript
const { data, error } = await supabase
  .from("young_people")
  .select("*");
// data is any, no IDE support
```

**After:**
```typescript
const { data, error } = await supabase
  .from("young_people")
  .select("*");
// data is properly typed to Database["public"]["Tables"]["young_people"]["Row"][]
```

---

### PR-004: Add Error Boundary Component & Global Error Handler
**Status:** 🟢 Ready to implement  
**Files:** `src/components/ErrorBoundary.tsx` (new), `src/App.tsx`  
**Changes:**
- Create ErrorBoundary wrapper component
- Wrap root routes with boundary
- Add global error handler for failed API calls
- Log errors to console with structured format
- **Impact:** Graceful error display instead of blank screens, easier debugging
- **Effort:** 1-2 hours
- **Risk:** None

---

### PR-005: Create Component Documentation & Usage Guide
**Status:** 🟢 Ready to implement  
**Files:** `COMPONENT_GUIDE.md` (new)  
**Changes:**
- Document shadcn/ui component usage patterns
- Show dos/don'ts for each component
- Provide examples for common patterns (forms, dialogs, tables)
- **Impact:** Consistency, faster onboarding for new developers
- **Effort:** 1-2 hours
- **Risk:** None

---

## Phase 2: Short-Term Improvements (Next 2-4 Weeks)

### PR-010: Add E2E Tests for Critical Paths
**Status:** 🟡 Requires Playwright/Cypress setup  
**Files:** `e2e/` (new directory)  
**Priority Paths:**
1. Missing episode escalation flow (report → escalate → alert)
2. Document upload with duplicate detection
3. Young person profile creation
4. Risk assessment submission

**Tools:** Playwright or Cypress
**When:** After PR-002 (constants) stabilizes
**Effort:** 8-12 hours
**ROI:** Very high — catches regressions immediately

---

### PR-011: Implement Centralized Logging & Error Reporting
**Status:** 🟡 Requires external service  
**Files:** `src/lib/logger.ts` (new) + modifications throughout  
**Options:**
- Sentry (recommended): error tracking + performance monitoring
- LogRocket: session replay + error tracking
- Custom: simple HTTP endpoint logging

**Implementation:**
```typescript
// src/lib/logger.ts
export const logError = (context: string, error: any, metadata?: Record<string, any>) => {
  console.error(`[${context}]`, error, metadata);
  // Send to Sentry/LogRocket
};
```

**Usage in critical paths:**
- Upload failures
- API errors
- Business logic errors (e.g., escalation failure)

**Effort:** 4-6 hours  
**ROI:** High — visibility into production issues

---

### PR-012: Add Data Provenance UI & Audit Trail Viewer Enhancements
**Status:** 🟢 Build on existing Audit Log  
**Changes:**
- Add "View audit trail" buttons on young person, risk assessment, document records
- Show who made the change, when, and why (via action_notes)
- Display field diffs in human-readable format
- **Effort:** 3-4 hours
- **ROI:** High — answers "why did this change?"

---

### PR-013: Create Admin Dashboard
**Status:** 🟡 Moderate effort  
**Files:** `src/pages/AdminDashboard.tsx` (new), `src/App.tsx`  
**Features:**
- System health (last backup, API status)
- Usage metrics (documents uploaded, tasks created, reports generated)
- User activity (last login, most active staff)
- Data exports (young people list, caseload summary, compliance report)
- Backup & recovery controls
- **Effort:** 6-8 hours
- **ROI:** Medium — operational peace of mind

---

### PR-014: Implement Email Notification System
**Status:** 🟡 Requires email service selection  
**Options:**
- Resend (easiest for Lovable)
- Sendgrid
- Custom Edge Function

**Triggers:**
- Missing episode escalation → email manager
- Task overdue → email assignee
- Risk assessment updated → email keyworker
- Document flagged for action → email owner

**Effort:** 6-8 hours  
**ROI:** High — critical feature for workflow

---

## Phase 3: Long-Term Architecture (1-3 Months)

### PR-020: Add Full-Text Search
**Status:** 🔴 Requires schema changes  
**Implementation:**
- PostgreSQL FTS (native)
- Elasticsearch (if performance needed)

**Search targets:**
- Chronology entries by free text
- Documents by filename/type/category
- Young person by name/ID/known risks

**Effort:** 12-16 hours  
**ROI:** High — critical as data grows

---

### PR-021: Implement Transaction Safety for Multi-Step Operations
**Status:** 🔴 Requires Supabase RPC functions  
**Operations to handle:**
1. Upload document → create audit entry
2. Escalate missing episode → update status → create alert → create audit entry
3. Submit risk assessment → calculate level → check escalation → create alert

**Solution:** Supabase RPC functions with transactions
**Effort:** 8-12 hours  
**ROI:** Medium → High (prevents data inconsistency)

---

### PR-022: Plan Disaster Recovery & Backup Strategy
**Status:** 🔴 Operational work  
**Tasks:**
- Document backup schedule (daily? weekly?)
- Test restoration from backups quarterly
- Create runbook for data loss scenarios
- Set up monitoring for backup health
- Implement point-in-time recovery plan with Supabase

**Effort:** 4-6 hours (planning) + ongoing  
**ROI:** Critical if disaster occurs

---

### PR-023: Add Offline-First Capability (Optional)
**Status:** 🔴 Major refactor  
**Tools:** Workbox (service workers) + IndexedDB  
**Priority:** Lower (nice-to-have vs. critical)  
**Effort:** 20-30 hours  
**ROI:** Medium — helps field workers

---

## Phase 4: Strategic/Compliance (Ongoing)

### DOC-001: Create Compliance Matrix
**Status:** 🟢 Documentation  
**Content:**
- Map features to regulations (UK Children Act, Care Standards, GDPR)
- Audit trail coverage → Ofsted readiness
- Data retention policies
- Incident response procedures
- **Effort:** 2-4 hours

---

### DOC-002: Operations Manual & Runbooks
**Status:** 🟢 Documentation  
**Content:**
- How to restore from backup
- How to handle missing episode escalation failure
- How to export reports for compliance
- How to contact Lovable/Supabase support
- **Effort:** 2-3 hours

---

### DOC-003: Exit Strategy & Lock-In Mitigation
**Status:** 🟢 Documentation  
**Content:**
- Data export plan (how to get all data out of Supabase)
- Code portability assessment
- Alternative architectures if needed to leave Lovable/Supabase
- Estimated migration cost
- **Effort:** 2-4 hours

---

## Priority Matrix (What to Do First)

```
EFFORT (→) vs IMPACT (↑)

HIGH IMPACT
    ⭐ PR-001 (remove loading screen)
    ⭐ PR-002 (constants)
    ⭐ PR-004 (error boundary)
    | PR-010 (E2E tests)
    | PR-011 (logging)
    | PR-013 (admin dashboard)
    | PR-014 (email)
    |
    | PR-012 (audit trail UI)
    |
LOW |________________________
    LOW                  HIGH
       EFFORT
```

---

## Recommended Execution Order

### Session 1 (Today) — **Quick Wins**
1. ✅ PR-001: Remove loading screen (5 min)
2. ✅ PR-004: Add error boundary (30 min)
3. ✅ PR-005: Component guide (1 hour)
4. 🟡 PR-002: Constants refactor (2-3 hours)

**Total:** ~4.5 hours, very high ROI

---

### Session 2 (Next day) — **Code Quality**
1. PR-003: TypeScript strictness (4-6 hours)
2. PR-012: Audit trail UI enhancements (2-3 hours)

**Total:** 6-9 hours

---

### Sprint 2 (Week 2) — **Safety & Observability**
1. PR-010: E2E tests for critical paths
2. PR-011: Logging & error reporting
3. DOC-001: Compliance matrix
4. DOC-002: Operations manual

---

### Sprint 3 (Week 3-4) — **Operational Excellence**
1. PR-013: Admin dashboard
2. PR-014: Email notifications
3. PR-021: Transaction safety (if critical)

---

## Success Metrics

After completing this roadmap:
✅ Zero artificial delays in UX  
✅ 100% TypeScript strict mode compliance  
✅ Error handling visible & logged  
✅ E2E tests cover critical paths  
✅ Admin visibility into system health  
✅ Clear compliance documentation  
✅ Email notifications working  
✅ Audit trail accessible to operators  

---

## Questions Before We Start?

- Should we tackle all Phase 1 today, or focus on one deep-dive?
- Want to set up logging/error reporting now, or defer?
- Any compliance requirements we should prioritize?

