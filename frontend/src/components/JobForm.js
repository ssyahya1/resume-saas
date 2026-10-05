"use client";

import { useState } from "react";
import { Alert, Button, Field, inputClass } from "./ui";

export default function JobForm({ initialJob, onSubmit, onCancel, saving, submitLabel }) {
  const [form, setForm] = useState({
    title: initialJob?.title || "",
    companyName: initialJob?.company_name || "",
    description: initialJob?.description || "",
    jobUrl: initialJob?.job_url || "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.title.trim() || !form.description.trim()) {
      setError("Job title and description are required.");
      return;
    }
    if (form.jobUrl.trim()) {
      try {
        new URL(form.jobUrl);
      } catch {
        setError("Enter a valid job URL, including https://.");
        return;
      }
    }

    try {
      await onSubmit({
        title: form.title.trim(),
        companyName: form.companyName.trim(),
        description: form.description.trim(),
        ...(form.jobUrl.trim() ? { jobUrl: form.jobUrl.trim() } : {}),
      });
    } catch (submitError) {
      setError(submitError.message || "The job could not be saved.");
    }
  };

  const update = (event) =>
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error ? <Alert>{error}</Alert> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Job title *">
          <input className={inputClass} name="title" value={form.title} onChange={update} maxLength={200} required />
        </Field>
        <Field label="Company">
          <input className={inputClass} name="companyName" value={form.companyName} onChange={update} maxLength={200} />
        </Field>
      </div>
      <Field label="Job description *">
        <textarea className={`${inputClass} min-h-40`} name="description" value={form.description} onChange={update} required />
      </Field>
      <Field label="Job link">
        <input className={inputClass} name="jobUrl" type="url" value={form.jobUrl} onChange={update} placeholder="https://…" />
      </Field>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={saving}>{saving ? "Saving…" : submitLabel}</Button>
        {onCancel ? <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>Cancel</Button> : null}
      </div>
    </form>
  );
}
