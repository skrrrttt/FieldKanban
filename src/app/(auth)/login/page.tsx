"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Loader2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle error messages from callback
  useEffect(() => {
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (error) {
      toast.error("Authentication failed", {
        description: errorDescription || "Please try again.",
      });
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timed out")), 15000);
      });

      const authPromise = supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          // Use client-side callback page for PKCE flow
          emailRedirectTo: `${window.location.origin}/callback`,
        },
      });

      const { error } = await Promise.race([authPromise, timeoutPromise]) as { error: { message: string; status?: number } | null };

      if (error) {
        // Handle rate limiting specifically
        if (error.message.includes("rate") || error.status === 429) {
          toast.error("Too many requests", {
            description: "Please wait a moment before trying again.",
          });
          return;
        }

        toast.error("Failed to send magic link", {
          description: error.message,
        });
        return;
      }

      // Success - redirect to verify page
      router.push(`/verify?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } catch (err) {
      console.error("Auth error:", err);
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      toast.error("Failed to send magic link", {
        description: message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            disabled={loading}
            autoComplete="email"
            autoFocus
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending magic link...
          </>
        ) : (
          "Continue with Email"
        )}
      </Button>
    </form>
  );
}

function LoginFormFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>
          Enter your email to receive a magic link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">No password needed</p>
              <p className="mt-1">
                We&apos;ll send you a secure link to sign in. Check your spam folder
                if you don&apos;t see it.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
