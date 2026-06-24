import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

const app = createApp();

describe("API", () => {
  it("exposes API metadata at /api", async () => {
    const response = await request(app).get("/api").expect(200);

    expect(response.body.endpoints.createJob).toBe("POST /api/jobs");
  });

  it("validates job creation payload", async () => {
    const response = await request(app)
      .post("/api/jobs")
      .send({ urls: ["not-a-url"] })
      .expect(400);

    expect(response.body.error).toBe("Validation failed");
  });

  it("creates, lists, reads and cancels a job", async () => {
    const createResponse = await request(app)
      .post("/api/jobs")
      .send({ urls: ["https://example.com"] })
      .expect(201);

    expect(createResponse.body.jobId).toEqual(expect.any(String));

    const listResponse = await request(app).get("/api/jobs").expect(200);
    expect(listResponse.body.jobs.length).toBeGreaterThan(0);

    const detailsResponse = await request(app).get(`/api/jobs/${createResponse.body.jobId}`).expect(200);
    expect(detailsResponse.body.urls).toHaveLength(1);

    const cancelResponse = await request(app).delete(`/api/jobs/${createResponse.body.jobId}`).expect(200);
    expect(cancelResponse.body.status).toBe("cancelled");
  });
});
