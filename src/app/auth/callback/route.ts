import { NextResponse } from "next/server";

/**
 * Legacy auth callback route - redirects to client-side callback page.
 * The PKCE code_verifier is stored by the browser Supabase client,
 * so the code exchange must happen client-side.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  // Forward all query params to the client-side callback page
  const callbackUrl = new URL("/callback", origin);

  // Copy all search params
  searchParams.forEach((value, key) => {
    callbackUrl.searchParams.set(key, value);
  });

  console.log("[Auth Callback Route] Redirecting to client-side callback:", callbackUrl.toString());

  return NextResponse.redirect(callbackUrl);
}
