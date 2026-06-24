import { nanoid } from "nanoid";
import type { Job, JobSummary, UrlCheck } from "./types.js";

const jobs = new Map<string, Job>();

export function createJob(urls: string[]): Job {
  const job: Job = {
    id: nanoid(),
    createdAt: new Date().toISOString(),
    status: "pending",
    urls: urls.map<UrlCheck>((url) => ({
      id: nanoid(),
      url,
      status: "pending"
    }))
  };

  jobs.set(job.id, job);
  return job;
}

export function getJob(id: string): Job | undefined {
  return jobs.get(id);
}

export function listJobs(): JobSummary[] {
  return [...jobs.values()]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(toJobSummary);
}

export function toJobSummary(job: Job): JobSummary {
  const stats = {
    success: 0,
    error: 0,
    pending: 0,
    inProgress: 0,
    cancelled: 0
  };

  for (const item of job.urls) {
    if (item.status === "success") stats.success += 1;
    if (item.status === "error") stats.error += 1;
    if (item.status === "pending") stats.pending += 1;
    if (item.status === "in_progress") stats.inProgress += 1;
    if (item.status === "cancelled") stats.cancelled += 1;
  }

  return {
    id: job.id,
    createdAt: job.createdAt,
    status: job.status,
    total: job.urls.length,
    stats
  };
}
