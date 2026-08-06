import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAuth } from "@/app/lib/auth";
import { registerAction } from "@/app/lib/auth-actions";

export const dynamic = "force-dynamic";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    redirect("/admin");
  }

  const params = await searchParams;
  const error = params.error;
  const registrationMode = process.env.AUTH_REGISTRATION_MODE ?? "invite_only";

  if (registrationMode === "disabled") {
    return (
      <main style={{ maxWidth: "400px", margin: "80px auto", padding: "0 20px", fontFamily: "system-ui, sans-serif" }}>
        <h1 style={{ fontSize: "1.75rem", marginBottom: "1.5rem" }}>Registration Unavailable</h1>
        <p style={{ fontSize: "0.875rem", color: "#666" }}>Registration is currently disabled.</p>
      </main>
    );
  }

  if (registrationMode === "invite_only") {
    return (
      <main style={{ maxWidth: "400px", margin: "80px auto", padding: "0 20px", fontFamily: "system-ui, sans-serif" }}>
        <h1 style={{ fontSize: "1.75rem", marginBottom: "1.5rem" }}>Invite Only</h1>
        <p style={{ fontSize: "0.875rem", color: "#666" }}>
          Registration is invite-only. An invitation is required to create an account.
        </p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: "400px", margin: "80px auto", padding: "0 20px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "1.5rem" }}>Create Account</h1>
      {error && (
        <p style={{ fontSize: "0.875rem", color: "#dc2626", marginBottom: "1rem" }}>{error}</p>
      )}
      <form action={registerAction} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.875rem" }}>
          Display Name
          <input type="text" name="name" required style={{ padding: "8px 12px", border: "1px solid #ccc", borderRadius: "4px" }} />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.875rem" }}>
          Email
          <input type="email" name="email" required style={{ padding: "8px 12px", border: "1px solid #ccc", borderRadius: "4px" }} />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.875rem" }}>
          Password (minimum 12 characters)
          <input type="password" name="password" required minLength={12} style={{ padding: "8px 12px", border: "1px solid #ccc", borderRadius: "4px" }} />
        </label>
        <button type="submit" style={{ padding: "10px 16px", background: "#2563eb", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.95rem" }}>
          Register
        </button>
      </form>
      <p style={{ marginTop: "1rem", fontSize: "0.875rem" }}>
        Already have an account? <a href="/login" style={{ color: "#2563eb" }}>Sign In</a>
      </p>
    </main>
  );
}
