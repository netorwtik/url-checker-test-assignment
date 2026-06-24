export type JobStatus = "pending" | "in_progress" | "completed" | "cancelled" | "failed";

export type UrlCheckStatus = "pending" | "in_progress" | "success" | "error" | "cancelled";

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

export interface Job {
  id: string;
  createdAt: string;
  status: JobStatus;
  urls: UrlCheck[];
}

export interface JobSummary {
  id: string;
  createdAt: string;
  status: JobStatus;
  total: number;
  stats: {
    success: number;
    error: number;
    pending: number;
    inProgress: number;
    cancelled: number;
  };
}
