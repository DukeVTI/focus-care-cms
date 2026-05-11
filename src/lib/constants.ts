/**
 * FocusCMS Constants
 * Central source of truth for all magic strings
 * Update here, and all usages are updated automatically
 */

// ============================================================================
// TASK STATUSES
// ============================================================================

export const TASK_STATUSES = {
  PENDING: "pending",
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  DONE: "done",
  ARCHIVED: "archived",
} as const;

export type TaskStatus = typeof TASK_STATUSES[keyof typeof TASK_STATUSES];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TASK_STATUSES.PENDING]: "Pending",
  [TASK_STATUSES.OPEN]: "Open",
  [TASK_STATUSES.IN_PROGRESS]: "In Progress",
  [TASK_STATUSES.COMPLETED]: "Completed",
  [TASK_STATUSES.DONE]: "Done",
  [TASK_STATUSES.ARCHIVED]: "Archived",
};

export const ACTIVE_TASK_STATUSES = [
  TASK_STATUSES.PENDING,
  TASK_STATUSES.OPEN,
  TASK_STATUSES.IN_PROGRESS,
];

export const COMPLETED_TASK_STATUSES = [
  TASK_STATUSES.COMPLETED,
  TASK_STATUSES.DONE,
  TASK_STATUSES.ARCHIVED,
];

// ============================================================================
// TASK IMPORTANCE
// ============================================================================

export const TASK_IMPORTANCE = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const;

export type TaskImportance = typeof TASK_IMPORTANCE[keyof typeof TASK_IMPORTANCE];

export const TASK_IMPORTANCE_LABELS: Record<TaskImportance, string> = {
  [TASK_IMPORTANCE.LOW]: "Low",
  [TASK_IMPORTANCE.MEDIUM]: "Medium",
  [TASK_IMPORTANCE.HIGH]: "High",
};

export const TASK_IMPORTANCE_COLORS: Record<TaskImportance, string> = {
  [TASK_IMPORTANCE.LOW]: "secondary",
  [TASK_IMPORTANCE.MEDIUM]: "warning",
  [TASK_IMPORTANCE.HIGH]: "destructive",
};

// ============================================================================
// MISSING EPISODE STATUSES
// ============================================================================

export const MISSING_EPISODE_STATUSES = {
  REPORTED: "reported",
  MISSING: "missing",
  LOCATED: "located",
  RETURNED: "returned",
} as const;

export type MissingEpisodeStatus = typeof MISSING_EPISODE_STATUSES[keyof typeof MISSING_EPISODE_STATUSES];

export const MISSING_EPISODE_STATUS_LABELS: Record<MissingEpisodeStatus, string> = {
  [MISSING_EPISODE_STATUSES.REPORTED]: "Reported",
  [MISSING_EPISODE_STATUSES.MISSING]: "Missing",
  [MISSING_EPISODE_STATUSES.LOCATED]: "Located",
  [MISSING_EPISODE_STATUSES.RETURNED]: "Returned",
};

// ============================================================================
// USER ROLES
// ============================================================================

export const ROLE_TYPES = {
  STAFF: "staff",
  KEYWORKER: "keyworker",
  MANAGER: "manager",
  ADMIN: "admin",
} as const;

export type RoleType = typeof ROLE_TYPES[keyof typeof ROLE_TYPES];

export const ROLE_LABELS: Record<RoleType, string> = {
  [ROLE_TYPES.STAFF]: "Support Worker",
  [ROLE_TYPES.KEYWORKER]: "Keyworker",
  [ROLE_TYPES.MANAGER]: "Manager",
  [ROLE_TYPES.ADMIN]: "Administrator",
};

export const ROLE_HIERARCHY: Record<RoleType, number> = {
  [ROLE_TYPES.STAFF]: 1,
  [ROLE_TYPES.KEYWORKER]: 2,
  [ROLE_TYPES.MANAGER]: 3,
  [ROLE_TYPES.ADMIN]: 4,
};

// Roles that can delete documents
export const DELETE_DOCUMENT_ROLES = [ROLE_TYPES.MANAGER, ROLE_TYPES.ADMIN];

// Roles that can approve/sign off
export const APPROVAL_ROLES = [ROLE_TYPES.MANAGER, ROLE_TYPES.ADMIN];

