import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../src/config/redis.js", () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    scanIterator: vi.fn(),
  },
}));

vi.mock("../src/repositories/applicationRepository.js", () => ({
  createApplication: vi.fn(),
  getApplicationById: vi.fn(),
  updateApplication: vi.fn(),
  deleteApplication: vi.fn(),
  getApplicationsByUserId: vi.fn(),
}));

import redisClient from "../src/config/redis.js";

import {
  createApplication,
  updateApplication,
  deleteApplication,
  getApplicationsByUserId,
} from "../src/repositories/applicationRepository.js";

import {
  createUserApplication,
  getUserApplications,
  updateUserApplication,
  deleteUserApplication,
} from "../src/services/applicationService.js";

const emptyScan = () => (async function* () {})();

describe("Application service pagination and caching", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    redisClient.scanIterator.mockReturnValue(emptyScan());
  });

  it("computes the offset, queries the repository and caches with a status-aware key", async () => {
    redisClient.get.mockResolvedValue(null);

    getApplicationsByUserId.mockResolvedValue({
      applications: [{ id: "app-1" }],
      total: 21,
    });

    const result = await getUserApplications("user-123", {
      page: 3,
      limit: 10,
      status: "saved",
    });

    expect(getApplicationsByUserId).toHaveBeenCalledWith({
      userId: "user-123",
      offset: 20,
      limit: 10,
      status: "saved",
    });

    expect(result).toEqual({
      applications: [{ id: "app-1" }],
      pagination: { page: 3, limit: 10, total: 21, totalPages: 3 },
    });

    expect(redisClient.set).toHaveBeenCalledWith(
      "user:user-123:applications:page:3:limit:10:status:saved",
      JSON.stringify(result),
      { EX: 60 }
    );
  });

  it("serves cached responses without touching the repository", async () => {
    const cached = {
      applications: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    };

    redisClient.get.mockResolvedValue(JSON.stringify(cached));

    const result = await getUserApplications("user-123", {
      page: 1,
      limit: 10,
    });

    expect(result).toEqual(cached);

    expect(getApplicationsByUserId).not.toHaveBeenCalled();

    expect(redisClient.set).not.toHaveBeenCalled();
  });

  it("uses distinct cache keys for distinct statuses", async () => {
    redisClient.get.mockResolvedValue(null);

    getApplicationsByUserId.mockResolvedValue({
      applications: [],
      total: 0,
    });

    await getUserApplications("user-123", {
      page: 1,
      limit: 10,
      status: "saved",
    });

    await getUserApplications("user-123", {
      page: 1,
      limit: 10,
      status: "rejected",
    });

    expect(redisClient.set).toHaveBeenNthCalledWith(
      1,
      "user:user-123:applications:page:1:limit:10:status:saved",
      expect.any(String),
      { EX: 60 }
    );

    expect(redisClient.set).toHaveBeenNthCalledWith(
      2,
      "user:user-123:applications:page:1:limit:10:status:rejected",
      expect.any(String),
      { EX: 60 }
    );
  });

  it("invalidates every application list cache key for the user on create", async () => {
    createApplication.mockResolvedValue({ id: "app-1" });

    redisClient.scanIterator.mockReturnValue(
      (async function* () {
        yield [
          "user:user-123:applications:page:1:limit:10:status:all",
          "user:user-123:applications:page:2:limit:10:status:saved",
        ];
      })()
    );

    await createUserApplication({
      userId: "user-123",
      jobId: "job-1",
      resumeId: "resume-1",
    });

    expect(redisClient.scanIterator).toHaveBeenCalledWith({
      MATCH: "user:user-123:applications:page:*",
      COUNT: 100,
    });

    expect(redisClient.del).toHaveBeenCalledWith([
      "user:user-123:applications:page:1:limit:10:status:all",
      "user:user-123:applications:page:2:limit:10:status:saved",
    ]);
  });

  it("invalidates application list cache on update", async () => {
    updateApplication.mockResolvedValue({ id: "app-1", status: "offer" });

    await updateUserApplication({
      userId: "user-123",
      applicationId: "app-1",
      status: "offer",
    });

    expect(redisClient.scanIterator).toHaveBeenCalledWith({
      MATCH: "user:user-123:applications:page:*",
      COUNT: 100,
    });
  });

  it("invalidates application list cache on delete", async () => {
    deleteApplication.mockResolvedValue({ id: "app-1" });

    await deleteUserApplication({
      userId: "user-123",
      applicationId: "app-1",
    });

    expect(redisClient.scanIterator).toHaveBeenCalledWith({
      MATCH: "user:user-123:applications:page:*",
      COUNT: 100,
    });
  });
});
