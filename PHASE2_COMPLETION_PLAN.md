# Phase 2 Completion Plan: Building the Final 15%
## Detailed Implementation Roadmap

**Prepared:** July 4, 2026  
**Total Estimated Timeline:** 5-6 weeks  
**Current Status:** 85% complete, 5 major features remaining

---

## 📋 Executive Summary

The remaining 15% consists of **5 independent features** that can be built in parallel with some dependencies:

| Feature | Effort | Dependencies | Priority | Status |
|---------|--------|-------------|----------|--------|
| 1. Document Upload Uniqueness Checks | 3 days | None | High | 🟢 Ready |
| 2. Calendar UI Enhancement | 2 weeks | Calendar infrastructure (✅ exists) | High | 🟢 Ready |
| 3. Document Sharing with Email | 1 week | Doc upload (ready), Email system (✅ exists) | Medium | 🟢 Ready |
| 4. AI-Powered Monthly Reports | 4 weeks | Monthly report foundation (✅ exists) | High | 🟢 Ready |
| 5. Mobile & Performance Polish | 1-2 weeks | None | Low | 🟢 Ready |

**Recommended Build Order:**
1. **Start:** Document Uniqueness + Calendar UI (parallel, no dependencies)
2. **Week 2:** Document Sharing (simple, quick win)
3. **Weeks 3-6:** AI Monthly Reports (complex, most valuable)
4. **Throughout:** Performance & mobile polish

---

## 🔧 Detailed Feature Specifications

### **Feature #1: Document Upload Uniqueness Checks** ⏱️ 3 days

#### **What It Does**
Prevent users from uploading duplicate documents (same filename + category + young person). If duplicate exists, show dialog offering to replace or cancel.

#### **User Flow**
```
Staff uploads "GP_Letter_2026.pdf" to Health category → 
System checks for existing "GP_Letter_2026.pdf" in Health category →
If exists: Show dialog "This document exists. Replace? Cancel? New version?" →
If replace: Update existing record, preserve upload timestamp and uploader
If new version: Rename to "GP_Letter_2026_v2.pdf" and proceed
```

#### **Database Changes Required**

**Migration File:**
```sql
-- Add unique constraint to prevent exact duplicates
ALTER TABLE public.young_person_documents 
ADD CONSTRAINT unique_doc_per_yp_category 
UNIQUE(young_person_id, category, file_name);

-- Add version tracking column
ALTER TABLE public.young_person_documents
ADD COLUMN IF NOT EXISTS is_latest BOOLEAN DEFAULT true;

-- Add previous version reference
ALTER TABLE public.young_person_documents
ADD COLUMN IF NOT EXISTS previous_version_id UUID 
REFERENCES public.young_person_documents(id) ON DELETE SET NULL;
```

#### **Frontend Changes** (`src/pages/Documents.tsx`)

1. **Before upload:** Check if document exists
```typescript
const checkForDuplicate = async (yp_id: string, category: string, filename: string) => {
  const { data } = await supabase
    .from('young_person_documents')
    .select('id, file_name, created_at')
    .eq('young_person_id', yp_id)
    .eq('category', category)
    .eq('file_name', filename)
    .single();
  
  return data || null;
};
```

2. **Show duplicate dialog if found**
```typescript
if (existingDoc) {
  setDuplicateDoc(existingDoc);
  setPendingUpload(newDoc);
  setDuplicateDialogOpen(true);
  return;
}
```

3. **Handle replace action**
```typescript
const handleReplaceDocument = async () => {
  // Mark old version as not latest
  await supabase
    .from('young_person_documents')
    .update({ is_latest: false })
    .eq('id', duplicateDoc.id);
  
  // Upload new version with reference to old
  // This creates audit trail of document updates
};
```

#### **Testing Checklist**
- [ ] Upload document successfully
- [ ] Attempt duplicate upload → dialog appears
- [ ] Select "Replace" → old version marked inactive, new version uploaded
- [ ] Select "New Version" → suffix added, both stored with relationship
- [ ] Cancel → no action, return to form
- [ ] Verify audit trail shows version history

#### **Deliverables**
- `supabase/migrations/20260704_document_versioning.sql`
- Updated `src/pages/Documents.tsx` with duplicate detection
- Updated `src/lib/types.ts` with new Document fields
- Component: `DocumentDuplicateDialog.tsx` (new)

#### **Time Breakdown**
- Database migration: 30 min
- Frontend logic: 1 day
- Dialog component: 4 hours
- Testing: 4 hours

---

### **Feature #2: Calendar UI Enhancement** ⏱️ 2 weeks

#### **Current State**
✅ Database schema exists (`calendar_events` table)  
✅ Individual calendar view exists  
✅ Group event toggle exists  
❌ Group calendar UI not fully working  
❌ .ics file generation incomplete  
❌ Email reminders not fully integrated  

#### **What Needs to Be Built**

##### **A) Fix Group Calendar View** (3 days)

**Current Issue:** Filter shows only group events, but they're not properly grouped/displayed

**Solution:**
```typescript
// Update CalendarScheduling.tsx
const groupedEvents = useMemo(() => {
  const grouped = new Map<string, CalendarEvent[]>();
  filteredEvents.forEach(event => {
    const key = event.event_date;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(event);
  });
  return grouped;
}, [filteredEvents]);

// Render group calendar
{view === 'group' && (
  <Card>
    <CardHeader>
      <CardTitle>Team Events - {format(currentMonth, 'MMMM yyyy')}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {Array.from(groupedEvents.entries()).map(([date, events]) => (
        <div key={date} className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">{format(new Date(date), 'EEEE, MMMM d')}</h3>
          <div className="space-y-2">
            {events.map(event => (
              <GroupEventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
)}
```

