import type { JobDetails, JobSummary } from "../types/jobs";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

interface JobsResponse {
  jobs: JobSummary[];
}

interface CreateJobResponse {
  jobId: string;
}

export async function createJob(urls: string[]): Promise<CreateJobResponse> {
  return request<CreateJobResponse>("/api/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ urls })
  });
}

export async function getJobs(): Promise<JobSummary[]> {
  const response = await request<JobsResponse>("/api/jobs");
  return response.jobs;
}

export async function getJobDetails(jobId: string, signal?: AbortSignal): Promise<JobDetails> {
  return request<JobDetails>(`/api/jobs/${jobId}`, { signal });
}

export async function cancelJob(jobId: string): Promise<JobDetails> {
  return request<JobDetails>(`/api/jobs/${jobId}`, { method: "DELETE" });
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "error" in payload
        ? String(payload.error)
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}
