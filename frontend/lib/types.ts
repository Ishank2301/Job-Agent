export type ApplicationStatus =
  | "SAVED"
  | "APPLIED"
  | "ASSESSMENT"
  | "INTERVIEW"
  | "OFFER"
  | "REJECTED";

export type EmailDraftStatus =
  | "DRAFT"
  | "CONFIRMATION_REQUIRED"
  | "APPROVED"
  | "SENT"
  | "DRY_RUN"
  | "FAILED"
  | "REJECTED";

export type AutofillProvider = "greenhouse" | "lever";

export type AutofillStatus =
  | "PENDING"
  | "FILLING"
  | "CONFIRMATION_REQUIRED"
  | "CONFIRMATION_APPROVED"
  | "AWAITING_MANUAL_SUBMIT"
  | "MANUAL_SUBMIT_BLOCKED_HEADLESS"
  | "CONFIRMATION_TIMEOUT"
  | "UNSUPPORTED"
  | "FAILED";

export interface Job {
  id: string;
  external_id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  source: string;
  description?: string | null;
  salary?: string | null;
  skills: string[];
  date_posted?: string | null;
  scraped_at: string;
}

export interface Application {
  id: string;
  job_id: string;
  recruiter_id?: string | null;
  status: ApplicationStatus;
  ats_score?: number | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Recruiter {
  id: string;
  company: string;
  name?: string | null;
  email?: string | null;
  linkedin_url?: string | null;
  source?: string | null;
  created_at: string;
}

export interface PersonalData {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
}

export interface EducationEntry {
  degree: string;
  institution: string;
  dates: string;
  score?: string | null;
}

export interface ExperienceEntry {
  title: string;
  company: string;
  dates: string;
  bullets: string[];
}

export interface ProjectEntry {
  name: string;
  description: string;
  tech: string[];
  bullets: string[];
}

export interface MasterResume {
  template_id: string;
  personal: PersonalData;
  summary: string;
  skills: string[];
  education: EducationEntry[];
  experience_entries: ExperienceEntry[];
  projects: ProjectEntry[];
  achievements: string[];
}

export interface ResumeVersion {
  id: string;
  resume_id: string;
  version: number;
  content: MasterResume;
  ats_score?: number | null;
  created_at: string;
}

export interface EmailDraft {
  id: string;
  application_id: string;
  to_email: string;
  subject: string;
  body: string;
  status: EmailDraftStatus;
  dry_run: boolean;
  created_at?: string;
  sent_at?: string | null;
}

export interface AutofillSession {
  id: string;
  application_id?: string | null;
  url: string;
  provider: AutofillProvider;
  status: AutofillStatus;
  screenshot_path?: string | null;
  confirmation_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface RuntimeSettings {
  dry_run: boolean;
  max_emails_per_day: number;
}

export interface ParseabilityAudit {
  parseable: boolean;
  issues: string[];
  layout: string;
  multi_column_detected: boolean;
  tables_detected: boolean;
}

export interface ATSCheckResult {
  score: number;
  target_band: string;
  matched_keywords: string[];
  missing_keywords: string[];
  recommendations: string[];
  parseability: ParseabilityAudit;
}

export interface RecruiterFindRequest {
  company: string;
  job_title: string;
}

export interface ApplicationCreateRequest {
  job_id: string;
}

export interface ApplicationStatusUpdateRequest {
  status: ApplicationStatus;
}

export interface TailorResumeRequest {
  application_id: string;
}

export interface ATSCheckRequest {
  resume: MasterResume;
  job_description: string;
}

export interface EmailDraftCreateRequest {
  application_id: string;
}

export interface AutofillSessionCreateRequest {
  application_id?: string | null;
  url: string;
  profile: Record<string, unknown>;
  resume_path?: string | null;
}

export interface RuntimeSettingsUpdateRequest {
  dry_run?: boolean;
  max_emails_per_day?: number;
}