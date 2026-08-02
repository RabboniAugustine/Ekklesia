// Edge Function: create-team-member
//
// Creates a new Supabase Auth user with a password the admin sets directly
// (email_confirm: true, so no confirmation email/redirect-URL step is
// needed at all), then creates their profiles row linked to the admin's
// church. The admin is responsible for sharing the password with the
// person some other way; they should change it themselves afterward via
// My Account.
//
// Deploy with the Supabase CLI:
//   supabase functions deploy invite-team-member
//
// No extra secrets to configure - SUPABASE_URL, SUPABASE_ANON_KEY, and
// SUPABASE_SERVICE_ROLE_KEY are automatically available to every Edge
// Function in your project.

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_ROLES = ["super_admin", "admin", "pastor"];
const VALID_ROLES = ["super_admin", "pastor", "admin", "usher", "finance", "ministry_leader"];

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, fullName, role, password } = await req.json();

    if (!email || !fullName || !role || !password) {
      return jsonResponse({ error: "email, fullName, role, and password are required" }, 400);
    }
    if (!VALID_ROLES.includes(role)) {
      return jsonResponse({ error: "Invalid role" }, 400);
    }
    if (String(password).length < 8) {
      return jsonResponse({ error: "Password must be at least 8 characters" }, 400);
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Not authenticated" }, 401);
    }

    // Client scoped to the caller's own JWT - RLS applies normally here,
    // so this can only ever read the caller's own profile.
    const callerClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await callerClient.auth.getUser();
    if (userError || !user) {
      return jsonResponse({ error: "Not authenticated" }, 401);
    }

    const { data: callerProfile, error: profileError } = await callerClient
      .from("profiles")
      .select("church_id, role")
      .eq("id", user.id)
      .single();

    if (profileError || !callerProfile) {
      return jsonResponse({ error: "Could not verify your profile" }, 403);
    }

    if (!ADMIN_ROLES.includes(callerProfile.role)) {
      return jsonResponse({ error: "Only admins, pastors, or super admins can create team member accounts" }, 403);
    }

    // Service-role client for the privileged operations below. Never
    // exposed to the browser - only exists inside this server function.
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    let userId: string;
    let isNewAuthUser = false;

    if (createError || !createData.user) {
      // If this email already has an auth account (e.g. left over from an
      // earlier attempt), don't fail - find that account, link/update its
      // profile, and set the password below so the credentials shown to
      // the admin always actually work.
      const { data: existingUsersPage, error: listError } = await adminClient.auth.admin.listUsers();
      const existingUser = !listError
        ? existingUsersPage.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
        : null;

      if (!existingUser) {
        return jsonResponse({ error: createError?.message ?? "Could not create the account" }, 400);
      }
      userId = existingUser.id;

      // Explicitly (re)set the password and confirm the email on the found
      // account. Without this, the admin sees a "success" screen with a
      // password that was never actually applied to the account - which is
      // exactly the bug that caused "Invalid email or password" here.
      const { error: updateError } = await adminClient.auth.admin.updateUserById(userId, {
        password,
        email_confirm: true,
      });
      if (updateError) {
        return jsonResponse({ error: updateError.message }, 400);
      }
    } else {
      userId = createData.user.id;
      isNewAuthUser = true;
    }

    // Upsert rather than insert: some Supabase projects have a trigger that
    // auto-creates a bare profiles row whenever a new auth.users row
    // appears. If that's the case here, a plain insert would collide with
    // it. Upserting on id handles both cases - a fresh insert if no row
    // exists yet, or filling in the correct church_id/role/name if one
    // already got created.
    const { error: upsertError } = await adminClient.from("profiles").upsert({
      id: userId,
      church_id: callerProfile.church_id,
      full_name: fullName,
      email,
      role,
      is_active: true,
    });

    if (upsertError) {
      // Only roll back a brand-new auth user we just created this call -
      // never delete an account that already existed before this request.
      if (isNewAuthUser) {
        await adminClient.auth.admin.deleteUser(userId);
      }
      return jsonResponse({ error: upsertError.message }, 400);
    }

    return jsonResponse({ success: true, userId });
  } catch (err) {
    return jsonResponse({ error: String(err) }, 500);
  }
});
