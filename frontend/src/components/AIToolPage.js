"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getAnalysisJob,
  getCoverLetterJob,
  getInterviewJob,
  getTailoringJob,
  getWorkspaceOptions,
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
    try {
      const options = await getWorkspaceOptions();
      const availableApplications = Array.isArray(options.applications) ? options.applications : [];
      const availableJobs = Array.isArray(options.jobs) ? options.jobs : [];
      const availableResumes = Array.isArray(options.resumes) ? options.resumes : [];

      setApplications(availableApplications);
      setJobs(availableJobs);
      setResumes(availableResumes);
      setApplicationId((current) => availableApplications.some((item) => item.id === current) ? current : availableApplications[0]?.id || "");
      setResumeId((current) => availableResumes.some((item) => item.id === current) ? current : availableResumes[0]?.id || "");
      setJobId((current) => availableJobs.some((item) => item.id === current) ? current : availableJobs[0]?.id || "");
      if (options.unavailable?.length === 3) {
        setLoadingError("We couldn’t load your application, job, or resume options. Check your connection and try again.");
      } else if (options.unavailable?.length) {
        setLoadingError("Some selection options are unavailable. Refresh to load them before continuing.");
      } else {
        setLoadingError("");
      }
    } catch (error) {
      setLoadingError(error.message || "Workspace options couldn’t be loaded. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await loadOptions();
    };
    load();
  }, [loadOptions]);

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