**Deliverables:**
- Fixed `CalendarScheduling.tsx` group view logic
- New component: `GroupEventCard.tsx`
- Styling adjustments for event cards

**Testing:**
- [ ] Switch to Group view
- [ ] Verify only group events show
- [ ] Events grouped by date
- [ ] Can see who's invited, time, location

##### **B) Complete .ics File Generation** (4 days)

**Current:** Basic ICS generation exists in `send-notification` edge function  
**Goal:** Integrate into calendar UI so users can download .ics and add to Outlook/Apple Calendar

**Changes Needed:**

1. **Enhance `icsExport.ts` utility:**
```typescript
export function generateCalendarICS(event: CalendarEvent): string {
  const {
    event_title,
    event_date,
    start_time,
    end_time,
    location,
    description,
    participants,
    id: event_id
  } = event;

  const startDateTime = formatICSDateTime(event_date, start_time);
  const endDateTime = formatICSDateTime(event_date, end_time);
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//FocusCMS//Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:FocusCMS Calendar Event
X-WR-TIMEZONE:Europe/London
BEGIN:VEVENT
UID:${event_id}@focuscms.com
DTSTAMP:${now}
DTSTART:${startDateTime}
DTEND:${endDateTime}
SUMMARY:${event_title}
DESCRIPTION:${description || 'No description'}
LOCATION:${location || 'TBD'}
STATUS:CONFIRMED
SEQUENCE:0
${participants?.map(p => `ATTENDEE:mailto:${p.email}`).join('\n') || ''}
END:VEVENT
END:VCALENDAR`;
}

