import { redirect } from "next/navigation";

// This page is no longer needed with Google OAuth
// Redirect to login page
export default function VerifyPage() {
  redirect("/login");
}
