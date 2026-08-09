import { getAuth } from "@/app/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    return (
      <main style={{ maxWidth: "400px", margin: "80px auto", padding: "0 20px", fontFamily: "system-ui, sans-serif" }}>
        <h1 style={{ fontSize: "1.75rem", marginBottom: "1.5rem" }}>Email Verification</h1>
        <p style={{ fontSize: "0.875rem", color: "#666" }}>No verification token provided.</p>
      </main>
    );
  }

  const auth = getAuth();

  try {
    const result = await auth.api.verifyEmail({
      query: { token },
    });

    if (result?.status) {
      return (
        <main style={{ maxWidth: "400px", margin: "80px auto", padding: "0 20px", fontFamily: "system-ui, sans-serif" }}>
          <h1 style={{ fontSize: "1.75rem", marginBottom: "1.5rem" }}>Email Verified</h1>
          <p style={{ fontSize: "0.875rem", color: "#16a34a" }}>Your email has been verified successfully.</p>
          <p style={{ marginTop: "1rem", fontSize: "0.875rem" }}>
            <a href="/login" style={{ color: "#2563eb" }}>Sign in</a>
          </p>
        </main>
      );
    }
  } catch {
    // Fall through to error display
  }

  return (
    <main style={{ maxWidth: "400px", margin: "80px auto", padding: "0 20px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "1.5rem" }}>Verification Failed</h1>
      <p style={{ fontSize: "0.875rem", color: "#dc2626" }}>
        The verification token is invalid or has expired. Please request a new verification email.
      </p>
    </main>
  );
}
