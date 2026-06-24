export type JobStatus = "pending" | "in_progress" | "completed" | "cancelled" | "failed";

export type UrlCheckStatus = "pending" | "in_progress" | "success" | "error" | "cancelled";

export interface JobStats {
  success: number;
  error: number;
  pending: number;
  inProgress: number;
  cancelled: number;
}

export interface JobSummary {
  id: string;
  createdAt: string;
  status: JobStatus;
  total: number;
  stats: JobStats;
}

export interface UrlCheck {
  id: string;
  url: string;
  status: UrlCheckStatus;
  httpStatus?: number;
  error?: string;
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
}

export interface JobDetails {
  id: string;
  createdAt: string;
  status: JobStatus;
  urls: UrlCheck[];
}
