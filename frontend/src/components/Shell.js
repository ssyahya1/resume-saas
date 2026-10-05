"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { useNotifications } from "./NotificationsProvider";
import { AppIcon, Button } from "./ui";

const links = [
  { href: "/dashboard", label: "Overview", icon: "overview" },
  { href: "/dashboard/resumes", label: "Resumes", icon: "resume" },
  { href: "/dashboard/jobs", label: "Jobs", icon: "jobs" },
  { href: "/dashboard/applications", label: "Applications", icon: "applications" },
  { href: "/dashboard/ai/analyze", label: "AI tools", icon: "sparkle" },
];

function SidebarLink({ link, active, onNavigate }) {
  return (
    <Link
      href={link.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`group flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "border-burgundy-600 bg-burgundy-50/70 pl-[10px] text-burgundy-900"
          : "border-transparent text-warm-600 hover:bg-warm-50 hover:text-warm-950"
      }`}
    >
      <AppIcon
        name={link.icon}
        className={`h-[18px] w-[18px] ${active ? "text-burgundy-800" : "text-warm-400 group-hover:text-warm-600"}`}
      />
      {link.label}
      {link.label === "AI tools" ? (
        <span className="ml-auto rounded-md bg-white px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-burgundy-800 ring-1 ring-burgundy-100">
          AI
        </span>
      ) : null}
    </Link>
  );
}

