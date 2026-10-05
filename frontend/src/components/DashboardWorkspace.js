"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "./AuthProvider";
import { NotificationsProvider } from "./NotificationsProvider";
import Shell from "./Shell";
import { Button } from "./ui";

function WorkspaceContent({ children }) {
  const router = useRouter();
  const { user, loading, authError, refreshUser } = useAuth();
  const [retrying, setRetrying] = useState(false);

  const retryAuthentication = async () => {
    setRetrying(true);

    try {
      const currentUser = await refreshUser();
      if (!currentUser) {
        router.replace("/login");
      }
    } catch {
      // AuthProvider keeps the user-facing verification error in context.
    } finally {
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center px-5">
        <div className="flex items-center gap-3 text-sm text-warm-600" role="status">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-burgundy-700 border-t-transparent" />
          Checking your account…
        </div>
      </main>
    );
  }

  if (authError) {
    return (
      <main className="grid min-h-screen place-items-center px-5">
        <div className="w-full max-w-md rounded-2xl border border-warm-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-warm-950">Can’t load your workspace</h1>
          <p className="mt-2 text-sm text-warm-600">{authError}</p>
          <Button className="mt-5" onClick={retryAuthentication} disabled={retrying}>
            {retrying ? "Trying again…" : "Try again"}
          </Button>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <NotificationsProvider>
      <Shell>{children}</Shell>
    </NotificationsProvider>
  );
}

export default function DashboardWorkspace({ children }) {
  return (
    <AuthProvider>
      <WorkspaceContent>{children}</WorkspaceContent>
    </AuthProvider>
  );
}