// ============================================================================
// AVAILABILITY STATUS
// ============================================================================

export const AVAILABILITY_STATUS = {
  AVAILABLE: "available",
  UNAVAILABLE: "unavailable",
  ON_LEAVE: "on_leave",
} as const;

export type AvailabilityStatus = typeof AVAILABILITY_STATUS[keyof typeof AVAILABILITY_STATUS];

export const AVAILABILITY_STATUS_LABELS: Record<AvailabilityStatus, string> = {
  [AVAILABILITY_STATUS.AVAILABLE]: "Available",
  [AVAILABILITY_STATUS.UNAVAILABLE]: "Unavailable",
  [AVAILABILITY_STATUS.ON_LEAVE]: "On Leave",
};

// ============================================================================
// HEALTH CONDITION SEVERITIES
// ============================================================================

export const HEALTH_SEVERITY = {
  LEVEL_1: 1,
  LEVEL_2: 2,
  LEVEL_3: 3,
  LEVEL_4: 4,
  LEVEL_5: 5, // Crisis
} as const;

export const HEALTH_SEVERITY_LABELS: Record<number, string> = {
  [HEALTH_SEVERITY.LEVEL_1]: "Green",
  [HEALTH_SEVERITY.LEVEL_2]: "Amber",
  [HEALTH_SEVERITY.LEVEL_3]: "Orange",
  [HEALTH_SEVERITY.LEVEL_4]: "Red",
  [HEALTH_SEVERITY.LEVEL_5]: "Purple (Crisis)",
};

export const HEALTH_SEVERITY_COLORS: Record<number, string> = {
  [HEALTH_SEVERITY.LEVEL_1]: "text-success",
  [HEALTH_SEVERITY.LEVEL_2]: "text-yellow-500",
  [HEALTH_SEVERITY.LEVEL_3]: "text-orange-500",
  [HEALTH_SEVERITY.LEVEL_4]: "text-destructive",
  [HEALTH_SEVERITY.LEVEL_5]: "text-purple-600",
};

// ============================================================================
// RISK ASSESSMENT LEVELS
// ============================================================================

export const RISK_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const;

export type RiskLevel = typeof RISK_LEVELS[keyof typeof RISK_LEVELS];

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  [RISK_LEVELS.LOW]: "Low",
  [RISK_LEVELS.MEDIUM]: "Medium",
  [RISK_LEVELS.HIGH]: "High",
};

export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  [RISK_LEVELS.LOW]: "text-success",
  [RISK_LEVELS.MEDIUM]: "text-warning",
  [RISK_LEVELS.HIGH]: "text-destructive",
};

export const RISK_LEVEL_BADGE_VARIANTS: Record<RiskLevel, "default" | "secondary" | "destructive" | "outline"> = {
  [RISK_LEVELS.LOW]: "secondary",
  [RISK_LEVELS.MEDIUM]: "outline",
  [RISK_LEVELS.HIGH]: "destructive",
};

// Missing Episode Status Badge Variants
export const MISSING_EPISODE_STATUS_COLORS: Record<MissingEpisodeStatus, "default" | "secondary" | "destructive" | "outline"> = {
  [MISSING_EPISODE_STATUSES.REPORTED]: "default",
  [MISSING_EPISODE_STATUSES.MISSING]: "destructive",
  [MISSING_EPISODE_STATUSES.LOCATED]: "outline",
  [MISSING_EPISODE_STATUSES.RETURNED]: "secondary",
};

// Task Status Badge Variants
export const TASK_STATUS_BADGE_VARIANTS: Record<TaskStatus, "default" | "secondary" | "destructive" | "outline"> = {
  [TASK_STATUSES.PENDING]: "outline",
  [TASK_STATUSES.OPEN]: "default",
  [TASK_STATUSES.IN_PROGRESS]: "secondary",
  [TASK_STATUSES.COMPLETED]: "secondary",
  [TASK_STATUSES.DONE]: "secondary",
  [TASK_STATUSES.ARCHIVED]: "outline",
};

// Task Importance Badge Variants
export const TASK_IMPORTANCE_BADGE_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "high": "destructive",
  "medium": "outline",
  "low": "secondary",
};

// ============================================================================
// DOCUMENT CATEGORIES
// ============================================================================

