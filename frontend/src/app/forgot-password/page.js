"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/lib/auth";
import AuthLayout from "@/components/AuthLayout";
import { Alert, Button, Field, inputClass } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (requestError) {
      setError(requestError.message || "We couldn’t request a password reset. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Account help"
      title="Reset your password"
      description="Enter the email address for your account and we’ll send a reset link if it’s registered."
      footer={<Link href="/login" className="font-semibold text-burgundy-800 hover:underline">Back to sign in</Link>}
    >
      {sent ? (
        <div className="space-y-4">
          <Alert tone="success">If an account exists with that email, a password reset link has been sent.</Alert>
          <p className="text-sm leading-6 text-warm-600">
            Check your inbox and follow the link. If the link takes you to a page that cannot complete the reset, the backend’s password update route needs to be enabled.
          </p>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={submit}>
          {error ? <Alert>{error}</Alert> : null}
          <Field label="Email address">
            <input className={inputClass} type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </Field>
          <Button className="w-full" type="submit" disabled={loading}>{loading ? "Sending…" : "Send reset link"}</Button>
        </form>
      )}
    </AuthLayout>
  );
}
