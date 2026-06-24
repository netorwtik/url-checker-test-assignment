import { create } from "zustand";
import * as api from "../api/client";
import type { JobDetails, JobSummary, JobStatus } from "../types/jobs";

interface JobState {
  jobs: JobSummary[];
  activeJobId?: string;
  activeJob?: JobDetails;
  listLoading: boolean;
  detailsLoading: boolean;
  creating: boolean;
  cancelling: boolean;
  error?: string;
  requestVersion: number;
  loadJobs: () => Promise<void>;
  createJob: (urls: string[]) => Promise<void>;
  selectJob: (jobId: string) => Promise<void>;
  refreshActiveJob: (jobId: string, signal?: AbortSignal) => Promise<JobDetails | undefined>;
  cancelActiveJob: () => Promise<void>;
}

export const useJobStore = create<JobState>((set, get) => ({
  jobs: [],
  listLoading: false,
  detailsLoading: false,
  creating: false,
  cancelling: false,
  requestVersion: 0,

  async loadJobs() {
    set({ listLoading: true, error: undefined });
    try {
      const jobs = await api.getJobs();
      set({ jobs });
    } catch (error) {
      set({ error: toMessage(error) });
    } finally {
      set({ listLoading: false });
    }
  },

  async createJob(urls) {
    const requestVersion = get().requestVersion + 1;
    set({ creating: true, error: undefined, requestVersion });

    try {
      const { jobId } = await api.createJob(urls);
      set({ activeJobId: jobId });
      await Promise.all([get().loadJobs(), get().refreshActiveJob(jobId)]);
    } catch (error) {
      set({ error: toMessage(error) });
    } finally {
      if (get().requestVersion === requestVersion) {
        set({ creating: false });
      }
    }
  },

  async selectJob(jobId) {
    const requestVersion = get().requestVersion + 1;
    set({ activeJobId: jobId, detailsLoading: true, error: undefined, requestVersion });
    await get().refreshActiveJob(jobId);
  },

  async refreshActiveJob(jobId, signal) {
    const state = get();
    const requestVersion = state.requestVersion;

    try {
      const details = await api.getJobDetails(jobId, signal);
      const latest = get();
      if (latest.activeJobId !== jobId || latest.requestVersion !== requestVersion) {
        return undefined;
      }

      set({ activeJob: details, detailsLoading: false, error: undefined });
      return details;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return undefined;
      }

      if (get().activeJobId === jobId && get().requestVersion === requestVersion) {
        set({ error: toMessage(error), detailsLoading: false });
      }
      return undefined;
    }
  },

  async cancelActiveJob() {
    const { activeJobId } = get();
    if (!activeJobId) return;

    set({ cancelling: true, error: undefined });
    try {
      const details = await api.cancelJob(activeJobId);
      if (get().activeJobId === activeJobId) {
        set({ activeJob: details });
      }
      await get().loadJobs();
    } catch (error) {
      set({ error: toMessage(error) });
    } finally {
      set({ cancelling: false });
    }
  }
}));

export function isTerminalStatus(status: JobStatus): boolean {
  return status === "completed" || status === "cancelled" || status === "failed";
}

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unexpected error";
}
