"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppIcon } from "@/components/ui";

const navigation = [
  ["Features", "#features"],
  ["How it works", "#how-it-works"],
  ["AI tools", "#ai-tools"],
];

const features = [
  ["resume", "Resume management", "Create, upload, edit, and keep tailored versions of your resume together."],
  ["jobs", "Job analysis", "Understand how your experience lines up with an opportunity."],
  ["sparkle", "Resume tailoring", "Create a focused resume version for the role you want."],
  ["applications", "Cover letters", "Draft job-specific letters from your application materials."],
  ["sparkle", "Interview preparation", "Practice with questions based on the opportunity."],
  ["overview", "Application tracking", "Keep roles, resumes, and application status organized."],
];

const steps = [
  ["Add your resume", "Create or upload your resume and keep versions in one place."],
  ["Save a job", "Keep the opportunity and its details ready for your next step."],
  ["Analyze and improve", "Use AI assistance to review fit and prepare tailored materials."],
  ["Track your progress", "Keep each application and its status close at hand."],
];

function Brand({ compact = false }) {
  return (
    <Link href="/" className="inline-flex items-center gap-3" aria-label="Applyroom home">
      <span className={`grid place-items-center rounded-xl bg-burgundy-600 font-semibold text-white ${compact ? "h-9 w-9 text-xs" : "h-10 w-10 text-sm"}`}>AR</span>
      <span className="font-semibold tracking-tight text-warm-950">Applyroom</span>
    </Link>
  );
}

