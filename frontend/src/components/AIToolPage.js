"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getAnalysisJob,
  getCoverLetterJob,
  getInterviewJob,
  getTailoringJob,
  listApplications,
  listJobs,
  listResumes,
  listVersions,
  queueAnalysis,
  queueCoverLetter,
  queueInterviewQuestions,
  queueTailoring,
} from "@/lib/resources";
import { createIdempotencyKey } from "@/lib/format";
import { Alert, Button, Card, Field, inputClass, PageHeader } from "./ui";
import AIJobStatus from "./AIJobStatus";

const TOOLS = {
  analyze: {
    title: "Resume and job analysis",
    description: "Review the fit between the resume and job linked to one of your applications.",
    eventType: "ai-analysis",
    statusEndpoint: getAnalysisJob,
    submitLabel: "Analyze application",
  },
  tailor: {
    title: "Resume tailoring",
    description: "Create a new resume version that emphasizes relevant experience for a saved job.",
    eventType: "resume-tailoring",
    statusEndpoint: getTailoringJob,
    submitLabel: "Tailor resume",
  },
  "cover-letter": {
    title: "Cover letter",
    description: "Generate a job-specific letter using the resume attached to your application.",
    eventType: "cover-letter",
    statusEndpoint: getCoverLetterJob,
    submitLabel: "Generate cover letter",
  },
  interview: {
    title: "Interview questions",
    description: "Prepare with questions based on your resume and the role you’re applying for.",
    eventType: "interview-question",
    statusEndpoint: getInterviewJob,
    submitLabel: "Generate questions",
  },
};

const extractLists = (results) => {
  const errors = results.filter((result) => result.status === "rejected");
  return {
    applications: results[0].status === "fulfilled" && Array.isArray(results[0].value.applications) ? results[0].value.applications : [],
    jobs: results[1].status === "fulfilled" && Array.isArray(results[1].value.jobs) ? results[1].value.jobs : [],
    resumes: results[2].status === "fulfilled" && Array.isArray(results[2].value.resumes) ? results[2].value.resumes : [],
    errors: errors.length,
  };
};