function formatICSDateTime(date: string, time: string): string {
  // Converts "2026-07-04" + "14:30" → "20260704T143000Z"
  const [year, month, day] = date.split('-');
  const [hours, minutes] = time.split(':');
  return `${year}${month}${day}T${hours}${minutes}00Z`;
}
```

2. **Add download button to event detail:**
```typescript
<Button 
  variant="outline" 
  onClick={() => {
    const icsContent = generateCalendarICS(event);
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.event_title.replace(/\s/g, '_')}.ics`;
    a.click();
  }}
>
  <Download className="h-4 w-4 mr-2" />
  Add to Calendar
</Button>
```

3. **Integrate with email reminders:**
   - When email sent, attach generated .ics file
   - This already works in `send-notification` edge function
   - Just ensure all calendar events trigger the reminder queue

**Deliverables:**
- Enhanced `src/utils/icsExport.ts`
- Calendar event detail page with download button
- Email integration verification

**Testing:**
- [ ] Download .ics file from event detail
- [ ] Open in Outlook → event appears in calendar
- [ ] Open in Apple Calendar → event appears
- [ ] Event details (time, location, description) correct
- [ ] Email reminder includes .ics attachment
- [ ] Calendar invite email opens correctly in both clients

##### **C) Email Reminders Integration** (4 days)

**Current:** Infrastructure exists (pg_cron job, edge function)  
**Goal:** Ensure reminders send reliably 24h before and 48h before for tasks

**Database Check:**
```sql
-- Verify pg_cron job exists
SELECT * FROM pg_cron.job;

-- Should show:
-- enqueue_upcoming_reminders | 1 0 * * * | timezone='UTC'
-- Runs daily at 1 AM UTC
```

**Backend Logic** (`supabase/functions/schedule-reminders/index.ts` - if needed, or enhance existing):
```typescript
// Check for events/tasks due in 24h and 48h
const checkUpcomingReminders = async () => {
  const now = new Date();
  const tomorrow24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const twodays48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  // Find calendar events
  const { data: events24h } = await supabase
    .from('calendar_events')
    .select('*')
    .gte('event_date', format(now, 'yyyy-MM-dd'))
    .lte('event_date', format(tomorrow24h, 'yyyy-MM-dd'))
    .eq('reminder_sent_24h', false);

  // Find tasks due
  const { data: tasks48h } = await supabase
    .from('tasks')
    .select('*')
    .gte('due_date', format(now, 'yyyy-MM-dd'))
    .lte('due_date', format(twodays48h, 'yyyy-MM-dd'))
    .eq('reminder_sent_48h', false);

  // Queue notifications
  for (const event of events24h) {
    await queueNotification({
      type: 'calendar_reminder_24h',
      recipient_id: event.created_by,
      event_id: event.id
    });
  }

  for (const task of tasks48h) {
    await queueNotification({
      type: 'task_reminder_48h',
      recipient_id: task.assigned_to,
      task_id: task.id
    });
  }
};
```

**Frontend:** Already shows in task/event detail "Reminder will be sent X days before"

**Deliverables:**
- Database migrations to add `reminder_sent_24h` and `reminder_sent_48h` columns
- Edge function: `schedule-reminders` (or enhance existing escalation-check)
- Verification: pg_cron job logs showing it runs daily

**Testing:**
- [ ] Create event 25 hours in future
- [ ] Wait for cron job to run (or manually trigger)
- [ ] Verify email received 24 hours before
- [ ] Same for tasks at 48 hours

---

### **Feature #3: Document Sharing with Email** ⏱️ 1 week

#### **What It Does**
Allow staff to securely email documents to external parties (social workers, courts, parents) with:
- Expiring links (7-day access)
- Audit trail of who accessed what
- Optional message/context
- Optional notification to recipient

#### **User Flow**
```
Staff views document → Click "Share" button →
Modal: Enter recipient email, optional message →
System generates 7-day expiring link → 
Email sent with secure link → 
Recipient clicks link → Document opens in browser/downloads →
Access logged in audit trail
```

#### **Database Changes**

**New Table: `document_shares`**
```sql
CREATE TABLE public.document_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.young_person_documents(id) ON DELETE CASCADE,
  shared_by_user_id UUID NOT NULL,
  recipient_email TEXT NOT NULL,
  access_token UUID DEFAULT gen_random_uuid() UNIQUE,
  created_at TIMESTAMP DEFAULT now(),
  expires_at TIMESTAMP DEFAULT (now() + INTERVAL '7 days'),
  is_active BOOLEAN DEFAULT true,
  last_accessed_at TIMESTAMP,
  access_count INT DEFAULT 0,
  share_message TEXT,
  
  -- RLS
  CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

CREATE INDEX idx_document_shares_token ON public.document_shares(access_token);
CREATE INDEX idx_document_shares_document ON public.document_shares(document_id);

-- RLS
ALTER TABLE public.document_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view shares they created"
  ON public.document_shares
  FOR SELECT
  USING (auth.uid() = shared_by_user_id);

CREATE POLICY "Users can create shares"
  ON public.document_shares
  FOR INSERT
  WITH CHECK (auth.uid() = shared_by_user_id);

CREATE POLICY "Unauthenticated can access via token (in app logic)"
  ON public.document_shares
  FOR SELECT
  USING (true);  -- App must verify token in backend

-- New table: share_access_logs
CREATE TABLE public.share_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID NOT NULL REFERENCES public.document_shares(id) ON DELETE CASCADE,
  accessed_at TIMESTAMP DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

CREATE INDEX idx_share_access_logs_share ON public.share_access_logs(share_id);
```

#### **Backend: Document Share Page**

New route: `/document-share/:token`

```typescript
// pages/DocumentShare.tsx
export default function DocumentShare() {
  const { token } = useParams();
  const [share, setShare] = useState<DocumentShare | null>(null);
  const [document, setDocument] = useState<Document | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    validateAndFetchShare();
  }, [token]);

  const validateAndFetchShare = async () => {
    // 1. Check if share exists and is not expired
    const { data: shareData, error: shareError } = await supabase
      .from('document_shares')
      .select(`
        *,
        young_person_documents (*)
      `)
      .eq('access_token', token)
      .eq('is_active', true)
      .gt('expires_at', 'now()')
      .single();

    if (shareError || !shareData) {
      setError('Share link has expired or is invalid');
      setLoading(false);
      return;
    }

    // 2. Log this access
    await supabase.from('share_access_logs').insert({
      share_id: shareData.id,
      ip_address: '0.0.0.0', // Get from headers
      user_agent: navigator.userAgent
    });

    // 3. Increment access count
    await supabase
      .from('document_shares')
      .update({
        last_accessed_at: new Date(),
        access_count: shareData.access_count + 1
      })
      .eq('id', shareData.id);

    setShare(shareData);
    setDocument(shareData.young_person_documents);
    setLoading(false);
  };

  if (loading) return <LoadingScreen />;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Shared Document: {document?.file_name}</CardTitle>
          <CardDescription>
            Link expires {format(new Date(share.expires_at), 'PPpp')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {share?.share_message && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-medium">Message from sender:</p>
              <p className="text-sm mt-2">{share.share_message}</p>
            </div>
          )}
          
          <div className="flex gap-3">
            <Button onClick={() => downloadDocument(document)}>
              <Download className="h-4 w-4 mr-2" />
              Download Document
            </Button>
            <Button variant="outline" onClick={() => {
              const url = supabase.storage
                .from('young-person-documents')
                .getPublicUrl(document?.storage_path).data.publicUrl;
              window.open(url, '_blank');
            }}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            Document shared by {share?.shared_by_name} on {format(new Date(share.created_at), 'PPp')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### **Frontend: Share Dialog** (Documents.tsx)

```typescript
const handleShareDocument = async (doc: Document) => {
  setShareDoc(doc);
  setShareOpen(true);
};

const submitShare = async () => {
  if (!shareEmail || !shareDoc) return;

  // 1. Create share record
  const { data: shareData, error: shareError } = await supabase
    .from('document_shares')
    .insert({
      document_id: shareDoc.id,
      shared_by_user_id: user?.id,
      recipient_email: shareEmail,
      share_message: shareMessage
    })
    .select()
    .single();

  if (shareError) {
    toast.error('Failed to create share');
    return;
  }

  // 2. Send email via Edge Function
  const shareUrl = `${window.location.origin}/document-share/${shareData.access_token}`;
  
  const { error: emailError } = await supabase.functions.invoke('send-notification', {
    body: {
      notification_type: 'document_shared',
      recipient_email: shareEmail,
      payload: {
        document_name: shareDoc.file_name,
        young_person_name: youngPerson?.first_name,
        shared_by: user?.email,
        message: shareMessage,
        secure_link: shareUrl,
        expiry_date: format(addDays(new Date(), 7), 'PPP')
      }
    }
  });

  if (emailError) {
    toast.error('Failed to send email');
    return;
  }

  toast.success(`Document shared with ${shareEmail}`);
  setShareOpen(false);
  setShareEmail('');
  setShareMessage('');
};
```

#### **Email Template** (add to send-notification edge function)

```typescript
function buildDocumentShareEmail(payload: Record<string, any>) {
  const { document_name, young_person_name, shared_by, message, secure_link, expiry_date } = payload;

  return {
    subject: `🔐 Secure Document Share: ${document_name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <div style="background-color: #1a1a2e; color: white; padding: 20px;">
          <h2>Secure Document Share</h2>
        </div>
        <div style="padding: 20px; border: 1px solid #e0e0e0;">
          <p>Hi,</p>
          <p><strong>${shared_by}</strong> has securely shared a document with you regarding <strong>${young_person_name}</strong>.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p><strong>Document:</strong> ${document_name}</p>
            ${message ? `<p><strong>Message:</strong><br/>${message}</p>` : ''}
          </div>

          <p>
            <a href="${secure_link}" style="display: inline-block; background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Secure Document
            </a>
          </p>

          <p style="font-size: 12px; color: #666; margin-top: 20px;">
            ⏰ This link expires on <strong>${expiry_date}</strong><br/>
            🔒 This is a secure link - do not forward this email
          </p>
        </div>
      </div>
    `,
    text: `${shared_by} has shared "${document_name}" regarding ${young_person_name}.\n\n${message ? `Message: ${message}\n\n` : ''}Access link: ${secure_link}\n\nThis link expires on ${expiry_date}`
  };
}
```

#### **Deliverables**
- Database migrations: `document_shares` + `share_access_logs` tables
- New page: `src/pages/DocumentShare.tsx`
- Updated `Documents.tsx` with share button and dialog
- Enhanced `send-notification` edge function with document_shared template
- Router update: Add route `/document-share/:token`

#### **Testing Checklist**
- [ ] Create share → record created in database
- [ ] Email sent to recipient with link
- [ ] Recipient clicks link → page loads without authentication
- [ ] Document downloads/previews correctly
- [ ] Access logged in audit trail
- [ ] Wait 8 days → link expires, shows error
- [ ] Share manager dashboard shows all active shares + access history

---

### **Feature #4: AI-Powered Monthly Reports** ⏱️ 4 weeks

#### **Current State**
✅ Basic report generation works  
✅ Data aggregation started  
❌ AI integration incomplete  
❌ SMART goal setting UI missing  
❌ Staff review interface missing  
❌ Auto-scheduled generation missing  

#### **What Needs to Be Built**

This is the most complex feature. Breaking into 4 phases:

##### **Phase 1: Data Aggregation Engine** (1 week)

**Goal:** Create a service that gathers all relevant data for a young person for a given month

**New Edge Function:** `supabase/functions/aggregate-monthly-data/index.ts`

```typescript
interface MonthlyData {
  youngPersonId: string;
  youngPersonName: string;
  reportMonth: string; // "2026-06"
  
  // Data sections
  health: {
    newConditionsRecorded: Array<{condition: string; severity: number}>;
    crisisAlerts: number;
    medicalVisits: Array<{type: string; date: string; outcome: string}>;
  };
  
  riskAssessment: {
    current: {level: string; score: number};
    previous: {level: string; score: number};
    escalated: boolean;
  };
  
  missingEpisodes: {
    count: number;
    totalHoursAwayAverage: number;
    critical: number;
  };
  
  tasks: {
    created: number;
    completed: number;
    completionRate: number;
    overdue: Array<{title: string; daysOverdue: number}>;
  };
  
  keyworkSessions: {
    count: number;
    types: Record<string, number>;
    goalsAchieved: number;
    goalsTotal: number;
  };
  
  chronology: Array<{
    date: string;
    entry: string;
    tags: string[];
  }>;
  
  documents: {
    uploaded: number;
    categories: Record<string, number>;
  };
  
  utilization: {
    nightsAwayFromPlacement: number;
    totalNights: number;
    percentage: number;
  };
}

export const aggregateMonthlyData = async (
  youngPersonId: string,
  month: string // "2026-06"
): Promise<MonthlyData> => {
  const monthStart = `${month}-01`;
  const monthEnd = getLastDayOfMonth(month);

  const [
    healthData,
    riskData,
    missingData,
    taskData,
    keyworkData,
    chronologyData,
    documentData,
    utilizationData
  ] = await Promise.all([
    // Health data
    supabase
      .from('health_condition_entries')
      .select('*')
      .eq('young_person_id', youngPersonId)
      .gte('created_at', monthStart)
      .lte('created_at', monthEnd),
    
    // Risk assessment data
    supabase
      .from('risk_assessments')
      .select('*')
      .eq('young_person_id', youngPersonId)
      .order('created_at', { ascending: false })
      .limit(2),
    
    // Missing episodes
    supabase
      .from('missing_episodes')
      .select('*')
      .eq('young_person_id', youngPersonId)
      .gte('reported_date', monthStart)
      .lte('reported_date', monthEnd),
    
    // Tasks
    supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to_young_person_id', youngPersonId)
      .gte('created_at', monthStart)
      .lte('created_at', monthEnd),
    
    // Keywork sessions
    supabase
      .from('keywork_sessions')
      .select('*')
      .eq('young_person_id', youngPersonId)
      .gte('session_date', monthStart)
      .lte('session_date', monthEnd),
    
    // Chronology
    supabase
      .from('chronology_entries')
      .select('*')
      .eq('young_person_id', youngPersonId)
      .gte('entry_date', monthStart)
      .lte('entry_date', monthEnd)
      .eq('flagged_for_report', true),
    
    // Documents
    supabase
      .from('young_person_documents')
      .select('*')
      .eq('young_person_id', youngPersonId)
      .gte('created_at', monthStart)
      .lte('created_at', monthEnd),
    
    // Utilization (night check data)
    supabase
      .from('night_checks')  // Assuming this table exists or we use placement status records
      .select('*')
      .eq('young_person_id', youngPersonId)
      .gte('check_date', monthStart)
      .lte('check_date', monthEnd),
  ]);

  // Aggregate data into structured format
  const aggregated: MonthlyData = {
    youngPersonId,
    youngPersonName: `${yp.first_name} ${yp.last_name}`,
    reportMonth: month,
    
    health: {
      newConditionsRecorded: healthData.map(h => ({
        condition: h.condition_name,
        severity: h.severity_rating
      })),
      crisisAlerts: healthData.filter(h => h.severity_rating === 5).length,
      medicalVisits: [/* ... */]
    },
    
    riskAssessment: {
      current: riskData[0] ? {
        level: calculateRiskLevel(riskData[0].total_score),
        score: riskData[0].total_score
      } : { level: 'Unknown', score: 0 },
      previous: riskData[1] ? {
        level: calculateRiskLevel(riskData[1].total_score),
        score: riskData[1].total_score
      } : { level: 'Unknown', score: 0 },
      escalated: riskData.length >= 2 && 
                 calculateRiskLevel(riskData[0].total_score) > 
                 calculateRiskLevel(riskData[1].total_score)
    },
    
    // ... continue for other sections
  };

  return aggregated;
};
```

**Database Changes:**
```sql
-- Verify/create night_checks table for utilization tracking
CREATE TABLE IF NOT EXISTS public.night_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  young_person_id UUID NOT NULL REFERENCES public.young_people(id),
  check_date DATE NOT NULL,
  present BOOLEAN,
  away_reason TEXT,
  created_by UUID,
  created_at TIMESTAMP DEFAULT now()
);