export const DOCUMENT_CATEGORIES = {
  HEALTH: "health",
  LEGAL: "legal",
  FINANCE: "finance",
  EDUCATION: "education",
  SAFEGUARDING: "safeguarding",
  ID: "id",
  CONSENT: "consent",
  OTHER: "other",
} as const;

export type DocumentCategory = typeof DOCUMENT_CATEGORIES[keyof typeof DOCUMENT_CATEGORIES];

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  [DOCUMENT_CATEGORIES.HEALTH]: "Health & Medical",
  [DOCUMENT_CATEGORIES.LEGAL]: "Legal & Care",
  [DOCUMENT_CATEGORIES.FINANCE]: "Finance & Benefits",
  [DOCUMENT_CATEGORIES.EDUCATION]: "Education",
  [DOCUMENT_CATEGORIES.SAFEGUARDING]: "Safeguarding",
  [DOCUMENT_CATEGORIES.ID]: "ID & Identity",
  [DOCUMENT_CATEGORIES.CONSENT]: "Consents",
  [DOCUMENT_CATEGORIES.OTHER]: "Other",
};

// ============================================================================
// AUDIT LOG ACTIONS
// ============================================================================

export const AUDIT_LOG_ACTIONS = {
  INSERT: "INSERT",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
} as const;

export type AuditLogAction = typeof AUDIT_LOG_ACTIONS[keyof typeof AUDIT_LOG_ACTIONS];

export const AUDIT_LOG_ACTION_LABELS: Record<AuditLogAction, string> = {
  [AUDIT_LOG_ACTIONS.INSERT]: "Created",
  [AUDIT_LOG_ACTIONS.UPDATE]: "Updated",
  [AUDIT_LOG_ACTIONS.DELETE]: "Deleted",
};

// ============================================================================
// PAGINATION
// ============================================================================

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 25,
  SMALL_PAGE_SIZE: 10,
  LARGE_PAGE_SIZE: 50,
} as const;

// ============================================================================
// CALENDAR & SCHEDULING - EVENT TYPES
// ============================================================================

export const CALENDAR_EVENT_TYPES = {
  MEETING: "meeting",
  KEYWORK_SESSION: "keywork_session",
  REVIEW: "review",
  COURT_HEARING: "court_hearing",
  MEDICAL: "medical",
  EDUCATION: "education",
  HOME_VISIT: "home_visit",
  SUPERVISION: "supervision",
  TRAINING: "training",
  OTHER: "other",
} as const;

export type CalendarEventType = typeof CALENDAR_EVENT_TYPES[keyof typeof CALENDAR_EVENT_TYPES];

export const CALENDAR_EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
  [CALENDAR_EVENT_TYPES.MEETING]: "Meeting",
  [CALENDAR_EVENT_TYPES.KEYWORK_SESSION]: "Keywork Session",
  [CALENDAR_EVENT_TYPES.REVIEW]: "Review / LAC Review",
  [CALENDAR_EVENT_TYPES.COURT_HEARING]: "Court Hearing",
  [CALENDAR_EVENT_TYPES.MEDICAL]: "Medical Appointment",
  [CALENDAR_EVENT_TYPES.EDUCATION]: "Education Meeting",
  [CALENDAR_EVENT_TYPES.HOME_VISIT]: "Home Visit",
  [CALENDAR_EVENT_TYPES.SUPERVISION]: "Supervision",
  [CALENDAR_EVENT_TYPES.TRAINING]: "Training",
  [CALENDAR_EVENT_TYPES.OTHER]: "Other",
};

// ============================================================================
// CALENDAR & SCHEDULING - ACTIVITY TYPES (for reporting)
// ============================================================================

export const CALENDAR_ACTIVITY_TYPES = {
  SUPERVISION_1_1: "supervision_1_1",
  GROUP_THERAPY: "group_therapy",
  ADMINISTRATIVE: "administrative",
  TRAINING: "training",
  CASE_REVIEW: "case_review",
  STAFF_BRIEFING: "staff_briefing",
  EDUCATIONAL: "educational",
  HEALTH_APPOINTMENT: "health_appointment",
  COURT_APPEARANCE: "court_appearance",
  OTHER: "other",
} as const;

export type CalendarActivityType = typeof CALENDAR_ACTIVITY_TYPES[keyof typeof CALENDAR_ACTIVITY_TYPES];

