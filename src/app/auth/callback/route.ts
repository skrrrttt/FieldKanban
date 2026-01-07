import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/jobs";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Handle OAuth/magic link errors from Supabase
  if (error) {
    console.error("[Auth Callback] Error from Supabase:", error, errorDescription);
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("error", error);
    if (errorDescription) {
      loginUrl.searchParams.set("error_description", errorDescription);
    }
    return NextResponse.redirect(loginUrl);
  }

  if (code) {
    const cookieStore = await cookies();

    // Create Supabase client that will set cookies on the cookieStore
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      console.log("[Auth Callback] Session exchange successful, redirecting to:", next);

      // Successful authentication - redirect to intended destination
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      let redirectUrl: string;
      if (isLocalEnv) {
        redirectUrl = `${origin}${next}`;
      } else if (forwardedHost) {
        redirectUrl = `https://${forwardedHost}${next}`;
      } else {
        redirectUrl = `${origin}${next}`;
      }

      // Redirect - cookies are already set on the cookieStore
      return NextResponse.redirect(redirectUrl);
    }

    // Exchange failed - redirect to login with error
    console.error("[Auth Callback] Exchange failed:", exchangeError.message);
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("error", "auth_callback_failed");
    loginUrl.searchParams.set(
      "error_description",
      exchangeError.message || "Failed to sign in. Please try again."
    );
    return NextResponse.redirect(loginUrl);
  }

  // No code provided - redirect to login
  console.warn("[Auth Callback] No code provided");
  const loginUrl = new URL("/login", origin);
  loginUrl.searchParams.set("error", "missing_code");
  loginUrl.searchParams.set(
    "error_description",
    "Invalid authentication link. Please request a new one."
  );
  return NextResponse.redirect(loginUrl);
}