-- Ensure RLS
ALTER TABLE public.night_checks ENABLE ROW LEVEL SECURITY;
```

##### **Phase 2: AI Content Generation** (2 weeks)

**Goal:** Integrate LLM (Claude or GPT-4) to generate empathetic report letter

**New Edge Function:** `supabase/functions/generate-ai-report-letter/index.ts`

```typescript
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
});

export const generateReportLetter = async (
  monthlyData: MonthlyData
): Promise<string> => {
  const systemPrompt = `You are a compassionate care professional writing a monthly review letter to a young person in residential care. 
Your letter should:
1. Start with a warm greeting using their first name
2. Acknowledge their progress and efforts this month
3. Highlight 2-3 specific achievements or positive moments
4. Address any challenges they faced with empathy
5. Explain health/risk information in age-appropriate, non-scary language
6. Set out clear, achievable goals for next month
7. End with encouragement and offer support

Use conversational, supportive language. Avoid jargon. Keep to 400-500 words.
This will be read by a young person aged 12-18, so be authentic and caring.`;

  const userPrompt = `Generate a monthly review letter for ${monthlyData.youngPersonName} based on this data:

**Health This Month:**
${monthlyData.health.newConditionsRecorded.map(c => `- ${c.condition}: severity ${c.severity}/5`).join('\n')}
${monthlyData.health.crisisAlerts > 0 ? `- Had ${monthlyData.health.crisisAlerts} health alerts that were addressed` : ''}

**Risk Assessment:**
- Current risk level: ${monthlyData.riskAssessment.current.level}
- ${monthlyData.riskAssessment.escalated ? 'Risk increased this month - extra support being provided' : 'Risk level stable'}

**What You Achieved:**
- Completed ${monthlyData.tasks.completed} of ${monthlyData.tasks.created} planned tasks
- Attended ${monthlyData.keyworkSessions.count} keywork sessions
- ${monthlyData.keyworkSessions.goalsAchieved} goals achieved

**Key Moments This Month:**
${monthlyData.chronology.slice(0, 3).map(c => `- ${c.entry}`).join('\n')}

**Missing Episodes:**
${monthlyData.missingEpisodes.count > 0 ? `- ${monthlyData.missingEpisodes.count} times away from placement (being worked on)` : '- No missing episodes - great stability!'}

Write a supportive, age-appropriate letter incorporating these elements.`;

  const message = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: userPrompt,
      },
    ],
    system: systemPrompt,
  });

  if (message.content[0].type === "text") {
    return message.content[0].text;
  }

  throw new Error("Unexpected response format from Claude");
};
```

**Database Migration:**
```sql
-- Add AI-specific columns to monthly_reports
ALTER TABLE public.monthly_reports
ADD COLUMN IF NOT EXISTS ai_draft_content TEXT,
ADD COLUMN IF NOT EXISTS ai_model_used TEXT DEFAULT 'claude-3-5-sonnet',
ADD COLUMN IF NOT EXISTS ai_generated_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS staff_reviewed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS staff_review_notes TEXT,
ADD COLUMN IF NOT EXISTS final_content TEXT;
```

**Testing:**
- [ ] Call aggregation function → returns structured data
- [ ] Call AI function with sample data → generates coherent letter
- [ ] Letter reads naturally (manual review)
- [ ] No sensitive data exposed inappropriately
- [ ] Tone is appropriate for young person's age

##### **Phase 3: SMART Goals UI & Review Interface** (1 week)

**Goal:** Build interface for staff to review, edit, and approve reports before publishing

**New Component:** `ReportReviewModal.tsx`

```typescript
interface ReportReviewModalProps {
  report: MonthlyReport;
  isOpen: boolean;
  onClose: () => void;
  onPublish: (report: MonthlyReport) => void;
}

