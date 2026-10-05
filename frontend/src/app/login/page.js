"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import AuthLayout from "@/components/AuthLayout";
import { Alert, Button, inputClass, PasswordField } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const email = form.email.trim();
    if (!email) {
      setError("Email is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!form.password) {
      setError("Password is required.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api("/api/auth/login", { method: "POST", body: JSON.stringify(form) });
      router.replace("/dashboard");
    } catch (requestError) {
      setError(requestError.message || "We couldn’t sign you in. Check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to Applyroom"
      description="Pick up where you left off and keep your job search moving."
      footer={<>New to Applyroom? <Link href="/register" className="font-semibold text-burgundy-800 hover:underline">Create an account</Link></>}
    >
      <form className="space-y-4" onSubmit={submit} noValidate>
        {error ? <Alert>{error}</Alert> : null}
        <div className="block space-y-1.5 text-sm">
          <label htmlFor="email" className="block font-medium text-warm-700">Email address</label>
          <input id="email" className={inputClass} name="email" type="email" autoComplete="email" required value={form.email} onChange={update} />
        </div>
        <PasswordField id="password" autoComplete="current-password" minLength={8} required value={form.password} onChange={update} />
        <div className="text-right">
          <Link href="/forgot-password" className="text-sm font-medium text-burgundy-800 hover:underline">Forgot password?</Link>
        </div>
        <Button className="w-full" type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Button>
      </form>
    </AuthLayout>
  );
}
