"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createApplication, getJob, listResumes, updateJob } from "@/lib/resources";
import JobForm from "@/components/JobForm";
import { formatDate } from "@/lib/format";
import { Alert, Button, Card, Field, inputClass, PageHeader } from "@/components/ui";

export default function JobDetailPage() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [resumeId, setResumeId] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadJob = useCallback(async () => {
    try {
      const [jobResponse, resumeResponse] = await Promise.all([
        getJob(id),
        listResumes({ page: 1, limit: 100 }),
      ]);
      setJob(jobResponse.job || null);
      const availableResumes = Array.isArray(resumeResponse.resumes) ? resumeResponse.resumes : [];
      setResumes(availableResumes);
      setResumeId((current) => availableResumes.some((resume) => resume.id === current) ? current : availableResumes[0]?.id || "");
      setError("");
    } catch (requestError) {
      setError(requestError.message || "This job couldn’t be loaded.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [jobResponse, resumeResponse] = await Promise.all([
          getJob(id),
          listResumes({ page: 1, limit: 100 }),
        ]);
        if (!active) return;
        setJob(jobResponse.job || null);
        const availableResumes = Array.isArray(resumeResponse.resumes) ? resumeResponse.resumes : [];
        setResumes(availableResumes);
        setResumeId(availableResumes[0]?.id || "");
        setError("");
      } catch (requestError) {
        if (active) setError(requestError.message || "This job couldn’t be loaded.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [id]);

  const handleUpdate = async (payload) => {
    setSaving(true);
    setError("");
    try {
      const response = await updateJob(id, payload);
      setJob(response.job || { ...job, title: payload.title, company_name: payload.companyName, description: payload.description, job_url: payload.jobUrl });
      setEditing(false);
      setNotice("Job details updated.");
    } catch (requestError) {
      setError(requestError.message || "Job details couldn’t be saved.");
    } finally {
      setSaving(false);
    }
  };

  const handleApplication = async (event) => {
    event.preventDefault();
    if (!resumeId) return;
    setApplying(true);
    setError("");
    setNotice("");
    try {
      await createApplication({ jobId: id, resumeId, status: "saved" });
      setNotice("Application created. You can track it from Applications.");
    } catch (requestError) {
      setError(requestError.message || "Application couldn’t be created.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="h-80 animate-pulse rounded-2xl bg-white" aria-label="Loading job" />;

  return (
    <div className="space-y-6">
      <Link href="/dashboard/jobs" className="text-sm font-medium text-warm-600 hover:text-burgundy-800">← All jobs</Link>
      {error ? <Alert>{error} <button type="button" className="ml-1 font-semibold underline" onClick={loadJob}>Retry</button></Alert> : null}
      {notice ? <Alert tone="success">{notice}</Alert> : null}
      {!job ? <Alert>This job is unavailable or was removed.</Alert> : (
        <>
          <PageHeader
            eyebrow={job.company_name || "Saved opportunity"}
            title={job.title}
            description={`Saved ${formatDate(job.created_at)}`}
            action={<Button variant="secondary" onClick={() => setEditing((current) => !current)}>{editing ? "Close editor" : "Edit job"}</Button>}
          />
          {editing ? (
            <Card>
              <JobForm initialJob={job} onSubmit={handleUpdate} onCancel={() => setEditing(false)} saving={saving} submitLabel="Save changes" />
            </Card>
          ) : null}
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <Card>
              <h2 className="mb-4 text-base font-semibold text-warm-950">Job description</h2>
              <p className="whitespace-pre-wrap text-sm leading-7 text-warm-700">{job.description}</p>
              {job.job_url ? (
                <a className="mt-5 inline-block text-sm font-medium text-burgundy-800 underline" href={job.job_url} target="_blank" rel="noreferrer">
                  Open original listing
                </a>
              ) : null}
            </Card>
            <Card className="h-fit">
              <h2 className="text-base font-semibold text-warm-950">Start an application</h2>
              <p className="mt-1 text-sm text-warm-500">Choose a resume to track this opportunity.</p>
              {resumes.length ? (
                <form className="mt-4 space-y-4" onSubmit={handleApplication}>
                  <Field label="Resume">
                    <select className={inputClass} value={resumeId} onChange={(event) => setResumeId(event.target.value)} required>
                      {resumes.map((resume) => <option key={resume.id} value={resume.id}>{resume.title}</option>)}
                    </select>
                  </Field>
                  <Button type="submit" disabled={applying || !resumeId}>{applying ? "Creating…" : "Create application"}</Button>
                </form>
              ) : (
                <p className="mt-4 text-sm text-warm-600">
                  Create a resume first from <Link className="font-medium text-burgundy-800 underline" href="/dashboard/resumes">Resumes</Link>.
                </p>
              )}
              <div className="mt-5 border-t border-warm-100 pt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-warm-500">AI tools</p>
                <div className="flex flex-col gap-2 text-sm">
                  <Link className="text-burgundy-800 hover:underline" href="/dashboard/ai/analyze">Analyze resume match</Link>
                  <Link className="text-burgundy-800 hover:underline" href="/dashboard/ai/tailor">Tailor a resume</Link>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