export function ReportReviewModal({ report, isOpen, onClose, onPublish }: ReportReviewModalProps) {
  const [editContent, setEditContent] = useState(report.final_content);
  const [goals, setGoals] = useState<SMARTGoal[]>(report.smart_goals || []);
  const [reviewNotes, setReviewNotes] = useState(report.staff_review_notes || '');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review & Approve Report</DialogTitle>
          <DialogDescription>
            Review the AI-generated letter and set goals for next month
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="letter" className="w-full">
          <TabsList>
            <TabsTrigger value="letter">Letter</TabsTrigger>
            <TabsTrigger value="goals">SMART Goals</TabsTrigger>
            <TabsTrigger value="notes">Review Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="letter" className="space-y-4">
            <div>
              <Label>AI-Generated Letter (edit if needed)</Label>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="h-96 font-mono text-sm"
                placeholder="Edit the letter here..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  // Regenerate using different prompt/model
                  toast.info('Regenerate coming soon');
                }}
              >
                🔄 Regenerate
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  // Show AI model info and settings
                  toast.info('Model: Claude 3.5 Sonnet');
                }}
              >
                ℹ️ Model Info
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            <div>
              <Label>Set 3 SMART Goals for Next Month</Label>
              <p className="text-xs text-muted-foreground mb-4">
                SMART: Specific, Measurable, Achievable, Relevant, Time-bound
              </p>
            </div>

            {[0, 1, 2].map((idx) => (
              <div key={idx} className="border rounded-lg p-4 space-y-3">
                <div>
                  <Label>Goal {idx + 1}</Label>
                  <Input
                    placeholder="e.g., Attend all keywork sessions this month"
                    value={goals[idx]?.goal || ''}
                    onChange={(e) => {
                      const newGoals = [...goals];
                      newGoals[idx] = {
                        ...(newGoals[idx] || {}),
                        goal: e.target.value
                      } as SMARTGoal;
                      setGoals(newGoals);
                    }}
                  />
                </div>

                <div>
                  <Label>Target Completion Date</Label>
                  <Input
                    type="date"
                    value={goals[idx]?.target_date || ''}
                    onChange={(e) => {
                      const newGoals = [...goals];
                      newGoals[idx] = {
                        ...(newGoals[idx] || {}),
                        target_date: e.target.value
                      } as SMARTGoal;
                      setGoals(newGoals);
                    }}
                  />
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <div>
              <Label>Staff Review Notes</Label>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Any corrections, context, or notes for the record..."
                className="h-48"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Before Publishing:</p>
              <ul className="text-sm space-y-1">
                <li>✓ Letter is appropriate and accurate</li>
                <li>✓ SMART goals are achievable</li>
                <li>✓ No sensitive data exposed inappropriately</li>
                <li>✓ Tone is right for young person's age</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => onPublish({
              ...report,
              final_content: editContent,
              smart_goals: goals.filter(g => g.goal),
              staff_review_notes: reviewNotes,
              staff_reviewed: true
            })}
          >
            ✓ Approve & Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**Database Addition:**
