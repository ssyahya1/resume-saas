import api, { uploadFile } from "./api";

const queryString = (params = {}) => {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    search.set(key, String(value));
  });

  const serialized = search.toString();
  return serialized ? `?${serialized}` : "";
};

export const getWorkspaceOptions = () => api("/api/workspace/options");

export const listResumes = ({ page = 1, limit = 10 } = {}) =>
  api(`/api/resume${queryString({ page, limit })}`);

export const getResume = (id) => api(`/api/resume/${id}`);

export const createResume = (title) =>
  api("/api/resume", {
    method: "POST",
    body: JSON.stringify({ title }),
  });

export const updateResume = (id, title) =>
  api(`/api/resume/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ title }),
  });

export const deleteResume = (id) =>
  api(`/api/resume/${id}`, {
    method: "DELETE",
  });

export const uploadResume = ({ title, file }) => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("resume", file);
  return uploadFile("/api/resume/upload", formData);
};

export const listVersions = (resumeId, { page = 1, limit = 10 } = {}) =>
  api(`/api/resume/${resumeId}/versions${queryString({ page, limit })}`);

export const getVersion = (resumeId, versionId) =>
  api(`/api/resume/${resumeId}/versions/${versionId}`);

export const createVersion = (resumeId, content) =>
  api(`/api/resume/${resumeId}/versions`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });

export const structureResume = (resumeId, versionId) =>
  api(`/api/resume/${resumeId}/versions/${versionId}/structure`, {
    method: "POST",
  });

export const listJobs = ({ page = 1, limit = 10 } = {}) =>
  api(`/api/jobs${queryString({ page, limit })}`);

export const getJob = (id) => api(`/api/jobs/${id}`);

export const createJob = (payload) =>
  api("/api/jobs", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateJob = (id, payload) =>
  api(`/api/jobs/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deleteJob = (id) =>
  api(`/api/jobs/${id}`, {
    method: "DELETE",
  });

export const listApplications = ({ page = 1, limit = 10, status } = {}) =>
  api(`/api/applications${queryString({ page, limit, status })}`);

export const getApplication = (id) => api(`/api/applications/${id}`);

export const createApplication = (payload) =>
  api("/api/applications", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateApplication = (id, payload) =>
  api(`/api/applications/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deleteApplication = (id) =>
  api(`/api/applications/${id}`, {
    method: "DELETE",
  });

export const listAnalyses = () => api("/api/ai-analyses");

export const listAnalysisSummary = () => api("/api/ai-analyses/summary");

export const getAnalysis = (id) => api(`/api/ai-analyses/${id}`);

export const queueAnalysis = (applicationId, idempotencyKey) =>
  api("/api/ai-analyses", {
    method: "POST",
    headers: {
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({ applicationId }),
  });

export const getAnalysisJob = (jobId) =>
  api(`/api/ai-analyses/jobs/${jobId}`);

export const queueTailoring = (payload, idempotencyKey) =>
  api("/api/resume/tailor", {
    method: "POST",
    headers: {
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(payload),
  });

export const getTailoringJob = (jobId) =>
  api(`/api/resume/tailor/jobs/${jobId}`);

export const queueCoverLetter = (payload, idempotencyKey) =>
  api("/api/cover-letters", {
    method: "POST",
    headers: {
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(payload),
  });

export const getCoverLetterJob = (jobId) =>
  api(`/api/cover-letters/jobs/${jobId}`);

export const queueInterviewQuestions = (payload, idempotencyKey) =>
  api("/api/interview-questions", {
    method: "POST",
    headers: {
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(payload),
  });

export const getInterviewJob = (jobId) =>
  api(`/api/interview-questions/jobs/${jobId}`);

export const getInterviewQuestions = (applicationId) =>
  api(`/api/interview-questions/${applicationId}`);
