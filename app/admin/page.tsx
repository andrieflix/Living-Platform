import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAuth } from "@/app/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  const user = session.user;

  return (
    <main style={{ maxWidth: "600px", margin: "80px auto", padding: "0 20px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "1.5rem" }}>Admin</h1>
      <div style={{ padding: "20px", border: "1px solid #e5e7eb", borderRadius: "8px", background: "#f9fafb" }}>
        <p style={{ fontSize: "0.875rem", color: "#374151", marginBottom: "8px" }}>
          <strong>Signed in as:</strong> {user.name}
        </p>
        <p style={{ fontSize: "0.875rem", color: "#374151", marginBottom: "8px" }}>
          <strong>Email:</strong> {user.email}
        </p>
        <p style={{ fontSize: "0.75rem", color: user.emailVerified ? "#16a34a" : "#d97706", marginBottom: "16px" }}>
          {user.emailVerified ? "Email verified" : "Email not verified"}
        </p>
        <form action="/api/auth/sign-out" method="POST">
          <button
            type="submit"
            style={{
              padding: "8px 16px",
              background: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Sign Out
          </button>
        </form>
      </div>
    </main>
  );
}
