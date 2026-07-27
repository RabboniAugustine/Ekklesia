// Edge Function: invite-team-member
//
// Creates a new Supabase Auth user via admin.inviteUserByEmail (which sends
// them a real invite email so they can set their own password - the app
// never handles or transmits passwords for other people), then creates
// their profiles row linked to the inviting admin's church.
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
    const { email, fullName, role } = await req.json();

    if (!email || !fullName || !role) {
      return jsonResponse({ error: "email, fullName, and role are required" }, 400);
    }
    if (!VALID_ROLES.includes(role)) {
      return jsonResponse({ error: "Invalid role" }, 400);
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
      return jsonResponse({ error: "Only admins, pastors, or super admins can invite team members" }, 403);
    }

    // Service-role client for the privileged operations below. Never
    // exposed to the browser - only exists inside this server function.
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email);
    if (inviteError || !inviteData.user) {
      return jsonResponse({ error: inviteError?.message ?? "Could not send invite" }, 400);
    }

    // Upsert rather than insert: some Supabase projects have a trigger that
    // auto-creates a bare profiles row whenever a new auth.users row
    // appears. If that's the case here, a plain insert would collide with
    // it. Upserting on id handles both cases - a fresh insert if no row
    // exists yet, or filling in the correct church_id/role/name if one
    // already got created.
    const { error: upsertError } = await adminClient.from("profiles").upsert({
      id: inviteData.user.id,
      church_id: callerProfile.church_id,
      full_name: fullName,
      email,
      role,
      is_active: true,
    });

    if (upsertError) {
      // Only roll back the auth user for genuine failures (e.g. bad role
      // value), not ones caused by a pre-existing row we just handled above.
      await adminClient.auth.admin.deleteUser(inviteData.user.id);
      return jsonResponse({ error: upsertError.message }, 400);
    }

    return jsonResponse({ success: true, userId: inviteData.user.id });
  } catch (err) {
    return jsonResponse({ error: String(err) }, 500);
  }
});
