"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { deleteApplication, getApplication, getJob, getResume, updateApplication } from "@/lib/resources";
import { APPLICATION_STATUSES, formatDate, titleCase } from "@/lib/format";
import { Alert, Button, Card, ConfirmDialog, Field, inputClass, PageHeader, StatusBadge } from "@/components/ui";

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [application, setApplication] = useState(null);
  const [job, setJob] = useState(null);
  const [resume, setResume] = useState(null);
  const [status, setStatus] = useState("saved");
  const [appliedAt, setAppliedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

  const loadDetails = useCallback(async () => {
    try {
      const response = await getApplication(id);
      if (!response.application) throw new Error("Application details were not returned.");
      const record = response.application;
      setApplication(record);
      setStatus(record.status || "saved");
      setAppliedAt(record.applied_at ? new Date(record.applied_at).toISOString().slice(0, 10) : "");
      const [jobResponse, resumeResponse] = await Promise.all([
        record.job_id ? getJob(record.job_id).catch(() => ({ job: null })) : Promise.resolve({ job: null }),
        record.resume_id ? getResume(record.resume_id).catch(() => ({ resume: null })) : Promise.resolve({ resume: null }),
      ]);
      setJob(jobResponse.job || null);
      setResume(resumeResponse.resume || null);
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Application couldn’t be loaded.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await getApplication(id);
        if (!active) return;
        if (!response.application) throw new Error("Application details were not returned.");
        const record = response.application;
        setApplication(record);
        setStatus(record.status || "saved");
        setAppliedAt(record.applied_at ? new Date(record.applied_at).toISOString().slice(0, 10) : "");
        const [jobResponse, resumeResponse] = await Promise.all([
          record.job_id ? getJob(record.job_id).catch(() => ({ job: null })) : Promise.resolve({ job: null }),
          record.resume_id ? getResume(record.resume_id).catch(() => ({ resume: null })) : Promise.resolve({ resume: null }),
        ]);
        if (!active) return;
        setJob(jobResponse.job || null);
        setResume(resumeResponse.resume || null);
        setError("");
      } catch (requestError) {
        if (active) setError(requestError.message || "Application couldn’t be loaded.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [id]);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const payload = { status };
      if (appliedAt) payload.appliedAt = new Date(`${appliedAt}T00:00:00.000Z`).toISOString();
      const response = await updateApplication(id, payload);
      setApplication(response.application || { ...application, ...payload });
      setNotice("Application updated.");
    } catch (requestError) {
      setError(requestError.message || "Application couldn’t be updated.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    setError("");
    try {
      await deleteApplication(id);
      setDeleteConfirmationOpen(false);
      router.replace("/dashboard/applications");
    } catch (requestError) {
      setError(requestError.message || "Application couldn’t be deleted.");
      setDeleting(false);
      setDeleteConfirmationOpen(false);
    }
  };

  if (loading) return <div className="h-72 animate-pulse rounded-2xl bg-white" aria-label="Loading application" />;

  return (
    <div className="space-y-6">
      <Link href="/dashboard/applications" className="text-sm font-medium text-warm-600 hover:text-burgundy-800">← All applications</Link>
      {error ? <Alert>{error} <button type="button" className="ml-1 font-semibold underline" onClick={loadDetails}>Retry</button></Alert> : null}
      {notice ? <Alert tone="success">{notice}</Alert> : null}
      {!application ? <Alert>This application is unavailable or has been removed.</Alert> : (
        <>
          <PageHeader
            eyebrow={job?.company_name || "Application"}
            title={job?.title || "Job application"}
            description={`Created ${formatDate(application.created_at)}`}
            action={<StatusBadge status={application.status} />}
          />
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
            <Card>
              <h2 className="mb-4 text-base font-semibold text-warm-950">Opportunity</h2>
              {job ? (
                <div className="space-y-3">
                  <p className="text-sm text-warm-600">{job.company_name || "Company not specified"}</p>
                  <p className="whitespace-pre-wrap text-sm leading-7 text-warm-700">{job.description}</p>
                  {job.job_url ? <a href={job.job_url} target="_blank" rel="noreferrer" className="text-sm font-medium text-burgundy-800 underline">Open original listing</a> : null}
                </div>
              ) : <p className="text-sm text-warm-500">The related job is no longer available.</p>}
              <div className="mt-6 border-t border-warm-100 pt-4">
                <h3 className="text-sm font-semibold text-warm-900">Resume used</h3>
                {resume ? (
                  <Link href={`/dashboard/resumes/${resume.id}`} className="mt-2 inline-block text-sm font-medium text-burgundy-800 hover:underline">{resume.title}</Link>
                ) : <p className="mt-2 text-sm text-warm-500">The related resume is no longer available.</p>}
              </div>
            </Card>
            <div className="space-y-5">
              <Card>
                <h2 className="mb-4 text-base font-semibold text-warm-950">Update application</h2>
                <form className="space-y-4" onSubmit={save}>
                  <Field label="Status">
                    <select className={inputClass} value={status} onChange={(event) => setStatus(event.target.value)}>
                      {APPLICATION_STATUSES.map((item) => <option key={item} value={item}>{titleCase(item)}</option>)}
                    </select>
                  </Field>
                  <Field label="Applied date">
                    <input className={inputClass} type="date" value={appliedAt} onChange={(event) => setAppliedAt(event.target.value)} />
                  </Field>
                  <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
                </form>
                <button type="button" className="mt-4 text-sm text-red-700 hover:underline disabled:opacity-50" onClick={() => setDeleteConfirmationOpen(true)} disabled={deleting}>
                  {deleting ? "Deleting…" : "Delete application"}
                </button>
              </Card>
              <Card>
                <h2 className="text-sm font-semibold text-warm-950">Prepare for this opportunity</h2>
                <div className="mt-3 flex flex-col gap-2 text-sm">
                  <Link className="text-burgundy-800 hover:underline" href="/dashboard/ai/analyze">Analyze resume match</Link>
                  <Link className="text-burgundy-800 hover:underline" href="/dashboard/ai/cover-letter">Generate a cover letter</Link>
                  <Link className="text-burgundy-800 hover:underline" href="/dashboard/ai/interview">Practice interview questions</Link>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
      <ConfirmDialog
        open={deleteConfirmationOpen}
        title="Delete this application?"
        description="This application will be permanently removed from your tracker."
        busy={deleting}
        onConfirm={remove}
        onCancel={() => setDeleteConfirmationOpen(false)}
      />
    </div>
  );
}
