"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Loader2, ArrowLeft, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function VerifyContent() {
  const [resending, setResending] = useState(false);
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  async function handleResend() {
    if (!email) {
      toast.error("No email address found", {
        description: "Please go back and enter your email again.",
      });
      return;
    }

    setResending(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setResending(false);

    if (error) {
      if (error.message.includes("rate") || error.status === 429) {
        toast.error("Too many requests", {
          description: "Please wait a moment before trying again.",
        });
        return;
      }

      toast.error("Failed to resend link", {
        description: error.message,
      });
      return;
    }

    toast.success("Magic link sent!", {
      description: "Check your inbox for the new link.",
    });
  }

  return (
    <>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-7 w-7 text-primary" />
        </div>
        <CardTitle className="text-2xl">Check your email</CardTitle>
        <CardDescription>
          We sent a magic link to{" "}
          <span className="font-medium text-foreground">{email || "your email"}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
          <p>Click the link in the email to sign in. The link will expire in 1 hour.</p>
          <p className="mt-2">
            If you don&apos;t see the email, check your spam folder.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            onClick={handleResend}
            disabled={resending || !email}
            className="w-full"
          >
            {resending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Resend magic link
              </>
            )}
          </Button>

          <Button variant="ghost" asChild className="w-full">
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Link>
          </Button>
        </div>
      </CardContent>
    </>
  );
}

function VerifyContentFallback() {
  return (
    <>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-7 w-7 text-primary" />
        </div>
        <CardTitle className="text-2xl">Check your email</CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-48 mx-auto" />
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </>
  );
}

export default function VerifyPage() {
  return (
    <Card>
      <Suspense fallback={<VerifyContentFallback />}>
        <VerifyContent />
      </Suspense>
    </Card>
  );
}
