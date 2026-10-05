"use client";

import { forwardRef, useEffect, useId, useRef, useState } from "react";

export function AppIcon({ name, className = "h-5 w-5" }) {
  const paths = {
    overview: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="4" rx="1.5" /><rect x="13.5" y="10.5" width="7" height="10" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /></>,
    resume: <><path d="M7 3.5h7l4 4v13H7a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z" /><path d="M14 3.5v4h4M8.5 12h7M8.5 15.5h7" /></>,
    jobs: <><rect x="3.5" y="7" width="17" height="13.5" rx="2" /><path d="M8.5 7V5.5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2V7M3.5 12h17M10 12v2h4v-2" /></>,
    applications: <><path d="M8 4.5h8M9 3.5h6a1 1 0 0 1 1 1v2H8v-2a1 1 0 0 1 1-1Z" /><rect x="5" y="5.5" width="14" height="15" rx="2" /><path d="m8.5 12 2 2 5-5M8.5 17h7" /></>,
    sparkle: <><path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z" /><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16ZM5 2l.6 1.9L7.5 4.5l-1.9.6L5 7l-.6-1.9-1.9-.6 1.9-.6L5 2Z" /></>,
    logout: <><path d="M10 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H10" /><path d="M14 16l4-4-4-4M18 12H9" /></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    upload: <><path d="M12 16V4M7 9l5-5 5 5" /><path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" /></>,
    eye: <><path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></>,
    eyeOff: <><path d="m3 3 18 18M10.6 6.2A10.8 10.8 0 0 1 12 6c6.2 0 9.5 6 9.5 6a16 16 0 0 1-3.1 3.6M6.2 6.8C3.8 8.3 2.5 12 2.5 12s3.3 6 9.5 6c1.1 0 2.1-.2 3-.5" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>,
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name] || paths.sparkle}
    </svg>
  );
}

export function Alert({ children, tone = "error" }) {
  if (!children) {
    return null;
  }

  const tones = {
    error: "border-red-200 bg-red-50 text-red-800",
    success: "border-green-200 bg-green-50 text-green-900",
    info: "border-burgundy-200 bg-burgundy-50 text-burgundy-800",
    warning: "border-amber-200 bg-amber-50 text-amber-950",
  };

  return (
    <div role={tone === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm leading-6 ${tones[tone] || tones.info}`}>
      {children}
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="font-medium text-warm-700">{label}</span>
      {children}
    </label>
  );
}

export function PasswordField({
  id,
  label = "Password",
  autoComplete,
  minLength,
  required,
  value,
  onChange,
}) {
  const [visible, setVisible] = useState(false);
  const toggleVisibility = () => setVisible((current) => !current);
  const handleToggleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
      event.preventDefault();
      toggleVisibility();
    }
  };

  return (
    <div className="block space-y-1.5 text-sm">
      <label htmlFor={id} className="block font-medium text-warm-700">{label}</label>
      <div className="relative">
        <input
          id={id}
          className={`${inputClass} pr-12`}
          name={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          minLength={minLength}
          required={required}
          value={value}
          onChange={onChange}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-xl text-warm-500 transition hover:text-burgundy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-burgundy-600"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={toggleVisibility}
          onKeyDown={handleToggleKeyDown}
        >
          <AppIcon name={visible ? "eyeOff" : "eye"} className="h-[18px] w-[18px]" />
        </button>
      </div>
    </div>
  );
}

export const inputClass =
  "min-h-11 w-full rounded-xl border border-warm-200 bg-white px-3 py-2.5 text-sm text-warm-900 outline-none transition placeholder:text-warm-400 hover:border-warm-300 focus:border-burgundy-700 focus:ring-4 focus:ring-burgundy-100/70 disabled:cursor-not-allowed disabled:bg-warm-50 disabled:text-warm-500";

export const Button = forwardRef(function Button(
  { children, variant = "primary", className = "", ...props },
  ref
) {
  const variants = {
    primary: "bg-burgundy-600 text-white shadow-sm shadow-burgundy-900/10 hover:bg-burgundy-500 active:bg-burgundy-800",
    secondary: "border border-warm-200 bg-white text-warm-800 shadow-sm hover:border-warm-300 hover:bg-warm-50 active:bg-warm-100",
    danger: "border border-red-200 bg-red-50 text-red-800 hover:border-red-300 hover:bg-red-100",
    ghost: "text-warm-700 hover:bg-warm-100",
  };

  return (
    <button
      ref={ref}
      className={`inline-flex min-h-10 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-200 ease-out hover:-translate-y-px active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-burgundy-100 disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

export function ConfirmDialog({
  open,
  title,
  description,
  busy = false,
  onConfirm,
  onCancel,
}) {
  const titleId = useId();
  const descriptionId = useId();
  const cancelRef = useRef(null);
  const deleteRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape" && !busy) onCancel();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [busy, onCancel, open]);

  if (!open) return null;

  const trapFocus = (event) => {
    if (event.key !== "Tab") return;
    if (event.shiftKey && document.activeElement === cancelRef.current) {
      event.preventDefault();
      deleteRef.current?.focus();
    } else if (!event.shiftKey && document.activeElement === deleteRef.current) {
      event.preventDefault();
      cancelRef.current?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-warm-950/35 p-4" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !busy) onCancel();
    }}>
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onKeyDown={trapFocus}
        className="menu-enter w-full max-w-md rounded-xl border border-warm-200 bg-white p-5 shadow-xl sm:p-6"
      >
        <h2 id={titleId} className="text-lg font-semibold text-warm-950">{title}</h2>
        <p id={descriptionId} className="mt-2 text-sm leading-6 text-warm-600">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button ref={cancelRef} type="button" variant="secondary" onClick={onCancel} disabled={busy} autoFocus>
            Cancel
          </Button>
          <Button ref={deleteRef} type="button" variant="danger" onClick={onConfirm} disabled={busy}>
            {busy ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </section>
    </div>
  );
}

export function Card({ children, className = "" }) {
  return (
    <section className={`rounded-[14px] border border-warm-200/90 bg-white p-5 shadow-[0_1px_3px_rgba(36,31,29,0.05)] sm:p-6 ${className}`}>
      {children}
    </section>
  );
}

export function EmptyState({ title, text, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-warm-300 bg-white px-6 py-12 text-center sm:py-14">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-burgundy-50 text-burgundy-800">
        <AppIcon name="sparkle" className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-warm-950">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-warm-600">{text}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Pagination({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-3 pt-2 text-sm">
      <span className="text-warm-500">
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const tones = {
    saved: "bg-warm-100 text-warm-700",
    applied: "bg-burgundy-100 text-burgundy-800",
    interview: "bg-amber-100 text-amber-800",
    rejected: "bg-red-100 text-red-800",
    offer: "bg-green-100 text-green-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    queued: "bg-warm-100 text-warm-700",
    waiting: "bg-warm-100 text-warm-700",
    active: "bg-amber-100 text-amber-800",
    processing: "bg-burgundy-100 text-burgundy-800",
    delayed: "bg-amber-100 text-amber-800",
    retrying: "bg-amber-100 text-amber-800",
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ring-black/[0.03] ${tones[status] || "bg-warm-100 text-warm-700"}`}
    >
      {status === "queued" || status === "waiting"
        ? "Preparing"
        : status === "active" || status === "processing" || status === "retrying"
          ? "In progress"
          : status || "unknown"}
    </span>
  );
}

export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-burgundy-800">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-warm-950 sm:text-[1.75rem]">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-warm-600">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
