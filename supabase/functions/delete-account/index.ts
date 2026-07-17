import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Validate Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");

    // 2. Admin client (service role — can delete auth users)
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 3. Verify the caller's JWT and get their user ID
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;

    // 4. Delete all user data in order (foreign keys: consents → drafts → cases/clients → token_usage → audit_logs → advocates)
    await supabaseAdmin.from("consents").delete().eq("advocate_id", userId);
    await supabaseAdmin.from("audit_logs").delete().eq("advocate_id", userId);
    await supabaseAdmin.from("drafts").delete().eq("advocate_id", userId);
    await supabaseAdmin.from("cases").delete().eq("advocate_id", userId);
    await supabaseAdmin.from("clients").delete().eq("advocate_id", userId);
    await supabaseAdmin.from("token_usage").delete().eq("advocate_id", userId);
    await supabaseAdmin.from("advocates").delete().eq("id", userId);

    // 5. Delete the auth user — this is the irreversible step
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error("[delete-account] auth.admin.deleteUser failed:", deleteError.message);
      return new Response(JSON.stringify({ error: "Failed to delete auth user", detail: deleteError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[delete-account] Successfully deleted user ${userId}`);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[delete-account] Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
