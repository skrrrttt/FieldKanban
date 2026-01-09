import { test as setup, expect } from "@playwright/test";

const TEST_USER_EMAIL = "test-user@fieldkanban.test";
const TEST_USER_ROLE = "admin"; // Use admin for full feature testing

setup("authenticate", async ({ page }) => {
  // Call test auth API to get session
  const response = await page.request.post("/api/test/auth", {
    data: {
      email: TEST_USER_EMAIL,
      role: TEST_USER_ROLE,
    },
  });

  // Check if the test auth endpoint is available
  if (!response.ok()) {
    const errorBody = await response.text();
    console.error("Test auth failed:", errorBody);

    // If test auth is not configured, skip setup
    // Tests will need to handle unauthenticated state
    if (response.status() === 500 && errorBody.includes("Missing Supabase configuration")) {
      console.warn("Supabase service key not configured. Skipping auth setup.");
      console.warn("Set SUPABASE_SERVICE_ROLE_KEY in .env.local for authenticated tests.");
      return;
    }

    throw new Error(`Auth setup failed: ${errorBody}`);
  }

  const authData = await response.json();

  // Navigate to the app to set up localStorage and cookies
  await page.goto("/");

  // Set up Supabase auth storage
  // Supabase stores auth in localStorage with a specific key
  const supabaseKey = `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split("//")[1]?.split(".")[0]}-auth-token`;

  await page.evaluate(
    ({ key, session }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at,
          token_type: "bearer",
        })
      );
    },
    { key: supabaseKey, session: authData.session }
  );

  // Reload to apply the session
  await page.reload();

  // Verify we're logged in by checking for redirect to /jobs
  await expect(page).toHaveURL(/\/jobs/);

  // Save storage state for reuse
  await page.context().storageState({ path: "tests/.auth/user.json" });
});
