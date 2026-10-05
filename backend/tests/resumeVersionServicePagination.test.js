import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../src/config/redis.js", () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    scanIterator: vi.fn(),
  },
}));

vi.mock("../src/repositories/resumeVersionRepository.js", () => ({
  createResumeVersion: vi.fn(),
  getResumeVersions: vi.fn(),
  getResumeVersionById: vi.fn(),
  getLatestResumeVersion: vi.fn(),
  updateResumeVersionContent: vi.fn(),
}));

vi.mock("../src/repositories/resumeRepository.js", () => ({
  getResumeById: vi.fn(),
}));

import redisClient from "../src/config/redis.js";

import {
  createResumeVersion,
  getResumeVersions,
  getLatestResumeVersion,
} from "../src/repositories/resumeVersionRepository.js";

import { getResumeById } from "../src/repositories/resumeRepository.js";

import {
  createUserResumeVersion,
  getUserResumeVersions,
} from "../src/services/resumeVersionService.js";

const emptyScan = () => (async function* () {})();

describe("Resume version service pagination and caching", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    redisClient.scanIterator.mockReturnValue(emptyScan());
  });

  it("verifies ownership and returns paginated versions with a page-aware cache key", async () => {
    redisClient.get.mockResolvedValue(null);

    getResumeById.mockResolvedValue({ id: "resume-1", user_id: "user-123" });

    getResumeVersions.mockResolvedValue({
      versions: [{ id: "version-3" }, { id: "version-2" }],
      total: 5,
    });

    const result = await getUserResumeVersions({
      resumeId: "resume-1",
      userId: "user-123",
      page: 2,
      limit: 2,
    });

    expect(getResumeById).toHaveBeenCalledWith({
      resumeId: "resume-1",
      userId: "user-123",
    });

    expect(getResumeVersions).toHaveBeenCalledWith({
      resumeId: "resume-1",
      userId: "user-123",
      offset: 2,
      limit: 2,
    });

    expect(result).toEqual({
      versions: [{ id: "version-3" }, { id: "version-2" }],
      pagination: { page: 2, limit: 2, total: 5, totalPages: 3 },
    });

    expect(redisClient.set).toHaveBeenCalledWith(
      "user:user-123:resume:resume-1:versions:page:2:limit:2",
      JSON.stringify(result),
      { EX: 60 }
    );
  });

  it("returns 404 when the resume does not belong to the user", async () => {
    redisClient.get.mockResolvedValue(null);

    getResumeById.mockResolvedValue(null);

    await expect(
      getUserResumeVersions({ resumeId: "resume-1", userId: "user-123" })
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "Resume not found",
    });

    expect(getResumeVersions).not.toHaveBeenCalled();
  });

  it("serves cached versions without verifying ownership again", async () => {
    const cached = {
      versions: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    };

    redisClient.get.mockResolvedValue(JSON.stringify(cached));

    const result = await getUserResumeVersions({
      resumeId: "resume-1",
      userId: "user-123",
    });

    expect(result).toEqual(cached);

    expect(getResumeById).not.toHaveBeenCalled();

    expect(getResumeVersions).not.toHaveBeenCalled();
  });

  it("increments the version number and invalidates version list caches on create", async () => {
    getResumeById.mockResolvedValue({ id: "resume-1", user_id: "user-123" });

    getLatestResumeVersion.mockResolvedValue({ version_number: 3 });

    createResumeVersion.mockResolvedValue({
      id: "version-4",
      version_number: 4,
    });

    redisClient.scanIterator.mockReturnValue(
      (async function* () {
        yield ["user:user-123:resume:resume-1:versions:page:1:limit:10"];
      })()
    );

    const version = await createUserResumeVersion({
      resumeId: "resume-1",
      userId: "user-123",
      content: { summary: "updated" },
    });

    expect(createResumeVersion).toHaveBeenCalledWith({
      resumeId: "resume-1",
      versionNumber: 4,
      content: { summary: "updated" },
    });

    expect(redisClient.scanIterator).toHaveBeenCalledWith({
      MATCH: "user:user-123:resume:resume-1:versions:page:*",
      COUNT: 100,
    });

    expect(redisClient.del).toHaveBeenCalledWith([
      "user:user-123:resume:resume-1:versions:page:1:limit:10",
    ]);

    expect(version).toEqual({ id: "version-4", version_number: 4 });
  });

  it("starts at version 1 when no versions exist yet", async () => {
    getResumeById.mockResolvedValue({ id: "resume-1", user_id: "user-123" });

    getLatestResumeVersion.mockResolvedValue(null);

    createResumeVersion.mockResolvedValue({
      id: "version-1",
      version_number: 1,
    });

    await createUserResumeVersion({
      resumeId: "resume-1",
      userId: "user-123",
      content: { summary: "first" },
    });

    expect(createResumeVersion).toHaveBeenCalledWith({
      resumeId: "resume-1",
      versionNumber: 1,
      content: { summary: "first" },
    });
  });
});
