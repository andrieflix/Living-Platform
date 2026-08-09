import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAuth } from "@/app/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    redirect("/admin");
  }

  return (
    <main style={{ maxWidth: "400px", margin: "80px auto", padding: "0 20px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "1.5rem" }}>Sign In</h1>
      <form action="/api/auth/sign-in/email" method="POST" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.875rem" }}>
          Email
          <input type="email" name="email" required style={{ padding: "8px 12px", border: "1px solid #ccc", borderRadius: "4px" }} />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.875rem" }}>
          Password
          <input type="password" name="password" required style={{ padding: "8px 12px", border: "1px solid #ccc", borderRadius: "4px" }} />
        </label>
        <button type="submit" style={{ padding: "10px 16px", background: "#2563eb", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.95rem" }}>
          Sign In
        </button>
      </form>
      <p style={{ marginTop: "1rem", fontSize: "0.875rem" }}>
        Don&apos;t have an account? <a href="/register" style={{ color: "#2563eb" }}>Register</a>
      </p>
    </main>
  );
}
