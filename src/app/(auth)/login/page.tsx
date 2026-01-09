"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type LoginIntent = "user" | "admin";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

interface LoginFormProps {
  intent: LoginIntent;
}

function LoginForm({ intent }: LoginFormProps) {
  const [loading, setLoading] = useState(false);
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

  async function handleGoogleSignIn() {
    setLoading(true);

    try {
      const supabase = createClient();

      // Store intent in localStorage (query params get lost during OAuth flow)
      localStorage.setItem("login_intent", intent);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/callback`,
        },
      });

      if (error) {
        console.error("OAuth error:", error);
        toast.error("Failed to sign in", {
          description: error.message,
        });
        setLoading(false);
      }
      // If successful, the page will redirect to Google
    } catch (err) {
      console.error("Auth error:", err);
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      toast.error("Failed to sign in", {
        description: message,
      });
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Button
        type="button"
        variant="outline"
        className="w-full h-12 text-base"
        onClick={handleGoogleSignIn}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            <GoogleIcon className="mr-2 h-5 w-5" />
            Continue with Google
          </>
        )}
      </Button>
    </div>
  );
}

function LoginFormFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

const LOGIN_CONTENT = {
  user: {
    title: "Sign in to FieldKanban",
    description: "View your assigned jobs and update task status",
  },
  admin: {
    title: "Admin Sign In",
    description: "Manage jobs, users, and settings for your organization",
  },
};

export default function LoginPage() {
  const [intent, setIntent] = useState<LoginIntent>("user");
  const content = LOGIN_CONTENT[intent];

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center pb-2">
        <Tabs
          value={intent}
          onValueChange={(value) => setIntent(value as LoginIntent)}
          className="w-full mb-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="user">User</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>
        </Tabs>
        <CardTitle className="text-2xl">{content.title}</CardTitle>
        <CardDescription>{content.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm intent={intent} />
        </Suspense>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By signing in, you agree to our terms of service and privacy policy.
        </p>
      </CardContent>
    </Card>
  );
}