export default function Shell({ children }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { connected, events, dismiss, clear } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  useEffect(() => {
    if (!mobileMenuOpen && !notificationsOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        setNotificationsOpen(false);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileMenuOpen, notificationsOpen]);

  const isActive = (link) =>
    link.label === "AI tools"
      ? pathname.startsWith("/dashboard/ai")
      : link.href === "/dashboard"
        ? pathname === link.href
        : pathname.startsWith(link.href);

  const handleLogout = async () => {
    setSigningOut(true);
    setLogoutError("");
    try {
      await logout();
    } catch {
      setLogoutError("We couldn’t sign you out. Please try again.");
      setSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-page)] lg:pl-[260px]">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-warm-200 bg-white px-4 py-5 transition-transform duration-200 lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
        aria-label="Main navigation"
      >
        <Link href="/dashboard" className="flex items-center gap-3 px-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-burgundy-600 text-xs font-bold tracking-tight text-white shadow-sm shadow-burgundy-900/15">
            AR
          </span>
          <span>
            <span className="block text-sm font-semibold tracking-tight text-warm-950">Applyroom</span>
            <span className="mt-0.5 block text-xs text-warm-500">Career workspace</span>
          </span>
        </Link>

        <div className="mt-9 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-warm-400">
          Workspace
        </div>
        <nav className="mt-2 space-y-1">
          {links.map((link) => (
            <SidebarLink
              key={link.href}
              link={link}
              active={isActive(link)}
              onNavigate={() => setMobileMenuOpen(false)}
            />
          ))}
        </nav>

        <div className="mt-auto">
          <div className="mb-4 rounded-xl border border-warm-100 bg-warm-50/80 p-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-burgundy-100 text-xs font-semibold uppercase text-burgundy-900">
                {user?.email?.slice(0, 1) || "A"}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-medium text-warm-800">{user?.email || "Your account"}</span>
                <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-warm-500">
                  <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-green-500" : "bg-amber-400"}`} />
                  {connected ? "Updates connected" : "Updates reconnecting"}
                </span>
              </span>
            </div>
          </div>
          {logoutError ? <p className="mb-2 px-2 text-xs text-red-700">{logoutError}</p> : null}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 px-3 text-warm-600"
            onClick={handleLogout}
            disabled={signingOut}
          >
            <AppIcon name="logout" className="h-[18px] w-[18px] text-warm-400" />
            {signingOut ? "Signing out…" : "Sign out"}
          </Button>
          <p className="mt-4 px-3 text-[10px] text-warm-400">A little more focus for what’s next.</p>
        </div>
      </aside>

      <button
        type="button"
        aria-label="Close navigation"
        aria-hidden={!mobileMenuOpen}
        tabIndex={mobileMenuOpen ? 0 : -1}
        className={`fixed inset-0 z-30 bg-warm-950/25 transition-opacity duration-200 lg:hidden ${
          mobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <header className="sticky top-0 z-20 border-b border-warm-200/80 bg-white/90 backdrop-blur lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="grid h-9 w-9 place-items-center rounded-lg text-warm-600 hover:bg-warm-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-700"
            >
              <AppIcon name={mobileMenuOpen ? "close" : "menu"} className="h-5 w-5" />
            </button>
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-burgundy-600 text-[10px] font-bold text-white">AR</span>
              <span className="text-sm font-semibold text-warm-950">Applyroom</span>
            </Link>
          </div>
          <button
            type="button"
            aria-label={`Notifications${events.length ? `, ${events.length} updates` : ""}`}
            aria-expanded={notificationsOpen}
            onClick={() => setNotificationsOpen((open) => !open)}
            className="relative grid h-9 w-9 place-items-center rounded-lg text-warm-600 hover:bg-warm-100"
          >
            <AppIcon name="bell" className="h-5 w-5" />
            {events.length > 0 ? <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-burgundy-600 ring-2 ring-white" /> : null}
          </button>
        </div>
      </header>

      <div className="hidden h-14 items-center justify-end border-b border-warm-200/70 bg-white/70 px-8 lg:flex">
        <span className={`mr-4 inline-flex items-center gap-2 text-xs ${connected ? "text-burgundy-800" : "text-warm-500"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-green-500" : "bg-amber-400"}`} />
          {connected ? "Live updates" : "Reconnecting"}
        </span>
        <button
          type="button"
          aria-expanded={notificationsOpen}
          onClick={() => setNotificationsOpen((open) => !open)}
          className="relative inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-warm-600 hover:bg-warm-100 hover:text-warm-900"
        >
          <AppIcon name="bell" className="h-[18px] w-[18px]" />
          Notifications
          {events.length > 0 ? (
            <span className="rounded-full bg-burgundy-100 px-1.5 py-0.5 text-[10px] font-semibold text-burgundy-900">
              {events.length}
            </span>
          ) : null}
        </button>
      </div>

      {notificationsOpen ? (
        <section className="menu-enter fixed right-4 top-[4.5rem] z-50 w-[min(380px,calc(100vw-2rem))] rounded-2xl border border-warm-200 bg-white p-4 shadow-xl lg:right-8 lg:top-16" aria-label="Notifications">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-warm-950">Notifications</h2>
              <p className="mt-0.5 text-xs text-warm-500">Updates from your workspace</p>
            </div>
            <div className="flex items-center gap-3">
              {events.length ? (
                <button className="text-xs font-medium text-burgundy-800 hover:underline" type="button" onClick={clear}>Clear all</button>
              ) : null}
              <button type="button" aria-label="Close notifications" onClick={() => setNotificationsOpen(false)} className="rounded-md p-1 text-warm-400 hover:bg-warm-100 hover:text-warm-700">
                <AppIcon name="close" className="h-4 w-4" />
              </button>
            </div>
          </div>
          {events.length === 0 ? (
            <div className="rounded-xl bg-warm-50 px-4 py-7 text-center">
              <AppIcon name="bell" className="mx-auto h-5 w-5 text-warm-400" />
              <p className="mt-2 text-sm font-medium text-warm-800">You’re all caught up</p>
              <p className="mt-1 text-xs text-warm-500">Important updates will appear here.</p>
            </div>
          ) : (
            <ul className="max-h-[55vh] space-y-2 overflow-y-auto">
              {events.map((event, index) => (
                <li key={`${event.jobId || event.type}-${index}`} className="flex items-start justify-between gap-3 rounded-xl border border-warm-100 p-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold capitalize text-warm-900">
                      {(event.type || "Update").replace(/-/g, " ")}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-warm-600">{event.message || "An update is available."}</p>
                  </div>
                  <button className="shrink-0 rounded-md p-1 text-warm-400 hover:bg-warm-100 hover:text-warm-700" type="button" aria-label="Dismiss notification" onClick={() => dismiss(index)}>
                    <AppIcon name="close" className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-9">
        <div key={pathname} className="page-enter">{children}</div>
      </main>
    </div>
  );
}
