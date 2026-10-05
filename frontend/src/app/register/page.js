"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "@/lib/auth";
import AuthLayout from "@/components/AuthLayout";
import { Alert, Button, Field, inputClass, PasswordField } from "@/components/ui";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullname: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(false);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Your passwords don’t match.");
      return;
    }
    setLoading(true);
    try {
      await register({ fullname: form.fullname, email: form.email, password: form.password });
      setRegistered(true);
      window.setTimeout(() => router.replace("/login"), 1500);
    } catch (requestError) {
      setError(requestError.message || "Your account couldn’t be created. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your workspace"
      description="A little structure can make your next opportunity easier to pursue."
      footer={<>Already have an account? <Link href="/login" className="font-semibold text-burgundy-800 hover:underline">Sign in</Link></>}
    >
      {registered ? (
        <Alert tone="success">Your account is ready. Taking you to sign in…</Alert>
      ) : (
        <form className="space-y-4" onSubmit={submit}>
          {error ? <Alert>{error}</Alert> : null}
          <Field label="Full name">
            <input className={inputClass} name="fullname" autoComplete="name" maxLength={100} value={form.fullname} onChange={update} />
          </Field>
          <Field label="Email address">
            <input className={inputClass} name="email" type="email" autoComplete="email" required value={form.email} onChange={update} />
          </Field>
          <PasswordField id="password" autoComplete="new-password" minLength={8} required value={form.password} onChange={update} />
          <PasswordField id="confirmPassword" label="Confirm password" autoComplete="new-password" minLength={8} required value={form.confirmPassword} onChange={update} />
          <Button className="w-full" type="submit" disabled={loading}>{loading ? "Creating account…" : "Create account"}</Button>
          <p className="text-center text-xs leading-5 text-warm-500">By creating an account, you agree to use Applyroom responsibly and keep your sign-in details private.</p>
        </form>
      )}
    </AuthLayout>
  );
}
