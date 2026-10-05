export const APPLICATION_STATUSES = [
  "saved",
  "applied",
  "interview",
  "rejected",
  "offer",
];

export const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString();
};

export const titleCase = (value) => {
  if (!value) {
    return "";
  }

  return String(value)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export const emptyResumeContent = () => ({
  personalInfo: {
    name: "",
    email: "",
    phone: "",
    location: "",
    links: [],
  },
  summary: "",
  skills: [],
  experience: [],
  projects: [],
  education: [],
  certifications: [],
});

export const linesToList = (value) =>
  String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

export const listToLines = (value) =>
  Array.isArray(value) ? value.join("\n") : "";

export const buildContentFromForm = (form) => ({
  personalInfo: {
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    location: form.location.trim(),
    links: linesToList(form.links),
  },
  summary: form.summary.trim(),
  skills: linesToList(form.skills),
  certifications: linesToList(form.certifications),
  experience: form.experience
    .map((item) => ({
      company: item.company.trim(),
      position: item.position.trim(),
      startDate: item.startDate.trim(),
      endDate: item.endDate.trim(),
      description: linesToList(item.description),
    }))
    .filter((item) => item.company || item.position || item.description.length),
  projects: form.projects
    .map((item) => ({
      name: item.name.trim(),
      links: linesToList(item.links),
      problemSolved: item.problemSolved.trim(),
      description: linesToList(item.description),
      technologies: linesToList(item.technologies),
    }))
    .filter((item) => item.name || item.problemSolved),
  education: form.education
    .map((item) => ({
      institution: item.institution.trim(),
      degree: item.degree.trim(),
      field: item.field.trim(),
      startDate: item.startDate.trim(),
      endDate: item.endDate.trim(),
    }))
    .filter((item) => item.institution || item.degree),
});

export const contentToForm = (content = {}) => {
  const structured = content.structuredData || content;
  const personal = structured.personalInfo || {};

  return {
    rawText: content.RawText || "",
    name: personal.name || "",
    email: personal.email || "",
    phone: personal.phone || "",
    location: personal.location || "",
    links: listToLines(personal.links),
    summary: structured.summary || "",
    skills: listToLines(structured.skills),
    certifications: listToLines(structured.certifications),
    experience: Array.isArray(structured.experience)
      ? structured.experience.map((item) => ({
          company: item.company || "",
          position: item.position || "",
          startDate: item.startDate || "",
          endDate: item.endDate || "",
          description: listToLines(item.description),
        }))
      : [],
    projects: Array.isArray(structured.projects)
      ? structured.projects.map((item) => ({
          name: item.name || "",
          links: listToLines(item.links),
          problemSolved: item.problemSolved || "",
          description: listToLines(item.description),
          technologies: listToLines(item.technologies),
        }))
      : [],
    education: Array.isArray(structured.education)
      ? structured.education.map((item) => ({
          institution: item.institution || "",
          degree: item.degree || "",
          field: item.field || "",
          startDate: item.startDate || "",
          endDate: item.endDate || "",
        }))
      : [],
  };
};

export const hasStructuredData = (content) =>
  Boolean(content && typeof content === "object" && content.structuredData);

export const createIdempotencyKey = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `key-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const isTerminalJobState = (state) =>
  ["completed", "failed"].includes(state);

export const jobPayload = (job) => job?.result || null;
