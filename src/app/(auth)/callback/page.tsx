"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const errorParam = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      // Handle errors from Supabase
      if (errorParam) {
        console.error("[Auth Callback] Error from Supabase:", errorParam, errorDescription);
        router.push(`/login?error=${errorParam}&error_description=${encodeURIComponent(errorDescription || "Authentication failed")}`);
        return;
      }

      if (!code) {
        console.error("[Auth Callback] No code provided");
        router.push("/login?error=missing_code&error_description=" + encodeURIComponent("Invalid authentication link. Please request a new one."));
        return;
      }

      try {
        console.log("[Auth Callback] Exchanging code for session...");
        const supabase = createClient();

        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          console.error("[Auth Callback] Exchange error:", exchangeError.message);
          router.push(`/login?error=auth_callback_failed&error_description=${encodeURIComponent(exchangeError.message)}`);
          return;
        }

        console.log("[Auth Callback] Session exchange successful, redirecting to /jobs");

        // Small delay to ensure cookies are set
        await new Promise(resolve => setTimeout(resolve, 100));

        // Redirect to jobs page
        router.push("/jobs");
      } catch (err) {
        console.error("[Auth Callback] Unexpected error:", err);
        const message = err instanceof Error ? err.message : "An unexpected error occurred";
        setError(message);
        router.push(`/login?error=unexpected_error&error_description=${encodeURIComponent(message)}`);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-destructive">Authentication failed: {error}</p>
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Completing sign in...</p>
    </div>
  );
}

function CallbackFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<CallbackFallback />}>
      <CallbackHandler />
    </Suspense>
  );
}
