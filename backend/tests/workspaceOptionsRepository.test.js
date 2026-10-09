import { beforeEach, describe, expect, it, vi } from "vitest";

const { supabaseAdmin } = vi.hoisted(() => ({
  supabaseAdmin: { from: vi.fn() },
}));

vi.mock("../src/config/supabase.js", () => ({ supabaseAdmin }));

import { getAIAnalysisSummaryByUserId } from "../src/repositories/aiAnalysisRepository.js";
import { getWorkspaceOptionsByUserId } from "../src/repositories/workspaceOptionsRepository.js";

const makeQuery = (result) => {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  };

  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.order.mockReturnValue(query);
  query.limit.mockReturnValue(query);

  return query;
};

describe("bounded dashboard and workspace queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns five projected analyses and the exact total", async () => {
    const analyses = [{ id: "analysis-1", match_score: 82, created_at: "2026-10-08" }];
    const query = makeQuery({ data: analyses, count: 14, error: null });
    supabaseAdmin.from.mockReturnValue(query);

    const result = await getAIAnalysisSummaryByUserId("user-123");

    expect(result).toEqual({ analyses, total: 14 });
    expect(supabaseAdmin.from).toHaveBeenCalledWith("ai_analyses");
    expect(query.select).toHaveBeenCalledWith(
      "id, match_score, created_at",
      { count: "exact" }
    );
    expect(query.eq).toHaveBeenCalledWith("user_id", "user-123");
    expect(query.order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(query.limit).toHaveBeenCalledWith(5);
  });

  it("returns only bounded picker columns for each collection", async () => {
    const results = {
      applications: [{ id: "application-1", job_id: "job-1" }],
      jobs: [{ id: "job-1", title: "Designer", company_name: "Applyroom" }],
      resumes: [{ id: "resume-1", title: "Product resume" }],
      unavailable: [],
    };
    const queries = {
      applications: makeQuery({ data: results.applications, error: null }),
      jobs: makeQuery({ data: results.jobs, error: null }),
      resumes: makeQuery({ data: results.resumes, error: null }),
    };
    supabaseAdmin.from.mockImplementation((table) => queries[table]);

    const options = await getWorkspaceOptionsByUserId("user-123");

    expect(options).toEqual(results);
    expect(supabaseAdmin.from.mock.calls).toEqual([
      ["applications"],
      ["jobs"],
      ["resumes"],
    ]);
    expect(queries.applications.select).toHaveBeenCalledWith("id, job_id");
    expect(queries.jobs.select).toHaveBeenCalledWith("id, title, company_name");
    expect(queries.resumes.select).toHaveBeenCalledWith("id, title");
    for (const query of Object.values(queries)) {
      expect(query.eq).toHaveBeenCalledWith("user_id", "user-123");
      expect(query.limit).toHaveBeenCalledWith(100);
    }
  });

  it("returns available option groups when one query fails", async () => {
    const queries = {
      applications: makeQuery({
        data: null,
        error: { name: "PostgrestError", code: "TEST_ERROR" },
      }),
      jobs: makeQuery({
        data: [{ id: "job-1", title: "Designer", company_name: "Applyroom" }],
        error: null,
      }),
      resumes: makeQuery({
        data: [{ id: "resume-1", title: "Product resume" }],
        error: null,
      }),
    };
    supabaseAdmin.from.mockImplementation((table) => queries[table]);

    const options = await getWorkspaceOptionsByUserId("user-123");

    expect(options).toEqual({
      applications: [],
      jobs: [{ id: "job-1", title: "Designer", company_name: "Applyroom" }],
      resumes: [{ id: "resume-1", title: "Product resume" }],
      unavailable: ["applications"],
    });
  });
});
