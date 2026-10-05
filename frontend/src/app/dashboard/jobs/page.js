"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createJob, deleteJob, listJobs } from "@/lib/resources";
import { formatDate } from "@/lib/format";
import JobForm from "@/components/JobForm";
import { Alert, AppIcon, Button, Card, ConfirmDialog, EmptyState, PageHeader, Pagination } from "@/components/ui";

const PAGE_SIZE = 10;

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [jobToDelete, setJobToDelete] = useState(null);

  const loadJobs = useCallback(async () => {
    try {
      const data = await listJobs({ page, limit: PAGE_SIZE });
      if (!Array.isArray(data.jobs)) throw new Error("The server returned an unexpected job list.");
      setJobs(data.jobs);
      setPagination(data.pagination || { page, totalPages: 1 });
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Jobs couldn’t be loaded. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await listJobs({ page, limit: PAGE_SIZE });
        if (!active) return;
        if (!Array.isArray(data.jobs)) throw new Error("The server returned an unexpected job list.");
        setJobs(data.jobs);
        setPagination(data.pagination || { page, totalPages: 1 });
        setError("");
      } catch (requestError) {
        if (active) setError(requestError.message || "Jobs couldn’t be loaded. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [page]);

  const handleCreate = async (payload) => {
    setSaving(true);
    setError("");
    try {
      await createJob(payload);
      setNotice("Job saved to your workspace.");
      setShowForm(false);
      setPage(1);
      if (page === 1) await loadJobs();
    } catch (requestError) {
      setError(requestError.message || "Job couldn’t be saved.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (job) => setJobToDelete(job);

  const confirmDelete = async () => {
    if (!jobToDelete) return;
    const job = jobToDelete;
    setBusyId(job.id);
    setError("");
    setNotice("");
    try {
      await deleteJob(job.id);
      setJobToDelete(null);
      setNotice("Job deleted.");
      await loadJobs();
    } catch (requestError) {
      setJobToDelete(null);
      setError(requestError.message || "Job couldn’t be deleted.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Your workspace"
        title="Saved jobs"
        description="Keep opportunities and their descriptions together while you prepare each application."
        action={<Button onClick={() => setShowForm((current) => !current)}>{showForm ? "Close" : "Add a job"}</Button>}
      />
      {error ? <Alert>{error} <button type="button" className="ml-1 font-semibold underline" onClick={loadJobs}>Retry</button></Alert> : null}
      {notice ? <Alert tone="success">{notice}</Alert> : null}
      {showForm ? (
        <Card>
          <h2 className="mb-4 font-semibold text-warm-950">Save a job opportunity</h2>
          <JobForm submitLabel="Save job" saving={saving} onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </Card>
      ) : null}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2" aria-label="Loading jobs">
          {[1, 2, 3, 4].map((item) => <div key={item} className="h-40 animate-pulse rounded-2xl bg-white" />)}
        </div>
      ) : jobs.length ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {jobs.map((job) => (
              <Card key={job.id} className="flex flex-col justify-between gap-5">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-semibold text-warm-950">{job.title}</h2>
                      <p className="mt-1 text-sm text-warm-600">{job.company_name || "Company not specified"}</p>
                    </div>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-burgundy-50 text-burgundy-800">
                      <AppIcon name="jobs" className="h-5 w-5" />
                    </span>
                  </div>
                  <p className="mt-4 line-clamp-3 whitespace-pre-line text-sm leading-6 text-warm-600">{job.description}</p>
                  <p className="mt-3 text-xs text-warm-500">Saved {formatDate(job.created_at)}</p>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-warm-100 pt-4">
                  <Link href={`/dashboard/jobs/${job.id}`} className="text-sm font-semibold text-burgundy-800 hover:text-burgundy-950">
                    View job <span aria-hidden="true">→</span>
                  </Link>
                  <button
                    type="button"
                    className="text-sm text-red-700 hover:text-red-900 disabled:opacity-50"
                    onClick={() => handleDelete(job)}
                    disabled={busyId === job.id}
                  >
                    {busyId === job.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </Card>
            ))}
          </div>
          <Pagination page={pagination.page || page} totalPages={pagination.totalPages} onPageChange={(nextPage) => { setLoading(true); setPage(nextPage); }} />
        </>
      ) : (
        <EmptyState
          title="No saved jobs yet"
          text="Add a job description to start connecting opportunities with resumes and applications."
          action={<Button onClick={() => setShowForm(true)}>Save your first job</Button>}
        />
      )}
      <ConfirmDialog
        open={Boolean(jobToDelete)}
        title="Delete this saved job?"
        description={`“${jobToDelete?.title || "This job"}”${jobToDelete?.company_name ? ` at ${jobToDelete.company_name}` : ""} will be permanently removed.`}
        busy={Boolean(jobToDelete && busyId === jobToDelete.id)}
        onConfirm={confirmDelete}
        onCancel={() => setJobToDelete(null)}
      />
    </div>
  );
}
