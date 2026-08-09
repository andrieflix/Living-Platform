"use server";
import "server-only";
import { redirect } from "next/navigation";
import { getComposition } from "@/app/lib/composition";

export async function registerAction(formData: FormData) {
  const composition = getComposition();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("name") ?? "");

  const result = await composition.registerUser(
    { email, password, displayName },
    composition.registerUserDeps,
  );

  if (!result.ok) {
    const msg = result.error.message;
    redirect(`/register?error=${encodeURIComponent(msg)}`);
  }

  redirect("/admin");
}

export async function signInAction(formData: FormData) {
  // Sign-in goes through Better Auth directly — no Platform User creation needed.
  // The session is managed by Better Auth's cookie-based flow.
  const composition = getComposition();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const result = await composition.authenticationPort.signInWithEmail({ email, password });

  if (!result.ok) {
    const msg = result.error.message;
    redirect(`/login?error=${encodeURIComponent(msg)}`);
  }

  // Better Auth handles cookie setting via the route handler.
  // The sign-in form posts to /api/auth/sign-in/email directly.
  redirect("/admin");
}

export async function signOutAction() {
  const composition = getComposition();
  // Better Auth's sign-out endpoint handles cookie clearing.
  // We redirect there via the route handler.
  redirect("/api/auth/sign-out");
}
