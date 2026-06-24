import type { Job, UrlCheck } from "./types.js";

const CONCURRENCY_PER_JOB = 5;
const HEAD_TIMEOUT_MS = 12_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const randomDelayMs = () => Math.floor(Math.random() * 10_001);

export function startJobProcessing(job: Job): void {
  setImmediate(() => {
    void processJob(job);
  });
}

export function cancelJob(job: Job): Job {
  if (isTerminalJob(job.status)) {
    return job;
  }

  job.status = "cancelled";
  for (const item of job.urls) {
    if (item.status === "pending") {
      item.status = "cancelled";
      item.finishedAt = new Date().toISOString();
    }
  }

  return job;
}

async function processJob(job: Job): Promise<void> {
  job.status = "in_progress";

  let cursor = 0;

  async function worker(): Promise<void> {
    while (job.status !== "cancelled") {
      const currentIndex = cursor;
      cursor += 1;

      const item = job.urls[currentIndex];
      if (!item) return;
      if (item.status !== "pending") continue;

      await processUrl(job, item);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY_PER_JOB, job.urls.length) }, () => worker())
  );

  finalizeJob(job);
}

async function processUrl(job: Job, item: UrlCheck): Promise<void> {
  if (job.status === "cancelled") {
    markCancelled(item);
    return;
  }

  const startedAt = Date.now();
  item.status = "in_progress";
  item.startedAt = new Date(startedAt).toISOString();

  try {
    const response = await head(item.url);
    await sleep(randomDelayMs());

    if (isJobCancelled(job)) {
      markCancelled(item, startedAt);
      return;
    }

    item.status = response.ok ? "success" : "error";
    item.httpStatus = response.status;
    if (!response.ok) {
      item.error = `HTTP ${response.status} ${response.statusText}`.trim();
    }
  } catch (error) {
    await sleep(randomDelayMs());

    if (isJobCancelled(job)) {
      markCancelled(item, startedAt);
      return;
    }

    item.status = "error";
    item.error = error instanceof Error ? error.message : "Unknown error";
  } finally {
    if (!isItemCancelled(item)) {
      finishItem(item, startedAt);
    }
  }
}

async function head(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HEAD_TIMEOUT_MS);

  try {
    return await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

function finalizeJob(job: Job): void {
  if (job.status === "cancelled") {
    for (const item of job.urls) {
      if (item.status === "pending") markCancelled(item);
    }
    return;
  }

  const hasUnfinished = job.urls.some((item) => item.status === "pending" || item.status === "in_progress");

  job.status = hasUnfinished ? "failed" : "completed";
}

function markCancelled(item: UrlCheck, startedAt?: number): void {
  item.status = "cancelled";
  item.finishedAt = new Date().toISOString();
  if (startedAt) {
    item.durationMs = Date.now() - startedAt;
  }
}

function finishItem(item: UrlCheck, startedAt: number): void {
  item.finishedAt = new Date().toISOString();
  item.durationMs = Date.now() - startedAt;
}

function isTerminalJob(status: Job["status"]): boolean {
  return status === "completed" || status === "cancelled" || status === "failed";
}

function isJobCancelled(job: Job): boolean {
  return job.status === "cancelled";
}

function isItemCancelled(item: UrlCheck): boolean {
  return item.status === "cancelled";
}
