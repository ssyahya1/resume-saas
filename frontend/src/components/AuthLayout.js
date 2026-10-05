import Link from "next/link";

export default function AuthLayout({ eyebrow, title, description, children, footer }) {
  return (
    <main className="grid min-h-screen bg-[var(--color-page)] lg:grid-cols-[1fr_0.9fr]">
      <section className="hidden flex-col justify-between border-r border-warm-200 bg-warm-100 p-10 text-[var(--color-text)] lg:flex xl:p-14">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-burgundy-600 text-sm font-semibold text-white">AR</span>
          <span className="text-base font-semibold">Applyroom</span>
        </Link>
        <div className="max-w-lg">
          <p className="text-sm font-medium text-burgundy-700">A calmer job search starts here</p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight">
            Build stronger job applications with AI.
          </h2>
          <p className="mt-5 text-base leading-7 text-warm-700">
            Keep your resumes, applications, and next steps organized in one private workspace.
          </p>
        </div>
        <p className="text-xs text-warm-600">Your workspace is yours. Your account is protected.</p>
      </section>
      <section className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-10 inline-flex items-center gap-3 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-burgundy-600 text-xs font-semibold text-white">AR</span>
            <span className="font-semibold text-warm-950">Applyroom</span>
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-burgundy-800">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-warm-950">{title}</h1>
          {description ? <p className="mt-2 text-sm leading-6 text-warm-600">{description}</p> : null}
          <div className="mt-7 rounded-2xl border border-warm-200 bg-white p-6 shadow-sm sm:p-8">
            {children}
          </div>
          {footer ? <div className="mt-5 text-center text-sm text-warm-600">{footer}</div> : null}
        </div>
      </section>
    </main>
  );
}
