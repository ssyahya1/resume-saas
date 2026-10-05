"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  createResume,
  deleteResume,
  listResumes,
  updateResume,
  uploadResume,
} from "@/lib/resources";
import { formatDate } from "@/lib/format";
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
} from "@/components/ui";

const PAGE_SIZE = 10;

export default function ResumesPage() {
  const [resumes, setResumes] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState("");
  const [formMode, setFormMode] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState(null);

  const loadResumes = useCallback(async () => {
    try {
      const data = await listResumes({ page, limit: PAGE_SIZE });
      if (!Array.isArray(data.resumes)) {
        throw new Error("The server returned an unexpected resume list.");
      }

      setResumes(data.resumes);
      setPagination(data.pagination || { page, totalPages: 1 });
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Your resumes couldn’t be loaded. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    let active = true;

    const loadPage = async () => {
      try {
        const data = await listResumes({ page, limit: PAGE_SIZE });
        if (!active) {
          return;
        }
        if (!Array.isArray(data.resumes)) {
          throw new Error("The server returned an unexpected resume list.");
        }
        setResumes(data.resumes);
        setPagination(data.pagination || { page, totalPages: 1 });
        setError("");
      } catch (requestError) {
        if (active) {
          setError(requestError.message || "Your resumes couldn’t be loaded. Please try again.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadPage();

    return () => {
      active = false;
    };
  }, [page]);

  const resetForm = () => {
    setFormMode("");
    setTitle("");
    setFile(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError("Enter a name for this resume.");
      return;
    }
    if (formMode === "upload" && !file) {
      setError("Choose a resume file to upload.");
      return;
    }
    if (formMode === "upload" && file.size > 5 * 1024 * 1024) {
      setError("Choose a file smaller than 5 MB.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      if (formMode === "upload") {
        await uploadResume({ title: trimmedTitle, file });
        setNotice("Your resume was uploaded and parsed.");
      } else {
        await createResume(trimmedTitle);
        setNotice("Your resume was created.");
      }

      resetForm();
      setPage(1);
      if (page === 1) {
        await loadResumes();
      }
    } catch (requestError) {
      setError(requestError.message || "Your resume couldn’t be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleRename = async (resume) => {
    const nextTitle = window.prompt("Enter a new name for this resume:", resume.title || "");
    if (nextTitle === null || !nextTitle.trim()) {
      return;
    }

    setBusyId(resume.id);
    setError("");
    setNotice("");
    try {
      await updateResume(resume.id, nextTitle.trim());
      setNotice("Resume name updated.");
      await loadResumes();
    } catch (requestError) {
      setError(requestError.message || "The resume name couldn’t be updated.");
    } finally {
      setBusyId("");
    }
  };

  const handleDelete = (resume) => setResumeToDelete(resume);

  const confirmDelete = async () => {
    if (!resumeToDelete) return;
    const resume = resumeToDelete;
    setBusyId(resume.id);
    setError("");
    setNotice("");
    try {
      await deleteResume(resume.id);
      setResumeToDelete(null);
      setNotice("Resume deleted.");
      await loadResumes();
    } catch (requestError) {
      setResumeToDelete(null);
      setError(requestError.message || "The resume couldn’t be deleted.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Your workspace"
        title="Resumes"
        description="Keep your source resumes organized and create focused versions for each opportunity."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setFormMode("upload")}>
              Upload a resume
            </Button>
            <Button onClick={() => setFormMode("create")}>Create resume</Button>
          </div>
        }
      />

      {error ? (
        <Alert>
          {error}{" "}
          <button className="ml-1 font-semibold underline" type="button" onClick={loadResumes}>
            Retry
          </button>
        </Alert>
      ) : null}
      {notice ? <Alert tone="success">{notice}</Alert> : null}

      {formMode ? (
        <Card>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-warm-950">
                  {formMode === "upload" ? "Upload a resume" : "Create a resume"}
                </h2>
                <p className="mt-1 text-sm text-warm-500">
                  {formMode === "upload"
                    ? "Add a PDF or Word document to extract its text."
                    : "Start with a title. You can add resume content in the next step."}
                </p>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="text-sm text-warm-500 hover:text-warm-800"
                aria-label="Close form"
              >
                Close
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Resume name">
                <input
                  className={inputClass}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={200}
                  required
                  autoFocus
                  placeholder="e.g. Product designer"
                />
              </Field>
              {formMode === "upload" ? (
                <Field label="Resume file">
                  <input
                    className={`${inputClass} file:mr-3 file:rounded-lg file:border-0 file:bg-burgundy-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-burgundy-900`}
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(event) => setFile(event.target.files?.[0] || null)}
                    required
                  />
                </Field>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : formMode === "upload" ? "Upload resume" : "Create resume"}
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm} disabled={saving}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2" aria-label="Loading resumes">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-36 animate-pulse rounded-2xl bg-white shadow-sm" />
          ))}
        </div>
      ) : resumes.length ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {resumes.map((resume) => (
              <Card key={resume.id} className="flex flex-col justify-between gap-5">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-semibold text-warm-950">
                        {resume.title || "Untitled resume"}
                      </h2>
                      <p className="mt-1 text-sm text-warm-500">
                        Updated {formatDate(resume.updated_at || resume.created_at)}
                      </p>
                    </div>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-burgundy-50 text-lg text-burgundy-800" aria-hidden="true">
                      ▤
                    </span>
                  </div>
                  {resume.created_at ? (
                    <p className="mt-4 text-xs text-warm-500">
                      Created {formatDate(resume.created_at)}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-warm-100 pt-4">
                  <Link
                    href={`/dashboard/resumes/${resume.id}`}
                    className="text-sm font-semibold text-burgundy-800 hover:text-burgundy-950"
                  >
                    Open resume <span aria-hidden="true">→</span>
                  </Link>
                  <div className="flex gap-3 text-sm">
                    <button
                      type="button"
                      className="text-warm-500 hover:text-warm-900 disabled:opacity-50"
                      onClick={() => handleRename(resume)}
                      disabled={busyId === resume.id}
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      className="text-red-700 hover:text-red-900 disabled:opacity-50"
                      onClick={() => handleDelete(resume)}
                      disabled={busyId === resume.id}
                    >
                      {busyId === resume.id ? "Working…" : "Delete"}
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <Pagination
            page={pagination.page || page}
            totalPages={pagination.totalPages}
            onPageChange={(nextPage) => {
              setLoading(true);
              setPage(nextPage);
            }}
          />
        </>
      ) : (
        <EmptyState
          title="Your resumes start here"
          text="Create a resume or upload a file to keep your experience ready for your next application."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={() => setFormMode("create")}>Create resume</Button>
              <Button variant="secondary" onClick={() => setFormMode("upload")}>
                Upload a resume
              </Button>
            </div>
          }
        />
      )}
      <ConfirmDialog
        open={Boolean(resumeToDelete)}
        title="Delete this resume?"
        description={`“${resumeToDelete?.title || "This resume"}” will be permanently removed. This action cannot be undone.`}
        busy={Boolean(resumeToDelete && busyId === resumeToDelete.id)}
        onConfirm={confirmDelete}
        onCancel={() => setResumeToDelete(null)}
      />
    </div>
  );
}