export const CALENDAR_ACTIVITY_TYPE_LABELS: Record<CalendarActivityType, string> = {
  [CALENDAR_ACTIVITY_TYPES.SUPERVISION_1_1]: "1:1 Supervision",
  [CALENDAR_ACTIVITY_TYPES.GROUP_THERAPY]: "Group Therapy Session",
  [CALENDAR_ACTIVITY_TYPES.ADMINISTRATIVE]: "Administrative Work",
  [CALENDAR_ACTIVITY_TYPES.TRAINING]: "Training",
  [CALENDAR_ACTIVITY_TYPES.CASE_REVIEW]: "Case Review",
  [CALENDAR_ACTIVITY_TYPES.STAFF_BRIEFING]: "Staff Briefing",
  [CALENDAR_ACTIVITY_TYPES.EDUCATIONAL]: "Educational Activity",
  [CALENDAR_ACTIVITY_TYPES.HEALTH_APPOINTMENT]: "Health Appointment",
  [CALENDAR_ACTIVITY_TYPES.COURT_APPEARANCE]: "Court Appearance",
  [CALENDAR_ACTIVITY_TYPES.OTHER]: "Other",
};

// ============================================================================
// CALENDAR & SCHEDULING - EVENT STATUSES
// ============================================================================

export const CALENDAR_EVENT_STATUSES = {
  SCHEDULED: "scheduled",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  POSTPONED: "postponed",
} as const;

export type CalendarEventStatus = typeof CALENDAR_EVENT_STATUSES[keyof typeof CALENDAR_EVENT_STATUSES];

export const CALENDAR_EVENT_STATUS_LABELS: Record<CalendarEventStatus, string> = {
  [CALENDAR_EVENT_STATUSES.SCHEDULED]: "Scheduled",
  [CALENDAR_EVENT_STATUSES.COMPLETED]: "Completed",
  [CALENDAR_EVENT_STATUSES.CANCELLED]: "Cancelled",
  [CALENDAR_EVENT_STATUSES.POSTPONED]: "Postponed",
};

export const CALENDAR_EVENT_STATUS_COLORS: Record<CalendarEventStatus, string> = {
  [CALENDAR_EVENT_STATUSES.SCHEDULED]: "text-blue-600",
  [CALENDAR_EVENT_STATUSES.COMPLETED]: "text-success",
  [CALENDAR_EVENT_STATUSES.CANCELLED]: "text-destructive",
  [CALENDAR_EVENT_STATUSES.POSTPONED]: "text-warning",
};

// ============================================================================
// EMAIL NOTIFICATIONS
// ============================================================================

export const NOTIFICATION_TYPES = {
  HEALTH_CRISIS: "health_crisis",
  HEALTH_UPDATE: "health_update",
  CALENDAR_CREATED: "calendar_created",
  CALENDAR_24H_REMINDER: "calendar_24h_reminder",
  CALENDAR_48H_REMINDER: "calendar_48h_reminder",
  TASK_ASSIGNED: "task_assigned",
  TASK_DUE: "task_due",
  TASK_48H_REMINDER: "task_48h_reminder",
  RISK_ASSESSMENT_UPDATED: "risk_assessment_updated",
  RISK_ASSESSMENT_HIGH: "risk_assessment_high",
  DOCUMENT_UPLOADED: "document_uploaded",
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  [NOTIFICATION_TYPES.HEALTH_CRISIS]: "Health Crisis Alert",
  [NOTIFICATION_TYPES.HEALTH_UPDATE]: "Health Update",
  [NOTIFICATION_TYPES.CALENDAR_CREATED]: "Calendar Event Created",
  [NOTIFICATION_TYPES.CALENDAR_24H_REMINDER]: "Calendar Event Reminder (24h)",
  [NOTIFICATION_TYPES.CALENDAR_48H_REMINDER]: "Calendar Event Reminder (48h)",
  [NOTIFICATION_TYPES.TASK_ASSIGNED]: "Task Assigned",
  [NOTIFICATION_TYPES.TASK_DUE]: "Task Due Soon",
  [NOTIFICATION_TYPES.TASK_48H_REMINDER]: "Task Due in 48h",
  [NOTIFICATION_TYPES.RISK_ASSESSMENT_UPDATED]: "Risk Assessment Updated",
  [NOTIFICATION_TYPES.RISK_ASSESSMENT_HIGH]: "High Risk Assessment",
  [NOTIFICATION_TYPES.DOCUMENT_UPLOADED]: "Document Uploaded",
};

