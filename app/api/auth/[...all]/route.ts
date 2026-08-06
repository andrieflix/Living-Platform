import { getAuth } from "@/app/lib/auth";

async function handle(req: Request) {
  const url = new URL(req.url);

  // Block direct Better Auth sign-up — registration must go through
  // the registerUser use case (server action) to enforce:
  // - AUTH_REGISTRATION_MODE
  // - Platform User creation
  // - UserRegistered event emission
  if (url.pathname.endsWith("/sign-up/email") && req.method === "POST") {
    return new Response(
      JSON.stringify({ error: "Direct sign-up is not allowed. Use /register." }),
      { status: 403, headers: { "Content-Type": "application/json" } },
    );
  }

  const auth = getAuth();
  return auth.handler(req);
}

export const GET = handle;
export const POST = handle;
