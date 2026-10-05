"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  createVersion,
  getResume,
  listVersions,
  structureResume,
  updateResume,
} from "@/lib/resources";
import { formatDate } from "@/lib/format";
import ResumeContentEditor from "@/components/ResumeContentEditor";
import ResumeView from "@/components/ResumeView";
import {
  Alert,
  Button,
  Card,
  EmptyState,
  Field,
  inputClass,
  PageHeader,
} from "@/components/ui";

export default function ResumeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const resumeId = params.id;
  const [resume, setResume] = useState(null);
  const [versions, setVersions] = useState([]);
  const [selectedVersionId, setSelectedVersionId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingContent, setEditingContent] = useState(false);
  const [savingVersion, setSavingVersion] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState("");
  const [structuring, setStructuring] = useState(false);

  const loadResume = useCallback(async () => {
    try {
      const [resumeResponse, versionsResponse] = await Promise.all([
        getResume(resumeId),
        listVersions(resumeId, { page: 1, limit: 100 }),
      ]);
      if (!resumeResponse.resume || !Array.isArray(versionsResponse.versions)) {
        throw new Error("The server returned incomplete resume information.");
      }

      setResume(resumeResponse.resume);
      setTitle(resumeResponse.resume.title || "");
      setVersions(versionsResponse.versions);
      setSelectedVersionId((current) => {
        if (versionsResponse.versions.some((version) => version.id === current)) {
          return current;
        }
        return versionsResponse.versions[0]?.id || "";
      });
      setError("");
    } catch (requestError) {
      setError(requestError.message || "This resume couldn’t be loaded. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [resumeId]);

  useEffect(() => {
    let active = true;

    const loadPage = async () => {
      try {
        const [resumeResponse, versionsResponse] = await Promise.all([
          getResume(resumeId),
          listVersions(resumeId, { page: 1, limit: 100 }),
        ]);
        if (!active) {
          return;
        }
        if (!resumeResponse.resume || !Array.isArray(versionsResponse.versions)) {
          throw new Error("The server returned incomplete resume information.");
        }
        setResume(resumeResponse.resume);
        setTitle(resumeResponse.resume.title || "");
        setVersions(versionsResponse.versions);
        setSelectedVersionId((current) => (
          versionsResponse.versions.some((version) => version.id === current)
            ? current
            : versionsResponse.versions[0]?.id || ""
        ));
        setError("");
      } catch (requestError) {
        if (active) {
          setError(requestError.message || "This resume couldn’t be loaded. Please try again.");
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
  }, [resumeId]);

  const selectedVersion = versions.find((version) => version.id === selectedVersionId);
  const content = selectedVersion?.content || null;
  const rawTextOnly = Boolean(content?.RawText && !content?.structuredData);

  const saveVersion = async (nextContent) => {
    setSavingVersion(true);
    setError("");
    setNotice("");
    try {
      const response = await createVersion(resumeId, nextContent);
      if (!response.version?.id) {
        throw new Error("The server did not confirm the new resume version.");
      }
      setNotice("A new resume version was saved.");
      setEditingContent(false);
      await loadResume();
      setSelectedVersionId(response.version.id);
    } catch (requestError) {
      setError(requestError.message || "The resume version couldn’t be saved.");
    } finally {
      setSavingVersion(false);
    }
  };

  const handleRename = async (event) => {
    event.preventDefault();
    if (!title.trim()) {
      setError("Resume name is required.");
      return;
    }

    setRenaming(true);
    setError("");
    setNotice("");
    try {
      const response = await updateResume(resumeId, title.trim());
      setResume(response.resume || { ...resume, title: title.trim() });
      setNotice("Resume name updated.");
    } catch (requestError) {
      setError(requestError.message || "Resume name couldn’t be updated.");
    } finally {
      setRenaming(false);
    }
  };

  const handleStructure = async () => {
    if (!selectedVersionId) {
      return;
    }

    setStructuring(true);
    setError("");
    setNotice("");
    try {
      await structureResume(resumeId, selectedVersionId);
      setNotice("Resume text has been structured.");
      await loadResume();
    } catch (requestError) {
      setError(requestError.message || "Resume text couldn’t be structured.");
    } finally {
      setStructuring(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-5" aria-label="Loading resume">
        <div className="h-20 animate-pulse rounded-2xl bg-white" />
        <div className="h-72 animate-pulse rounded-2xl bg-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/resumes"
        className="inline-flex items-center gap-2 text-sm font-medium text-warm-600 hover:text-burgundy-800"
      >
        <span aria-hidden="true">←</span> All resumes
      </Link>

      {error ? (
        <Alert>
          {error}{" "}
          <button type="button" className="ml-1 font-semibold underline" onClick={loadResume}>
            Retry
          </button>
        </Alert>
      ) : null}
      {notice ? <Alert tone="success">{notice}</Alert> : null}

      {!resume ? (
        <EmptyState title="Resume unavailable" text="This resume may have been removed or is no longer accessible." />
      ) : (
        <>
          <PageHeader
            eyebrow="Resume"
            title={resume.title || "Untitled resume"}
            description={`Created ${formatDate(resume.created_at)}`}
            action={
              <Button variant="secondary" onClick={() => router.push("/dashboard/resumes")}>
                Back to resumes
              </Button>
            }
          />

          <Card>
            <form onSubmit={handleRename} className="flex flex-col items-end gap-3 sm:flex-row">
              <Field label="Resume name">
                <input
                  className={inputClass}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={200}
                  required
                />
              </Field>
              <Button type="submit" variant="secondary" disabled={renaming}>
                {renaming ? "Saving…" : "Update name"}
              </Button>
            </form>
          </Card>

          <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_290px]">
            <Card>
              <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-base font-semibold text-warm-950">Resume content</h2>
                  <p className="mt-1 text-sm text-warm-500">
                    {selectedVersion
                      ? `Version ${selectedVersion.version_number ?? "—"} · ${formatDate(selectedVersion.created_at)}`
                      : "Add content to begin your first version."}
                  </p>
                </div>
                {!editingContent ? (
                  <Button onClick={() => setEditingContent(true)}>
                    {selectedVersion ? "Edit content" : "Add content"}
                  </Button>
                ) : null}
              </div>

              {editingContent ? (
                <ResumeContentEditor
                  key={`${selectedVersionId || "new"}-${Boolean(content?.structuredData)}`}
                  content={content}
                  onSave={saveVersion}
                  saving={savingVersion}
                />
              ) : selectedVersion ? (
                <div className="space-y-4">
                  {rawTextOnly ? (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-amber-50 p-4">
                      <p className="text-sm text-amber-900">
                        This upload contains extracted text. Structure it into resume sections to edit and reuse it.
                      </p>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleStructure}
                        disabled={structuring}
                      >
                        {structuring ? "Structuring…" : "Structure resume"}
                      </Button>
                    </div>
                  ) : null}
                  <ResumeView content={content} />
                </div>
              ) : (
                <EmptyState
                  title="No content yet"
                  text="Add your contact details and experience to create the first version of this resume."
                  action={<Button onClick={() => setEditingContent(true)}>Add resume content</Button>}
                />
              )}
            </Card>

            <Card className="h-fit">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-warm-950">Versions</h2>
                <p className="mt-1 text-sm text-warm-500">Each save keeps a separate version.</p>
              </div>
              {versions.length ? (
                <ul className="space-y-2">
                  {versions.map((version) => (
                    <li key={version.id}>
                      <button
                        type="button"
                        className={`w-full rounded-xl border p-3 text-left transition ${
                          version.id === selectedVersionId
                            ? "border-burgundy-300 bg-burgundy-50"
                            : "border-warm-200 hover:bg-warm-50"
                        }`}
                        onClick={() => {
                          setSelectedVersionId(version.id);
                          setEditingContent(false);
                        }}
                      >
                        <span className="block text-sm font-medium text-warm-900">
                          Version {version.version_number ?? "—"}
                        </span>
                        <span className="mt-1 block text-xs text-warm-500">
                          {formatDate(version.created_at)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-xl bg-warm-50 p-3 text-sm text-warm-500">
                  Versions appear here after you add resume content.
                </p>
              )}
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