export const NOTIFICATION_STATUS = {
  QUEUED: "queued",
  SENT: "sent",
  FAILED: "failed",
  BOUNCED: "bounced",
} as const;

export type NotificationStatus = typeof NOTIFICATION_STATUS[keyof typeof NOTIFICATION_STATUS];

export const NOTIFICATION_STATUS_LABELS: Record<NotificationStatus, string> = {
  [NOTIFICATION_STATUS.QUEUED]: "Queued",
  [NOTIFICATION_STATUS.SENT]: "Sent",
  [NOTIFICATION_STATUS.FAILED]: "Failed",
  [NOTIFICATION_STATUS.BOUNCED]: "Bounced",
};

export const DIGEST_FREQUENCIES = {
  DAILY: "daily",
  WEEKLY: "weekly",
  NEVER: "never",
} as const;

export type DigestFrequency = typeof DIGEST_FREQUENCIES[keyof typeof DIGEST_FREQUENCIES];

export const DIGEST_FREQUENCY_LABELS: Record<DigestFrequency, string> = {
  [DIGEST_FREQUENCIES.DAILY]: "Daily",
  [DIGEST_FREQUENCIES.WEEKLY]: "Weekly",
  [DIGEST_FREQUENCIES.NEVER]: "Never",
};

// ============================================================================
// VALIDATION
// ============================================================================

export const VALIDATION = {
  MAX_FILE_SIZE_MB: 10,
  MIN_PASSWORD_LENGTH: 8,
  MAX_TEXT_FIELD: 500,
  MAX_LONG_TEXT_FIELD: 5000,
} as const;

// ============================================================================
// DATE FORMATS
// ============================================================================

export const DATE_FORMATS = {
  DISPLAY: "PP", // e.g., "Apr 10, 2026"
  DISPLAY_TIME: "PPp", // e.g., "Apr 10, 2026, 2:30 PM"
  ISO: "yyyy-MM-dd",
  FULL: "PPPP", // e.g., "Wednesday, April 10, 2026"
} as const;

// ============================================================================
// HEALTH & WELLBEING CATEGORIES
// ============================================================================

export const HEALTH_CATEGORIES = {
  PHYSICAL: "physical",
  MENTAL_HEALTH: "mental_health",
  SUBSTANCE: "substance",
} as const;

export type HealthCategory = typeof HEALTH_CATEGORIES[keyof typeof HEALTH_CATEGORIES];

export const HEALTH_CATEGORY_LABELS: Record<HealthCategory, string> = {
  [HEALTH_CATEGORIES.PHYSICAL]: "Physical Health",
  [HEALTH_CATEGORIES.MENTAL_HEALTH]: "Mental Health",
  [HEALTH_CATEGORIES.SUBSTANCE]: "Substance Use",
};

// ============================================================================
// KEYWORK SESSION TYPES
// ============================================================================

export const SESSION_TYPES = {
  PLANNED: "Planned",
  UNPLANNED: "Unplanned",
} as const;

export type SessionType = typeof SESSION_TYPES[keyof typeof SESSION_TYPES];

// ============================================================================
// TASK ASSIGNEE TYPES
// ============================================================================

export const ASSIGNEE_TYPES = {
  STAFF_GENERAL: "STAFF_GENERAL",
  STAFF_NAMED: "STAFF_NAMED",
  YP: "YP",
  SOCIAL_WORKER: "SOCIAL_WORKER",
  PA: "PA",
} as const;

export type AssigneeType = typeof ASSIGNEE_TYPES[keyof typeof ASSIGNEE_TYPES];

export const ASSIGNEE_TYPE_LABELS: Record<AssigneeType, string> = {
  [ASSIGNEE_TYPES.STAFF_GENERAL]: "Staff (General)",
  [ASSIGNEE_TYPES.STAFF_NAMED]: "Specific Staff Member",
  [ASSIGNEE_TYPES.YP]: "Young Person",
  [ASSIGNEE_TYPES.SOCIAL_WORKER]: "Social Worker",
  [ASSIGNEE_TYPES.PA]: "Personal Advisor",
};
