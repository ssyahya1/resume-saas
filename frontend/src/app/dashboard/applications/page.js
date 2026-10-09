"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  createApplication,
  deleteApplication,
  getWorkspaceOptions,
  listApplications,
} from "@/lib/resources";
import { APPLICATION_STATUSES, formatDate, titleCase } from "@/lib/format";
import {
  Alert,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Field,
  inputClass,
  PageHeader,
  Pagination,
  StatusBadge,
} from "@/components/ui";

const PAGE_SIZE = 10;

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [jobId, setJobId] = useState("");
  const [resumeId, setResumeId] = useState("");
  const [status, setStatus] = useState("saved");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [applicationToDelete, setApplicationToDelete] = useState(null);

  const loadApplications = useCallback(async () => {
    try {
      const [applicationResponse, workspaceOptions] = await Promise.all([
        listApplications({ page, limit: PAGE_SIZE, status: statusFilter }),
        getWorkspaceOptions(),
      ]);
      if (workspaceOptions.unavailable?.some((resource) => ["jobs", "resumes"].includes(resource))) {
        throw new Error("Some job or resume options are unavailable. Please try again.");
      }
      if (!Array.isArray(applicationResponse.applications)) throw new Error("The server returned an unexpected application list.");
      setApplications(applicationResponse.applications);
      setPagination(applicationResponse.pagination || { page, totalPages: 1 });
      setJobs(Array.isArray(workspaceOptions.jobs) ? workspaceOptions.jobs : []);
      setResumes(Array.isArray(workspaceOptions.resumes) ? workspaceOptions.resumes : []);
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Applications couldn’t be loaded. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [applicationResponse, workspaceOptions] = await Promise.all([
          listApplications({ page, limit: PAGE_SIZE, status: statusFilter }),
          getWorkspaceOptions(),
        ]);
        if (!active) return;
        if (workspaceOptions.unavailable?.some((resource) => ["jobs", "resumes"].includes(resource))) {
          throw new Error("Some job or resume options are unavailable. Please try again.");
        }
        if (!Array.isArray(applicationResponse.applications)) throw new Error("The server returned an unexpected application list.");
        setApplications(applicationResponse.applications);
        setPagination(applicationResponse.pagination || { page, totalPages: 1 });
        setJobs(Array.isArray(workspaceOptions.jobs) ? workspaceOptions.jobs : []);
        setResumes(Array.isArray(workspaceOptions.resumes) ? workspaceOptions.resumes : []);
        setError("");
      } catch (requestError) {
        if (active) setError(requestError.message || "Applications couldn’t be loaded. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [page, statusFilter]);

  const selectedJobId = jobs.some((job) => job.id === jobId) ? jobId : jobs[0]?.id || "";
  const selectedResumeId = resumes.some((resume) => resume.id === resumeId) ? resumeId : resumes[0]?.id || "";

  const create = async (event) => {
    event.preventDefault();
    if (!selectedJobId || !selectedResumeId) {
      setError("Choose both a job and a resume.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await createApplication({ jobId: selectedJobId, resumeId: selectedResumeId, status });
      setNotice("Application added to your tracker.");
      setShowForm(false);
      setPage(1);
      if (page === 1) await loadApplications();
    } catch (requestError) {
      setError(requestError.message || "Application couldn’t be created.");
    } finally {
      setSaving(false);
    }
  };

  const remove = (application) => setApplicationToDelete(application);

  const confirmDelete = async () => {
    if (!applicationToDelete) return;
    const application = applicationToDelete;
    setBusyId(application.id);
    setError("");
    setNotice("");
    try {
      await deleteApplication(application.id);
      setApplicationToDelete(null);
      setNotice("Application deleted.");
      await loadApplications();
    } catch (requestError) {
      setApplicationToDelete(null);
      setError(requestError.message || "Application couldn’t be deleted.");
    } finally {
      setBusyId("");
    }
  };

  const jobById = Object.fromEntries(jobs.map((job) => [job.id, job]));
  const resumeById = Object.fromEntries(resumes.map((resume) => [resume.id, resume]));

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Your workspace"
        title="Applications"
        description="Track where each opportunity stands and keep the job and resume you used close at hand."
        action={<Button onClick={() => setShowForm((current) => !current)}>{showForm ? "Close" : "Add application"}</Button>}
      />
      {error ? <Alert>{error} <button type="button" className="ml-1 font-semibold underline" onClick={loadApplications}>Retry</button></Alert> : null}
      {notice ? <Alert tone="success">{notice}</Alert> : null}
      {showForm ? (
        <Card>
          <h2 className="mb-4 font-semibold text-warm-950">Track an opportunity</h2>
          {jobs.length && resumes.length ? (
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={create}>
              <Field label="Job">
                <select className={inputClass} value={selectedJobId} onChange={(event) => setJobId(event.target.value)} required>
                  {jobs.map((job) => <option key={job.id} value={job.id}>{job.title}{job.company_name ? ` · ${job.company_name}` : ""}</option>)}
                </select>
              </Field>
              <Field label="Resume">
                <select className={inputClass} value={selectedResumeId} onChange={(event) => setResumeId(event.target.value)} required>
                  {resumes.map((resume) => <option key={resume.id} value={resume.id}>{resume.title}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select className={inputClass} value={status} onChange={(event) => setStatus(event.target.value)}>
                  {APPLICATION_STATUSES.map((item) => <option key={item} value={item}>{titleCase(item)}</option>)}
                </select>
              </Field>
              <div className="flex items-end">
                <Button type="submit" disabled={saving}>{saving ? "Adding…" : "Add application"}</Button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-warm-600">
              Save at least one job and create at least one resume before tracking an application.{" "}
              <Link className="text-burgundy-800 underline" href="/dashboard/jobs">Jobs</Link> ·{" "}
              <Link className="text-burgundy-800 underline" href="/dashboard/resumes">Resumes</Link>
            </p>
          )}
        </Card>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-warm-500">
          {pagination.total != null ? `${pagination.total} application${pagination.total === 1 ? "" : "s"}` : "Your application tracker"}
        </p>
        <label className="flex items-center gap-2 text-sm text-warm-600">
          Status
          <select
            className="rounded-xl border border-warm-200 bg-white px-3 py-2 text-sm text-warm-800"
            value={statusFilter}
            onChange={(event) => { setLoading(true); setPage(1); setStatusFilter(event.target.value); }}
          >
            <option value="">All statuses</option>
            {APPLICATION_STATUSES.map((item) => <option key={item} value={item}>{titleCase(item)}</option>)}
          </select>
        </label>
      </div>

      {loading ? (
        <div className="space-y-3" aria-label="Loading applications">
          {[1, 2, 3].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl bg-white" />)}
        </div>
      ) : applications.length ? (
        <>
          <div className="space-y-3">
            {applications.map((application) => {
              const job = jobById[application.job_id];
              const resume = resumeById[application.resume_id];
              return (
                <Card key={application.id} className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="min-w-0">
                    <Link href={`/dashboard/applications/${application.id}`} className="text-base font-semibold text-warm-950 hover:text-burgundy-800">
                      {job?.title || "Job application"}
                    </Link>
                    <p className="mt-1 text-sm text-warm-600">{job?.company_name || "Company not specified"}</p>
                    <p className="mt-2 text-xs text-warm-500">
                      Resume: {resume?.title || "Resume unavailable"} · Updated {formatDate(application.updated_at || application.applied_at || application.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <StatusBadge status={application.status} />
                    <button type="button" className="text-sm text-red-700 hover:text-red-900 disabled:opacity-50" onClick={() => remove(application)} disabled={busyId === application.id}>
                      {busyId === application.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
          <Pagination page={pagination.page || page} totalPages={pagination.totalPages} onPageChange={(nextPage) => { setLoading(true); setPage(nextPage); }} />
        </>
      ) : (
        <EmptyState
          title={statusFilter ? "No applications with this status" : "No applications yet"}
          text={statusFilter ? "Choose another status filter or add an application." : "Create an application to start keeping track of your next move."}
          action={<Button onClick={() => setShowForm(true)}>Add application</Button>}
        />
      )}
      <ConfirmDialog
        open={Boolean(applicationToDelete)}
        title="Delete this application?"
        description="This application will be permanently removed from your tracker."
        busy={Boolean(applicationToDelete && busyId === applicationToDelete.id)}
        onConfirm={confirmDelete}
        onCancel={() => setApplicationToDelete(null)}
      />
    </div>
  );
}
