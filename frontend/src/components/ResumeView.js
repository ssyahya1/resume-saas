export default function ResumeView({ content }) {
  if (!content) {
    return <p className="text-sm text-warm-500">No resume content yet.</p>;
  }

  const structured = content.structuredData || null;
  const rawText = content.RawText;

  if (!structured && rawText) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-warm-500">Parsed text. Structure this version before tailoring or generating a cover letter.</p>
        <pre className="whitespace-pre-wrap rounded-2xl bg-warm-50 p-4 text-sm text-warm-800">{rawText}</pre>
      </div>
    );
  }

  const data = structured || content;
  const personal = data.personalInfo || {};

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold text-warm-950">{personal.name || "Untitled candidate"}</h3>
        <p className="mt-1 text-sm text-warm-600">
          {[personal.email, personal.phone, personal.location].filter(Boolean).join(" · ") || "No contact details"}
        </p>
        {Array.isArray(personal.links) && personal.links.length > 0 ? (
          <ul className="mt-2 space-y-1 text-sm text-burgundy-800">
            {personal.links.map((link) => (
              <li key={link}>{link}</li>
            ))}
          </ul>
        ) : null}
      </div>

      {data.summary ? (
        <section>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-warm-500">Summary</h4>
          <p className="mt-2 text-sm leading-6 text-warm-800">{data.summary}</p>
        </section>
      ) : null}

      {Array.isArray(data.skills) && data.skills.length > 0 ? (
        <section>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-warm-500">Skills</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {data.skills.map((skill) => (
              <span key={skill} className="rounded-full bg-warm-100 px-3 py-1 text-xs text-warm-700">
                {skill}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {Array.isArray(data.experience) && data.experience.length > 0 ? (
        <section className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-warm-500">Experience</h4>
          {data.experience.map((item, index) => (
            <article key={`${item.company}-${index}`}>
              <p className="font-medium text-warm-900">
                {item.position || "Role"} {item.company ? `· ${item.company}` : ""}
              </p>
              <p className="text-xs text-warm-500">
                {[item.startDate, item.endDate].filter(Boolean).join(" – ")}
              </p>
              {Array.isArray(item.description) ? (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-warm-700">
                  {item.description.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </section>
      ) : null}

      {Array.isArray(data.projects) && data.projects.length > 0 ? (
        <section className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-warm-500">Projects</h4>
          {data.projects.map((item, index) => (
            <article key={`${item.name}-${index}`}>
              <p className="font-medium text-warm-900">{item.name || "Project"}</p>
              {item.problemSolved ? <p className="mt-1 text-sm text-warm-700">{item.problemSolved}</p> : null}
              {Array.isArray(item.technologies) && item.technologies.length > 0 ? (
                <p className="mt-1 text-xs text-warm-500">{item.technologies.join(", ")}</p>
              ) : null}
            </article>
          ))}
        </section>
      ) : null}

      {Array.isArray(data.education) && data.education.length > 0 ? (
        <section className="space-y-3">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-warm-500">Education</h4>
          {data.education.map((item, index) => (
            <article key={`${item.institution}-${index}`}>
              <p className="font-medium text-warm-900">{item.institution || "Institution"}</p>
              <p className="text-sm text-warm-600">
                {[item.degree, item.field].filter(Boolean).join(", ")}
              </p>
            </article>
          ))}
        </section>
      ) : null}

      {Array.isArray(data.certifications) && data.certifications.length > 0 ? (
        <section>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-warm-500">Certifications</h4>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-warm-700">
            {data.certifications.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {content.tailoredFor?.jobId ? (
        <p className="text-xs text-burgundy-800">Tailored for job {content.tailoredFor.jobId}</p>
      ) : null}
    </div>
  );
}