```typescript
interface SMARTGoal {
  goal: string;
  target_date: string; // ISO date
  achieved?: boolean;
  achievement_date?: string;
}
```

##### **Phase 4: Auto-Scheduled Generation & Cron Job** (1 week)

**Goal:** Automatically generate reports on 1st of every month at 00:01

**Database Setup:**
```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create scheduled job
SELECT cron.schedule(
  'generate_monthly_reports',
  '1 0 1 * *',  -- 00:01 on 1st of every month UTC
  $$
    SELECT http_post(
      'https://YOUR_PROJECT.supabase.co/functions/v1/generate-monthly-reports',
      json_build_object(
        'authorization', 'Bearer ' || current_setting('app.service_role_key')
      )::text,
      'application/json'
    );
  $$
);
```

**Enhanced Edge Function:** `supabase/functions/generate-monthly-reports/index.ts`

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (req) => {
  try {
    // Get previous month
    const now = new Date();
    const targetMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const monthStr = targetMonth.toISOString().split('T')[0].slice(0, 7); // "2026-06"

    console.log(`[${new Date().toISOString()}] Starting monthly report generation for ${monthStr}`);

    // Get all active young people
    const { data: youngPeople, error: ypError } = await supabase
      .from('young_people')
      .select('id, first_name, last_name, date_of_birth')
      .eq('active', true);

    if (ypError) throw ypError;

    let successCount = 0;
    let errorCount = 0;

    for (const yp of youngPeople) {
      try {
        // 1. Check if report already exists for this month
        const { data: existing } = await supabase
          .from('monthly_reports')
          .select('id')
          .eq('young_person_id', yp.id)
          .eq('report_month', monthStr)
          .single();

        if (existing) {
          console.log(`Report already exists for ${yp.first_name} ${yp.last_name}`);
          continue;
        }

        // 2. Aggregate data
        const monthlyData = await aggregateMonthlyData(yp.id, monthStr);

        // 3. Generate AI letter
        const aiLetter = await generateReportLetter(monthlyData);

        // 4. Create report record
        const { error: insertError } = await supabase
          .from('monthly_reports')
          .insert({
            young_person_id: yp.id,
            report_month: monthStr,
            ai_draft_content: aiLetter,
            ai_model_used: 'claude-3-5-sonnet',
            ai_generated_at: new Date(),
            status: 'draft',
            utilization_metrics: monthlyData.utilization,
            summary_data: monthlyData // Store full aggregation for reference
          });

        if (insertError) throw insertError;

        // 5. Send notification to manager
        await supabase.functions.invoke('send-notification', {
          body: {
            notification_type: 'monthly_report_ready',
            recipient_email: 'manager@example.com', // Get actual manager
            payload: {
              young_person_name: `${yp.first_name} ${yp.last_name}`,
              report_month: monthStr,
              report_url: `https://app.com/monthly-reports?id=${yp.id}`
            }
          }
        });

        successCount++;
        console.log(`✓ Generated report for ${yp.first_name} ${yp.last_name}`);

      } catch (error) {
        errorCount++;
        console.error(`✗ Error generating report for ${yp.id}:`, error);
      }
    }

    console.log(`[${new Date().toISOString()}] Report generation complete: ${successCount} success, ${errorCount} errors`);

    return new Response(
      JSON.stringify({ successCount, errorCount }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Fatal error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
```

**Deliverables:**
- Edge function: `generate-ai-report-letter`
- Edge function: Enhanced `generate-monthly-reports`
- Component: `ReportReviewModal.tsx`
- Database migrations for SMART goals and AI fields
- pg_cron scheduled job setup

**Testing:**
- [ ] Manual trigger of generation function
- [ ] Reports created for all young people
- [ ] AI letter generated and readable
- [ ] Manager notified to review
- [ ] Review interface shows letter + goals
- [ ] Publish creates PDF output
- [ ] Cron job runs on 1st of month (monitor logs)

#### **Deliverables Summary for Feature #4**
1. **Data Aggregation Service:**
   - `supabase/functions/aggregate-monthly-data/index.ts`
   - Database migrations for `night_checks` table

2. **AI Integration:**
   - `supabase/functions/generate-ai-report-letter/index.ts`
   - Updated `generate-monthly-reports` edge function
   - Database schema updates for AI fields

3. **UI Components:**
   - Enhanced `MonthlyReports.tsx` page
   - `ReportReviewModal.tsx` component
   - PDF export enhancement

4. **Automation:**
   - pg_cron scheduled job SQL script
   - Manager notification system

5. **Documentation:**
   - Setup guide for Anthropic/OpenAI API keys
   - Email templates for report notifications

---

### **Feature #5: Mobile & Performance Optimization** ⏱️ 1-2 weeks

#### **Mobile Responsiveness Issues to Fix**

1. **Calendar view on mobile:** Grid layout breaks on small screens
   - Solution: Switch to list view on mobile
   - Add breakpoint: `max-w-md:` for calendar cards

2. **Document upload on mobile:** File picker doesn't work well
   - Solution: Use mobile-friendly file input
   - Add drag-and-drop fallback for non-mobile

3. **Tables on mobile:** Task lists, missing episodes overflow
   - Solution: Responsive table component that stacks on mobile

4. **Modals on mobile:** Full-screen dialogs needed
   - Solution: `DialogContent className="max-w-[95vw]"` for mobile

#### **Performance Optimizations**

1. **Lazy Loading Images:**
   - Load profile photos only when visible
   - Use `loading="lazy"` attribute

2. **Query Optimization:**
   - Add database indices for common filters
   - Reduce query payload (select only needed fields)

3. **Code Splitting:**
   - Split calendar view into separate chunk
   - Lazy load report editor

4. **Caching Strategy:**
   - React Query: set 5-minute cache for dashboard data
   - User preferences stored locally

#### **Deliverables**
- Responsive utility classes added
- Query optimizations
- Code splitting in routing
- Performance metrics dashboard

---

## 📊 Implementation Timeline

### **Timeline Overview**

```
Week 1: Document Uniqueness + Calendar UI (Start)
├─ Mon-Wed: Document versioning (3 days)
├─ Thu-Fri: Calendar group view (2 days)
└─ Parallel: Calendar .ics integration (4 days)

Week 2: Calendar Completion + Document Sharing
├─ Mon-Tue: Calendar .ics + reminders (2 days)
├─ Wed: Document sharing database (1 day)
├─ Thu-Fri: Document sharing UI (2 days)
└─ Testing & Polish (1 day)

Week 3-4: AI Monthly Reports (Part 1)
├─ Mon-Wed: Data aggregation engine (3 days)
├─ Thu-Fri: Testing aggregation (2 days)
└─ Begin AI integration

Week 5-6: AI Monthly Reports (Part 2) + Polish
├─ Mon-Wed: AI letter generation (3 days)
├─ Thu: SMART goals UI (1 day)
├─ Fri: Review & publish interface (1 day)
├─ Next week: Auto-scheduling + cron (2 days)
└─ Mobile & performance (3-4 days)
```

### **Parallel Tracks**
- **Track A (Week 1-2):** Document features (uniqueness + sharing)
- **Track B (Week 1-2):** Calendar enhancements
- **Track C (Week 3-6):** AI reports (sequential, dependencies)
- **Throughout:** Testing, bug fixes, polish

---

## 🔍 Dependency Map

```
Document Uniqueness
  ├─ No dependencies ✓
  └─ Can start immediately

Calendar UI
  ├─ Calendar infrastructure ✓ (exists)
  ├─ Email system ✓ (Resend integrated)
  └─ Can start immediately

Document Sharing
  ├─ Document upload ✓ (exists)
  ├─ Email system ✓ (Resend integrated)
  └─ Can start Week 2

AI Monthly Reports
  ├─ Monthly report foundation ✓ (exists)
  ├─ Requires: Anthropic/OpenAI API key
  └─ Can start Week 3

Mobile & Performance
  ├─ No dependencies ✓
  ├─ Best after features complete (polish phase)
  └─ Can run in parallel
```

---

## 📝 Testing Strategy

### **Automated Testing** (Optional but recommended)
```typescript
// tests/features/document-uniqueness.test.ts
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Documents from '@/pages/Documents';

describe('Document Uniqueness', () => {
  it('shows duplicate dialog when uploading same file', async () => {
    // Create initial document
    // Attempt duplicate upload
    // Verify dialog appears
  });

  it('replaces document when selected', async () => {
    // Same as above
    // Click "Replace"
    // Verify old version marked inactive
  });
});
```

### **Manual Testing Checklist**
Each feature has detailed test checklists above. Before merging:
- [ ] Feature works as specified
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Works across browsers (Chrome, Safari, Firefox, Edge)
- [ ] Accessibility: keyboard navigation works
- [ ] Audit trail updated correctly

### **Staging Deployment**
1. Deploy to staging environment first
2. Test with real data (previous month)
3. Get feedback from 2-3 staff users
4. Fix issues
5. Deploy to production

---

## 🚀 Deployment & Release Strategy

### **Before Each Release**
```bash
# 1. Run all tests
npm run test

# 2. Check for TypeScript errors
npm run type-check

# 3. Run linter
npm run lint

# 4. Build production bundle
npm run build

# 5. Deploy database migrations
supabase migration up

# 6. Deploy edge functions
supabase functions deploy

# 7. Deploy to production (via Lovable platform)
```

### **Release Notes Template**
For each feature release:
```markdown
## Version 0.85.0 - Document Uniqueness & Calendar Enhancements

### New Features
- ✅ Document upload now prevents duplicates
- ✅ Calendar view shows team events
- ✅ .ics file export for Outlook/Apple Calendar

### Bug Fixes
- Fixed event reminder emails not sending

### Breaking Changes
None

### Migration Required
Yes - Run `supabase migration up`

### Update Instructions
- Users: No action needed
- Admins: Verify calendar email settings
```

---

## 🎯 Success Criteria

### **Phase 2 Complete When:**
- ✅ All 5 features implemented and tested
- ✅ Zero known critical bugs
- ✅ 100% of Phase 2 requirements met
- ✅ Staff can use all features without training
- ✅ Performance meets SLA (page load <2s, search <1s)
- ✅ Mobile works on iPhone + Android
- ✅ Audit trail complete
- ✅ Ofsted-ready documentation

### **Quality Gates**
- TypeScript: 0 errors, strict mode enabled
- Tests: 80%+ coverage (target)
- Accessibility: WCAG AA compliant
- Performance: Lighthouse score >90
- Security: No SQL injections, XSS, CSRF vulnerabilities

---

## 💡 Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| AI API costs spiral | Medium | Set monthly budget limit, monitor usage daily |
| Cron job fails silently | High | Add monitoring/alerting on pg_cron logs |
| .ics files not compatible | Medium | Test with Outlook, Apple, Google Calendar |
| Document sharing link guessed | High | Use UUID tokens, not sequential IDs (✓ already using) |
| Performance degrades with large datasets | Medium | Add database indices, pagination, lazy loading |
| Staff forget to review reports | Medium | Email reminders every 2 days until reviewed |

---

## 📞 Handoff & Documentation

### **For Development Team**
- [ ] This detailed plan document ✓ (you have it)
- [ ] Database schema diagrams
- [ ] API documentation for edge functions
- [ ] Component storybook entries

### **For Staff/Users**
- [ ] Video tutorials (1-2 minutes each per feature)
- [ ] User guide PDF
- [ ] FAQ document
- [ ] Support email/contact info

---

## ✅ Ready to Start?

**Recommended Next Steps:**

1. **Review this plan** with dev team → agree on timeline & priorities
2. **Set up environment:**
   ```bash
   # Install Anthropic SDK
   npm install @anthropic-ai/sdk
   
   # Or if using OpenAI:
   npm install openai
   ```
3. **Get API keys:**
   - Anthropic API key (for Claude)
   - Or OpenAI API key (for GPT-4)
   - Add to Supabase Edge Function secrets

4. **Start Sprint 1:**
   - Assign: Document uniqueness + Calendar UI (parallel teams)
   - Stand-up: Daily 15 min check-ins
   - Target: 2 features complete by end of Week 1

5. **Track progress:**
   - Daily commits with clear messages
   - Weekly demos to stakeholders
   - Adjust timeline if blockers arise

---

**Questions?** This plan is detailed enough that implementation can begin immediately with minimal additional specification.

**Ready to begin?** Let me know which feature to start with, or if you want me to start on all of them! 🚀