function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="absolute -inset-4 rounded-[2rem] bg-burgundy-100/60 blur-2xl" aria-hidden="true" />
      <div className="relative overflow-hidden rounded-2xl border border-warm-200 bg-white shadow-xl shadow-warm-900/10">
        <div className="flex items-center justify-between border-b border-warm-200 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-burgundy-600 text-[10px] font-bold text-white">AR</span>
            <div>
              <p className="text-sm font-semibold text-warm-950">Applyroom</p>
              <p className="text-xs text-warm-500">Application workspace</p>
            </div>
          </div>
          <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-800">Ready to review</span>
        </div>
        <div className="grid gap-4 bg-warm-50/70 p-4 sm:grid-cols-[1fr_0.9fr] sm:p-5">
          <section className="rounded-xl border border-warm-200 bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-warm-500">Resume match</p>
                <p className="mt-1 text-sm font-semibold text-warm-950">Product Designer</p>
              </div>
              <span className="text-2xl font-semibold tracking-tight text-burgundy-700">82%</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-warm-100">
              <div className="h-full w-[82%] rounded-full bg-burgundy-600" />
            </div>
            <div className="mt-5 border-t border-warm-100 pt-4">
              <p className="text-xs font-semibold text-warm-800">Strengths</p>
              <ul className="mt-2 space-y-2 text-xs text-warm-600">
                <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-green-600" />Relevant product experience</li>
                <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-green-600" />Clear cross-functional work</li>
              </ul>
            </div>
          </section>
          <section className="rounded-xl border border-warm-200 bg-white p-4">
            <p className="text-xs font-medium text-warm-500">Your application</p>
            <p className="mt-1 text-sm font-semibold text-warm-950">Northstar · Product Designer</p>
            <div className="mt-4 space-y-3">
              {[["Resume", "Product design · v3"], ["Status", "Interview"], ["Next step", "Prepare questions"]].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-2 border-t border-warm-100 pt-3 first:border-0 first:pt-0">
                  <span className="text-xs text-warm-500">{label}</span>
                  <span className="text-right text-xs font-medium text-warm-800">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-burgundy-50 p-2.5 text-xs text-burgundy-900">
              <AppIcon name="sparkle" className="h-4 w-4 shrink-0" />
              Suggestions ready to review
            </div>
          </section>
        </div>
        <p className="border-t border-warm-200 px-5 py-3 text-[11px] text-warm-500">Illustrative product preview · sample content, not user data</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--color-page)]">
      <header className="sticky top-0 z-30 border-b border-warm-200/80 bg-[var(--color-page)]/95 backdrop-blur">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Brand />
          <nav aria-label="Main navigation" className="hidden items-center gap-7 md:flex">
            {navigation.map(([label, href]) => (
              <a key={label} href={href} className="text-sm font-medium text-warm-600 transition hover:text-burgundy-700">{label}</a>
            ))}
            <Link href="/login" className="text-sm font-medium text-warm-700 transition hover:text-burgundy-700">Sign in</Link>
            <Link href="/register" className="rounded-lg bg-burgundy-600 px-4 py-2.5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-px hover:bg-burgundy-500 active:scale-[0.98]">Get started</Link>
          </nav>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-lg text-warm-700 transition hover:bg-warm-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-600 md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-marketing-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <AppIcon name={menuOpen ? "close" : "menu"} />
          </button>
        </div>
        {menuOpen ? (
          <nav id="mobile-marketing-menu" aria-label="Mobile navigation" className="menu-enter border-t border-warm-200 bg-white px-5 py-4 shadow-lg md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-1">
              {navigation.map(([label, href]) => (
                <a key={label} href={href} onClick={closeMenu} className="rounded-lg px-3 py-3 text-sm font-medium text-warm-700 hover:bg-warm-50 hover:text-burgundy-700">{label}</a>
              ))}
              <div className="mt-2 flex gap-3 border-t border-warm-100 pt-3">
                <Link href="/login" onClick={closeMenu} className="flex-1 rounded-lg border border-warm-200 px-3 py-2.5 text-center text-sm font-medium text-warm-800">Sign in</Link>
                <Link href="/register" onClick={closeMenu} className="flex-1 rounded-lg bg-burgundy-600 px-3 py-2.5 text-center text-sm font-semibold text-white">Get started</Link>
              </div>
            </div>
          </nav>
        ) : null}
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-20 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14 lg:py-24">
        <div className="hero-enter">
          <p className="inline-flex items-center gap-2 rounded-full border border-burgundy-200 bg-white px-3 py-1.5 text-xs font-semibold text-burgundy-800">
            <span className="h-2 w-2 rounded-full bg-burgundy-600" />
            AI-powered job applications
          </p>
          <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-[1.08] tracking-tight text-warm-950 sm:text-5xl lg:text-[3.65rem]">
            Build stronger job applications with AI.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-warm-600 sm:text-lg sm:leading-8">
            Analyze job descriptions, improve your resume, create tailored applications, and keep your job search organized — all in one place.
          </p>
          <div className="hero-enter hero-enter-delay-1 mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="inline-flex min-h-12 items-center justify-center rounded-lg bg-burgundy-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-px hover:bg-burgundy-500 active:scale-[0.98]">
              Get started
              <AppIcon name="arrow" className="ml-2 h-4 w-4" />
            </Link>
            <Link href="/login" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-warm-200 bg-white px-5 py-3 text-sm font-semibold text-warm-800 transition duration-200 hover:-translate-y-px hover:bg-warm-50 active:scale-[0.98]">
              Sign in
            </Link>
          </div>
          <p className="mt-4 text-xs text-warm-500">Your account and saved work stay private to you.</p>
        </div>
        <div className="hero-enter hero-enter-delay-2">
          <ProductPreview />
        </div>
      </section>

      <section aria-label="Applyroom benefits" className="border-y border-warm-200 bg-warm-100/70">
        <div className="mx-auto grid max-w-7xl gap-7 px-5 py-9 sm:px-8 md:grid-cols-3 md:gap-10 md:py-11">
          {[
            ["One workspace", "Keep resumes, jobs, and applications organized."],
            ["AI assistance", "Understand how your resume fits an opportunity."],
            ["Better prepared", "Tailor materials and plan your next step."],
          ].map(([title, description], index) => (
            <article key={title} className="flex gap-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-sm font-semibold text-burgundy-700 ring-1 ring-warm-200">0{index + 1}</span>
              <div>
                <h2 className="text-sm font-semibold text-warm-950">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-warm-600">{description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="features" className="scroll-mt-24 mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-burgundy-700">Your job search, in one place</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-warm-950 sm:text-4xl">Everything you need to apply with confidence.</h2>
          <p className="mt-4 text-base leading-7 text-warm-600">A practical workspace for your application materials, opportunities, and preparation.</p>
        </div>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(([icon, title, description]) => (
            <article key={title} className="rounded-xl border border-warm-200 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-burgundy-200 hover:shadow-md sm:p-6">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-burgundy-50 text-burgundy-700">
                <AppIcon name={icon} className="h-[18px] w-[18px]" />
              </span>
              <h3 className="mt-5 text-base font-semibold text-warm-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-warm-600">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="ai-tools" className="scroll-mt-24 border-y border-warm-200 bg-warm-100/70">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold text-burgundy-700">Thoughtful assistance, when you need it</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-warm-950 sm:text-4xl">AI that helps you apply smarter.</h2>
            <p className="mt-4 text-base leading-7 text-warm-600">Get a clearer view of job fit, focus your resume, draft a cover letter, and prepare for interviews — using the materials already in your workspace.</p>
            <Link href="/register" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-burgundy-700 hover:text-burgundy-800">
              Explore your workspace <AppIcon name="arrow" className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-xl border border-warm-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-start gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-burgundy-50 text-burgundy-700"><AppIcon name="sparkle" /></span>
              <div>
                <p className="text-sm font-semibold text-warm-950">Your application, considered from every angle.</p>
                <p className="mt-1 text-sm leading-6 text-warm-600">Review your strengths, spot relevant skills to address, and get practical suggestions grounded in the role.</p>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {["Review job fit", "Improve your resume", "Prepare for interviews"].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-lg bg-warm-50 px-3 py-3 text-xs font-medium text-warm-700">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-burgundy-600" />{item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-24 mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-burgundy-700">A clear process</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-warm-950 sm:text-4xl">Make progress one opportunity at a time.</h2>
        </div>
        <ol className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(([title, description], index) => (
            <li key={title} className="border-t-2 border-burgundy-200 pt-4">
              <span className="text-sm font-semibold text-burgundy-700">0{index + 1}</span>
              <h3 className="mt-4 text-base font-semibold text-warm-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-warm-600">{description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-burgundy-800 px-6 py-8 text-white sm:px-10 sm:py-10 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Ready to build better applications?</h2>
            <p className="mt-3 text-sm leading-6 text-white/80 sm:text-base">Bring your resumes, opportunities, and AI-powered application tools into one workspace.</p>
          </div>
          <div className="flex w-full flex-wrap gap-3 md:w-auto">
            <Link href="/register" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-burgundy-800 transition hover:bg-burgundy-50">Get started</Link>
            <Link href="/login" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Sign in</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-warm-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <Brand compact />
            <p className="mt-2 max-w-sm text-xs leading-5 text-warm-500">An AI-powered workspace for building stronger job applications.</p>
          </div>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-warm-600">
            <a href="#features" className="hover:text-burgundy-700">Features</a>
            <a href="#how-it-works" className="hover:text-burgundy-700">How it works</a>
            <Link href="/login" className="hover:text-burgundy-700">Sign in</Link>
            <Link href="/register" className="hover:text-burgundy-700">Get started</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
