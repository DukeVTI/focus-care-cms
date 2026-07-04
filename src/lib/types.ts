/**
 * Shared TypeScript types for the FocusCMS platform
 * Use these instead of 'any' for type safety
 */

// ============================================================================
// DATABASE ENTITIES
// ============================================================================

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  job_title: string | null;
  team: string | null;
  avatar_url: string | null;
  availability_status: string | null;
  availability_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface YoungPerson {
  id: string;
  first_name: string;
  last_name: string;
  focus_id: string | null;
  date_of_birth: string | null;
  user_id: string | null;
  key_worker_id: string | null;
  known_risks: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  young_person_id: string;
  title: string;
  description: string | null;
  importance: string;
  status: string;
  assigned_to: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface MissingEpisode {
  id: string;
  young_person_id: string;
  missing_from: string;
  returned_at: string | null;
  status: string;
  case_id: string | null;
  police_notified: boolean;
  manager_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface RiskAssessment {
  id: string;
  young_person_id: string;
  assessed_by: string;
  assessment_date: string;
  risk_level: string;
  risk_score: number;
  recommendations: string | null;
  follow_up_needed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChronologyEntry {
  id: string;
  young_person_id: string;
  staff_id: string;
  entry_date: string;
  entry_time: string;
  summary: string;
  observation: string | null;
  category: string | null;
  significance: string | null;
  created_at: string;
  updated_at: string;
}

export interface KeyworkSession {
  id: string;
  young_person_id: string;
  session_date: string;
  session_type: string;
  title: string;
  topic: string;
  duration_minutes: number;
  location: string;
  created_at: string;
  updated_at: string;
}

export interface HealthEntry {
  id: string;
  young_person_id: string;
  category: string;
  condition_name: string;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: string;
  user_id?: string;
  title: string;
  event_type: string;
  activity_type?: string;
  status?: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  description?: string;
  young_person_id?: string | null;
  linked_task_id?: string | null;
  participants?: string[];
  participant_names?: string[];
  is_group_event?: boolean;
  recurrence?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface MedicalVisit {
  id: string;
  young_person_id: string;
  visit_date: string;
  visit_type: string;
  provider: string;
  reason: string;
  outcome?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  young_person_id: string;
  file_name: string;
  category?: string;
  document_type?: string;
  action_required: boolean;
  action_notes?: string | null;
  storage_path?: string;
  file_size?: number;
  is_latest?: boolean;
  previous_version_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  notify_health_crisis: boolean;
  notify_health_updates: boolean;
  notify_calendar_created: boolean;
  notify_calendar_24h: boolean;
  notify_calendar_48h: boolean;
  notify_task_assigned: boolean;
  notify_task_due: boolean;
  notify_task_48h: boolean;
  notify_risk_updated: boolean;
  notify_risk_high: boolean;
  notify_document_uploaded: boolean;
  digest_enabled: boolean;
  digest_frequency: string;
  created_at: string;
  updated_at: string;
}

export interface EmailNotificationLog {
  id: string;
  recipient_email: string;
  recipient_user_id?: string | null;
  notification_type: string;
  subject: string;
  body_text?: string;
  body_html?: string;
  health_entry_id?: string | null;
  calendar_event_id?: string | null;
  task_id?: string | null;
  risk_assessment_id?: string | null;
  young_person_id?: string | null;
  status: string;
  error_message?: string;
  retry_count: number;
  sent_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationQueueItem {
  id: string;
  notification_type: string;
  recipient_email: string;
  recipient_user_id: string;
  payload: Record<string, any>;
  scheduled_for: string;
  processed_at?: string;
  status: string;
  error_message?: string;
  retry_count: number;
  max_retries: number;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

// ============================================================================
// UI COMPONENT TYPES
// ============================================================================

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";
export type ColorVariant = "success" | "warning" | "destructive" | "secondary" | "primary";

// ============================================================================
// API RESPONSES
// ============================================================================

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, any>;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

// ============================================================================
// COMPONENT PROPS WITH GENERIC TYPES
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UseFormProps<T = Record<string, any>> = {
  form: import("react-hook-form").UseFormReturn<T>;
};

export type WithYoungPerson = {
  young_people?: YoungPerson | null;
};

export type WithProfile = {
  profiles?: Profile | null;
};

export type WithAssessor = {
  profiles?: Profile | null; // For risk_assessments assessor relationship
};

export type WithKeyWorker = {
  key_worker?: Profile | null;
};

export type WithStaff = {
  staff?: Profile[] | null;
};

// Entity types with relationships
export type TaskWithYoungPerson = Task & WithYoungPerson;
export type MissingEpisodeWithYoungPerson = MissingEpisode & WithYoungPerson;
export type RiskAssessmentWithYoungPerson = RiskAssessment & WithYoungPerson & WithAssessor;
export type ChronologyEntryWithYoungPerson = ChronologyEntry & WithYoungPerson;
export type KeyworkSessionWithYoungPerson = KeyworkSession & WithYoungPerson;
export type HealthEntryWithYoungPerson = HealthEntry & WithYoungPerson;

// Detail Page Types (entities with all required related data)
export type TaskDetail = Task & WithYoungPerson;
export type MissingEpisodeDetail = MissingEpisode & WithYoungPerson;
export type KeyworkSessionDetail = KeyworkSession & WithYoungPerson & WithStaff;
export type RiskAssessmentDetail = RiskAssessment & WithYoungPerson & WithAssessor & { linked_task?: Task | null };
export type ChronologyEntryDetail = ChronologyEntry & WithYoungPerson;
export type HealthEntryDetail = HealthEntry & WithYoungPerson;

// ============================================================================
// UNION TYPES FOR COMMON PATTERNS
// ============================================================================

export type Entity = YoungPerson | Task | MissingEpisode | RiskAssessment | ChronologyEntry;
export type EntityType = 'young_person' | 'task' | 'missing_episode' | 'risk_assessment' | 'chronology' | 'keywork_session';
