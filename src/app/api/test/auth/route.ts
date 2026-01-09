import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Test authentication API endpoint.
 * Only available in development/test environments.
 *
 * Creates a test session for Playwright E2E tests.
 */
export async function POST(request: Request) {
  // Only allow in development/test mode
  if (
    process.env.NODE_ENV === "production" &&
    !process.env.ALLOW_TEST_AUTH
  ) {
    return NextResponse.json(
      { error: "Test auth not available in production" },
      { status: 403 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: "Missing Supabase configuration" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { email, role = "field" } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Create admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if test user exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    let userId: string | undefined;
    const existingUser = existingUsers?.users?.find((u) => u.email === email);

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create test user
      const { data: newUser, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: {
            name: `Test ${role === "admin" ? "Admin" : "User"}`,
          },
        });

      if (createError) {
        return NextResponse.json(
          { error: createError.message },
          { status: 500 }
        );
      }

      userId = newUser?.user?.id;
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Failed to get user ID" },
        { status: 500 }
      );
    }

    // Update profile role if needed
    await supabaseAdmin
      .from("profiles")
      .update({ role })
      .eq("id", userId);

    // Generate a session link for the test user
    const { data: linkData, error: linkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email,
      });

    if (linkError || !linkData?.properties?.hashed_token) {
      return NextResponse.json(
        { error: linkError?.message || "Failed to generate link" },
        { status: 500 }
      );
    }

    // Exchange the token for a session
    const regularClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

    const { data: sessionData, error: verifyError } =
      await regularClient.auth.verifyOtp({
        token_hash: linkData.properties.hashed_token,
        type: "magiclink",
      });

    if (verifyError || !sessionData?.session) {
      return NextResponse.json(
        { error: verifyError?.message || "Failed to create session" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      user: {
        id: sessionData.user?.id,
        email: sessionData.user?.email,
        role,
      },
      session: {
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
        expires_at: sessionData.session.expires_at,
      },
    });
  } catch (error) {
    console.error("Test auth error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Delete test user
 */
export async function DELETE(request: Request) {
  // Only allow in development/test mode
  if (
    process.env.NODE_ENV === "production" &&
    !process.env.ALLOW_TEST_AUTH
  ) {
    return NextResponse.json(
      { error: "Test auth not available in production" },
      { status: 403 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: "Missing Supabase configuration" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Create admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Find user by email
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    const user = users?.users?.find((u) => u.email === email);

    if (user) {
      await supabaseAdmin.auth.admin.deleteUser(user.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Test user deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
