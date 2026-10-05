import Link from "next/link";
import AuthLayout from "@/components/AuthLayout";

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      eyebrow="Account help"
      title="Password reset"
      description="Finish updating the password for your account."
      footer={<Link href="/login" className="font-semibold text-burgundy-800 hover:underline">Back to sign in</Link>}
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          Password reset completion isn’t available yet: the configured backend currently sends reset links but does not expose a password-update endpoint. For safety, this page does not read or store tokens in the browser.
        </div>
        <p className="text-sm leading-6 text-warm-600">
          Ask the service administrator to enable the existing password reset flow, then request a new reset link.
        </p>
      </div>
    </AuthLayout>
  );
}
