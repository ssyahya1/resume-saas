"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listAnalyses, listApplications, listJobs, listResumes } from "@/lib/resources";
import { formatDate } from "@/lib/format";
import { Alert, AppIcon, Card, EmptyState, PageHeader, StatusBadge } from "@/components/ui";
import { useAuth } from "@/components/AuthProvider";

const emptyDashboard = {
  resumes: null,
  jobs: null,
  applications: null,
  analyses: null,
};

const sections = [
  { key: "resumes", label: "Resumes", href: "/dashboard/resumes" },
  { key: "jobs", label: "Saved jobs", href: "/dashboard/jobs" },
  { key: "applications", label: "Applications", href: "/dashboard/applications" },
];

const readCollection = (response, collectionKey) => {
  const items = response[collectionKey];
  if (!Array.isArray(items)) {
    throw new Error("The server returned an unexpected response.");
  }

  return {
    items,
    total: Number.isFinite(response.pagination?.total)
      ? response.pagination.total
      : items.length,
  };
};

const summarizeRequest = (result, collectionKey) => {
  if (result.status === "rejected") {
    return { error: "This information couldn’t be loaded. Please try again." };
  }

  try {
    return readCollection(result.value, collectionKey);
  } catch {
    return { error: "This information couldn’t be loaded. Please try again." };
  }
};

function StatCard({ label, value, href, icon }) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-warm-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-burgundy-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-warm-600">{label}</span>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-burgundy-50 text-burgundy-800">
          <AppIcon name={icon} className="h-[18px] w-[18px]" />
        </span>
      </div>
      <p className="mt-5 text-3xl font-semibold tracking-tight text-warm-950">
        {value ?? <span className="inline-block h-8 w-12 animate-pulse rounded bg-warm-100" />}
      </p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-burgundy-800">
        View {label.toLowerCase()}
        <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}