export default function AIToolPage({ mode }) {
  const tool = TOOLS[mode];
  const aiLinks = [
    ["analyze", "Resume match"],
    ["tailor", "Tailor resume"],
    ["cover-letter", "Cover letter"],
    ["interview", "Interview prep"],
  ];
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [versionData, setVersionData] = useState(null);
  const [applicationId, setApplicationId] = useState("");
  const [resumeId, setResumeId] = useState("");
  const [versionId, setVersionId] = useState("");
  const [jobId, setJobId] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState("");
  const [requestError, setRequestError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [job, setJob] = useState(null);

  const loadOptions = useCallback(async () => {
    const results = await Promise.allSettled([
      listApplications({ page: 1, limit: 100 }),
      listJobs({ page: 1, limit: 100 }),
      listResumes({ page: 1, limit: 100 }),
    ]);
    const lists = extractLists(results);
    setApplications(lists.applications);
    setJobs(lists.jobs);
    setResumes(lists.resumes);
    if (lists.errors === 3) {
      setLoadingError("We couldn’t load your application, job, or resume options. Check your connection and try again.");
    } else if (lists.errors) {
      setLoadingError("Some selection options are unavailable. Refresh to load them before continuing.");
    } else {
      setLoadingError("");
    }
    setApplicationId((current) => lists.applications.some((item) => item.id === current) ? current : lists.applications[0]?.id || "");
    setResumeId((current) => lists.resumes.some((item) => item.id === current) ? current : lists.resumes[0]?.id || "");
    setJobId((current) => lists.jobs.some((item) => item.id === current) ? current : lists.jobs[0]?.id || "");
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const results = await Promise.allSettled([
        listApplications({ page: 1, limit: 100 }),
        listJobs({ page: 1, limit: 100 }),
        listResumes({ page: 1, limit: 100 }),
      ]);
      if (!active) return;
      const lists = extractLists(results);
      setApplications(lists.applications);
      setJobs(lists.jobs);
      setResumes(lists.resumes);
      if (lists.errors === 3) {
        setLoadingError("We couldn’t load your application, job, or resume options. Check your connection and try again.");
      } else if (lists.errors) {
        setLoadingError("Some selection options are unavailable. Refresh to load them before continuing.");
      }
      setApplicationId(lists.applications[0]?.id || "");
      setResumeId(lists.resumes[0]?.id || "");
      setJobId(lists.jobs[0]?.id || "");
      setLoading(false);
    };
    load();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (mode !== "tailor" || !resumeId) return undefined;
    let active = true;
    const load = async () => {
      try {
        const response = await listVersions(resumeId, { page: 1, limit: 100 });
        if (!active) return;
        const availableVersions = Array.isArray(response.versions) ? response.versions : [];
        setVersionData({ resumeId, versions: availableVersions });
        setVersionId(availableVersions[0]?.id || "");
      } catch (error) {
        if (active) {
          setLoadingError(error.message || "Resume versions couldn’t be loaded.");
        }
      }
    };
    load();
    return () => { active = false; };
  }, [mode, resumeId]);

  const versions = versionData?.resumeId === resumeId ? versionData.versions : [];
  const loadingVersions = mode === "tailor" && Boolean(resumeId) && versionData?.resumeId !== resumeId;
  const applicationOptions = useMemo(() => applications.map((application) => {
    const jobRecord = jobs.find((item) => item.id === application.job_id);
    return {
      id: application.id,
      label: jobRecord
        ? `${jobRecord.title}${jobRecord.company_name ? ` · ${jobRecord.company_name}` : ""}`
        : "Application",
    };
  }), [applications, jobs]);

  const requirementsMet = mode === "analyze"
    ? Boolean(applicationId)
    : mode === "tailor"
      ? Boolean(resumeId && versionId && jobId)
      : Boolean(applicationId && resumeId);
  const handleJobStatus = useCallback((status) => {
    setJob((current) => current ? { ...current, status } : current);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!requirementsMet || submitting || (job && !["completed", "failed"].includes(job.status))) return;
    setSubmitting(true);
    setRequestError("");
    setJob(null);
    try {
      const key = createIdempotencyKey();
      let response;
      if (mode === "analyze") {
        response = await queueAnalysis(applicationId, key);
      } else if (mode === "tailor") {
        response = await queueTailoring({ resumeId, versionId, jobId }, key);
      } else if (mode === "cover-letter") {
        response = await queueCoverLetter({ applicationId, resumeId }, key);
      } else {
        response = await queueInterviewQuestions({ applicationId, resumeId }, key);
      }
      const queuedJob = response.job || response.aiAnalysis || response;
      if (!queuedJob.jobId) {
        throw new Error("The server did not return a job status identifier.");
      }
      setJob({ jobId: queuedJob.jobId, status: queuedJob.status || "queued" });
    } catch (error) {
      setRequestError(error.message || "Your request couldn’t be submitted. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4" aria-label="Loading AI tool options">
        <div className="h-20 animate-pulse rounded-2xl bg-white" />
        <div className="h-64 animate-pulse rounded-2xl bg-white" />
      </div>
    );
  }

  const noApplicationsNeeded = mode === "tailor" ? false : applicationOptions.length === 0;
  const noResumesNeeded = mode === "analyze" ? false : resumes.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="AI tools" title={tool.title} description={tool.description} />
      <nav aria-label="AI tools" className="flex flex-wrap gap-2">
        {aiLinks.map(([key, label]) => (
          <Link
            key={key}
            href={`/dashboard/ai/${key}`}
            className={`rounded-xl border px-3 py-2 text-sm font-medium ${
              mode === key
                ? "border-burgundy-600 bg-burgundy-600 text-white"
                : "border-warm-200 bg-white text-warm-700 hover:border-burgundy-200 hover:text-burgundy-900"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
      {loadingError ? <Alert>{loadingError} <button type="button" className="ml-1 font-semibold underline" onClick={loadOptions}>Refresh options</button></Alert> : null}
      {requestError ? <Alert>{requestError}</Alert> : null}

      {!job || ["completed", "failed"].includes(job.status) ? (
        <Card>
          <form className="space-y-5" onSubmit={handleSubmit}>
            {noApplicationsNeeded ? (
              <div className="rounded-xl bg-warm-50 p-4 text-sm text-warm-700">
                {mode === "tailor"
                  ? "Save at least one job before tailoring a resume."
                  : "Create an application before using this tool."}
              </div>
            ) : null}
            {noResumesNeeded ? (
              <div className="rounded-xl bg-warm-50 p-4 text-sm text-warm-700">
                Create a resume before using this tool.{" "}
                <Link href="/dashboard/resumes" className="font-medium text-burgundy-800 underline">Go to resumes</Link>
              </div>
            ) : null}

            {mode !== "tailor" && applicationOptions.length ? (
              <Field label="Application">
                <select className={inputClass} value={applicationId} onChange={(event) => setApplicationId(event.target.value)} required>
                  {applicationOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </Field>
            ) : null}
            {mode !== "analyze" && resumes.length ? (
              <Field label="Resume">
                <select className={inputClass} value={resumeId} onChange={(event) => setResumeId(event.target.value)} required>
                  {resumes.map((resume) => <option key={resume.id} value={resume.id}>{resume.title}</option>)}
                </select>
              </Field>
            ) : null}
            {mode === "tailor" && versions.length ? (
              <Field label="Resume version">
                <select className={inputClass} value={versionId} onChange={(event) => setVersionId(event.target.value)} required>
                  {versions.map((version) => <option key={version.id} value={version.id}>Version {version.version_number ?? "—"}</option>)}
                </select>
                <p className="mt-1 text-xs text-warm-500">Tailoring requires structured resume content. If the request is rejected, open the resume and structure its uploaded text first.</p>
              </Field>
            ) : null}
            {mode === "tailor" && jobs.length ? (
              <Field label="Job opportunity">
                <select className={inputClass} value={jobId} onChange={(event) => setJobId(event.target.value)} required>
                  {jobs.map((item) => <option key={item.id} value={item.id}>{item.title}{item.company_name ? ` · ${item.company_name}` : ""}</option>)}
                </select>
              </Field>
            ) : null}

            {mode === "tailor" && !jobs.length ? (
              <div className="rounded-xl bg-warm-50 p-4 text-sm text-warm-700">
                Save a job first from <Link href="/dashboard/jobs" className="font-medium text-burgundy-800 underline">Jobs</Link>.
              </div>
            ) : null}
            {mode === "tailor" && resumeId && !loadingVersions && !versions.length ? (
              <div className="rounded-xl bg-warm-50 p-4 text-sm text-warm-700">
                This resume has no versions yet. Open the resume and add content before tailoring.
              </div>
            ) : null}

            <Button type="submit" disabled={!requirementsMet || submitting || loadingVersions || Boolean(loadingError)}>
              {submitting ? "Starting…" : tool.submitLabel}
            </Button>
            <p className="text-xs text-warm-500">You can keep using your workspace while we prepare your result.</p>
          </form>
        </Card>
      ) : null}
      {job ? <AIJobStatus key={job.jobId} job={job} statusEndpoint={tool.statusEndpoint} eventType={tool.eventType} toolLabel={tool.title} onStatusChange={handleJobStatus} /> : null}
    </div>
  );
}
