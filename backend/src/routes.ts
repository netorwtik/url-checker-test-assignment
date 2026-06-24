import { Router } from "express";
import { z } from "zod";
import { cancelJob, startJobProcessing } from "./jobProcessor.js";
import { createJob, getJob, listJobs } from "./jobStore.js";

const createJobSchema = z.object({
  urls: z
    .array(z.string().url())
    .min(1, "At least one URL is required")
    .max(100, "No more than 100 URLs per job")
});

export const apiRouter = Router();

apiRouter.get("/", (_req, res) => {
  return res.json({
    name: "URL Checker API",
    endpoints: {
      createJob: "POST /api/jobs",
      listJobs: "GET /api/jobs",
      getJob: "GET /api/jobs/:id",
      cancelJob: "DELETE /api/jobs/:id"
    }
  });
});

apiRouter.post("/jobs", (req, res) => {
  const parsed = createJobSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten()
    });
  }

  const uniqueUrls = [...new Set(parsed.data.urls)];
  const job = createJob(uniqueUrls);
  startJobProcessing(job);

  return res.status(201).json({ jobId: job.id });
});

apiRouter.get("/jobs", (_req, res) => {
  return res.json({ jobs: listJobs() });
});

apiRouter.get("/jobs/:id", (req, res) => {
  const job = getJob(req.params.id);
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  return res.json(job);
});

apiRouter.delete("/jobs/:id", (req, res) => {
  const job = getJob(req.params.id);
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  return res.json(cancelJob(job));
});