function SectionHeading({ title, href, linkText }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-base font-semibold text-warm-950">{title}</h2>
      <Link href={href} className="text-sm font-medium text-burgundy-800 hover:text-burgundy-950">
        {linkText}
      </Link>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      const results = await Promise.allSettled([
        listResumes({ page: 1, limit: 5 }),
        listJobs({ page: 1, limit: 5 }),
        listApplications({ page: 1, limit: 5 }),
        listAnalyses(),
      ]);

      if (!active) {
        return;
      }

      setDashboard({
        resumes: summarizeRequest(results[0], "resumes"),
        jobs: summarizeRequest(results[1], "jobs"),
        applications: summarizeRequest(results[2], "applications"),
        analyses: summarizeRequest(results[3], "analyses"),
      });
      setLoading(false);
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const firstName = user?.email?.split("@")[0] || "there";
  const recentApplications = dashboard.applications?.items?.slice(0, 5) || [];
  const recentAnalyses = dashboard.analyses?.items?.slice(0, 5) || [];
  const savedJobs = dashboard.jobs?.items || [];
  const savedResumes = dashboard.resumes?.items || [];
  const hasSectionErrors = sections.some((section) => dashboard[section.key]?.error)
    || dashboard.analyses?.error;

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <PageHeader
          eyebrow="Your workspace"
          title={`Welcome back, ${firstName}`}
          description="Manage your applications and prepare for what’s next."
        />
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/resumes" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-warm-200 bg-white px-4 py-2.5 text-sm font-semibold text-warm-800 shadow-sm transition hover:bg-warm-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-burgundy-100">
            <AppIcon name="plus" className="h-4 w-4" />
            Create resume
          </Link>
          <Link href="/dashboard/jobs" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-burgundy-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-px hover:bg-burgundy-500 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-burgundy-100">
            <AppIcon name="plus" className="h-4 w-4" />
            Add a job
          </Link>
        </div>
      </div>

      {hasSectionErrors ? (
        <Alert>
          Some dashboard information is temporarily unavailable. You can retry without losing your session.
          <button
            type="button"
            onClick={() => setReloadKey((current) => current + 1)}
            className="ml-2 font-semibold underline underline-offset-2"
          >
            Try again
          </button>
        </Alert>
      ) : null}

      <section aria-label="Workspace totals" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Resumes"
          value={dashboard.resumes?.total}
          href="/dashboard/resumes"
          icon="resume"
        />
        <StatCard
          label="Saved jobs"
          value={dashboard.jobs?.total}
          href="/dashboard/jobs"
          icon="jobs"
        />
        <StatCard
          label="Applications"
          value={dashboard.applications?.total}
          href="/dashboard/applications"
          icon="applications"
        />
        <StatCard
          label="AI analyses"
          value={dashboard.analyses?.total ?? dashboard.analyses?.items?.length}
          href="/dashboard/applications"
          icon="sparkle"
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <div className="mb-5">
            <SectionHeading
              title="Recent applications"
              href="/dashboard/applications"
              linkText="View applications"
            />
            <p className="mt-1 text-sm text-warm-500">Your latest updates at a glance.</p>
          </div>

          {dashboard.applications?.error ? (
            <p className="rounded-xl bg-warm-50 p-4 text-sm text-warm-600">
              Applications are temporarily unavailable.
            </p>
          ) : loading ? (
            <div className="space-y-3" aria-label="Loading applications">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-14 animate-pulse rounded-xl bg-warm-100" />
              ))}
            </div>
          ) : recentApplications.length ? (
            <ul className="divide-y divide-warm-100">
              {recentApplications.map((application) => {
                const job = savedJobs.find((item) => item.id === application.job_id);
                const resume = savedResumes.find((item) => item.id === application.resume_id);
                return (
                  <li
                    key={application.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-warm-900">
                      {job?.title || "Job application"}
                    </p>
                    <p className="mt-1 truncate text-xs text-warm-500">
                      {[job?.company_name, resume?.title].filter(Boolean).join(" · ")}
                    </p>
                    <p className="mt-1 text-xs text-warm-500">
                      {formatDate(application.applied_at || application.created_at)}
                    </p>
                    </div>
                    <StatusBadge status={application.status} />
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              title="No applications yet"
              text="Once you start tracking roles, your latest applications will appear here."
            />
          )}
        </Card>

        <Card>
          <div className="mb-5">
            <SectionHeading
              title="Recent AI analyses"
              href="/dashboard/applications"
              linkText="View all"
            />
            <p className="mt-1 text-sm text-warm-500">Completed resume and job match reviews.</p>
          </div>

          {dashboard.analyses?.error ? (
            <p className="rounded-xl bg-warm-50 p-4 text-sm text-warm-600">
              AI activity is temporarily unavailable.
            </p>
          ) : loading ? (
            <div className="space-y-3" aria-label="Loading AI analyses">
              {[1, 2].map((item) => (
                <div key={item} className="h-16 animate-pulse rounded-xl bg-warm-100" />
              ))}
            </div>
          ) : recentAnalyses.length ? (
            <ul className="space-y-3">
              {recentAnalyses.map((analysis) => (
                <li
                  key={analysis.id}
                  className="rounded-xl border border-warm-100 bg-warm-50/70 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-warm-900">
                        {analysis.match_score != null
                          ? `${analysis.match_score}% match`
                          : "Resume and job analysis"}
                      </p>
                      <p className="mt-1 text-xs text-warm-500">
                        {formatDate(analysis.created_at)}
                      </p>
                    </div>
                    {analysis.match_score != null ? (
                      <span className="rounded-lg bg-white px-2 py-1 text-xs font-semibold text-burgundy-800">
                        {analysis.match_score}%
                      </span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="No AI analyses yet"
              text="Your completed resume and job match analyses will show here."
            />
          )}
        </Card>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-warm-950">Pick up where you left off</h2>
          <p className="mt-1 text-sm text-warm-500">Jump straight to a part of your job search.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {sections.map((section) => (
            <Link
              key={section.key}
              href={section.href}
              className="flex items-center justify-between rounded-2xl border border-warm-200 bg-white p-4 text-sm font-medium text-warm-800 shadow-sm transition hover:border-burgundy-200 hover:bg-burgundy-50/40"
            >
              <span>{section.label === "Saved jobs" ? "Review saved jobs" : `Open ${section.label.toLowerCase()}`}</span>
              <span className="text-burgundy-800" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}