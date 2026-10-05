"use client";

import { useState } from "react";
import { Alert, Button, Field, inputClass } from "./ui";

const asJson = (value) => JSON.stringify(value || [], null, 2);

export default function ResumeContentEditor({ content, onSave, saving }) {
  const initialData = content?.structuredData || content || {};
  const initialPersonal = initialData.personalInfo || {};
  const [form, setForm] = useState({
    personalInfo: {
      name: initialPersonal.name || "",
      email: initialPersonal.email || "",
      phone: initialPersonal.phone || "",
      location: initialPersonal.location || "",
      links: asJson(initialPersonal.links),
    },
    summary: initialData.summary || "",
    skills: asJson(initialData.skills),
    certifications: asJson(initialData.certifications),
    experience: asJson(initialData.experience),
    projects: asJson(initialData.projects),
    education: asJson(initialData.education),
  });
  const [error, setError] = useState("");

  const setPersonal = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      personalInfo: { ...current.personalInfo, [name]: value },
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    try {
      const parseArray = (value, label) => {
        const parsed = JSON.parse(value || "[]");
        if (!Array.isArray(parsed)) {
          throw new Error(`${label} must be a JSON array.`);
        }
        return parsed;
      };

      const previous = content?.structuredData || content || {};
      const next = {
        ...previous,
        personalInfo: {
          ...previous.personalInfo,
          name: form.personalInfo.name.trim(),
          email: form.personalInfo.email.trim(),
          phone: form.personalInfo.phone.trim(),
          location: form.personalInfo.location.trim(),
          links: parseArray(form.personalInfo.links, "Links"),
        },
        summary: form.summary.trim(),
        skills: parseArray(form.skills, "Skills"),
        certifications: parseArray(form.certifications, "Certifications"),
        experience: parseArray(form.experience, "Experience"),
        projects: parseArray(form.projects, "Projects"),
        education: parseArray(form.education, "Education"),
      };

      delete next.RawText;
      delete next.structuredData;
      onSave(next);
    } catch (parseError) {
      setError(parseError.message || "Check the JSON format in each resume section.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error ? <Alert>{error}</Alert> : null}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-warm-900">Contact information</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["name", "Full name"],
            ["email", "Email"],
            ["phone", "Phone"],
            ["location", "Location"],
          ].map(([name, label]) => (
            <Field key={name} label={label}>
              <input
                className={inputClass}
                name={name}
                value={form.personalInfo[name]}
                onChange={setPersonal}
              />
            </Field>
          ))}
        </div>
        <Field label="Links (JSON array)">
          <textarea
            className={`${inputClass} min-h-20 font-mono text-xs`}
            value={form.personalInfo.links}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                personalInfo: { ...current.personalInfo, links: event.target.value },
              }))
            }
            spellCheck="false"
          />
        </Field>
      </section>

      <Field label="Summary">
        <textarea
          className={`${inputClass} min-h-28`}
          value={form.summary}
          onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))}
        />
      </Field>

      <div className="grid gap-4 lg:grid-cols-2">
        {[
          ["skills", "Skills"],
          ["certifications", "Certifications"],
          ["experience", "Experience"],
          ["projects", "Projects"],
          ["education", "Education"],
        ].map(([name, label]) => (
          <Field key={name} label={`${label} (JSON array)`}>
            <textarea
              className={`${inputClass} min-h-36 font-mono text-xs`}
              value={form[name]}
              onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))}
              spellCheck="false"
            />
          </Field>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving version…" : "Save as new version"}
        </Button>
        <p className="text-xs text-warm-500">
          Array sections use JSON so every version retains its complete structured content.
        </p>
      </div>
    </form>
  );
}
