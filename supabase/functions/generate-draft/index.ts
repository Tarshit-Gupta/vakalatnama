import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

Deno.serve(async (req) => {
  // 1. CORS Preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 2. Validate Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Create Supabase Admin client using standard Edge Function env vars
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get user details to verify token validity
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized: Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const advocateId = user.id;

    // 3. Get advocate's plan (free/premium)
    const { data: advocate, error: planError } = await supabaseAdmin
      .from("advocates")
      .select("plan")
      .eq("id", advocateId)
      .single();

    const plan = planError ? "free" : (advocate?.plan || "free").toLowerCase();

    // 4. Calculate today's date in IST timezone (Asia/Kolkata)
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const parts = formatter.formatToParts(new Date());
    const year = parts.find(p => p.type === "year")?.value;
    const month = parts.find(p => p.type === "month")?.value;
    const day = parts.find(p => p.type === "day")?.value;
    const todayIST = `${year}-${month}-${day}`;

    // 5. Query token_usage table for today
    const { data: usageData, error: usageError } = await supabaseAdmin
      .from("token_usage")
      .select("draft_calls_used")
      .eq("advocate_id", advocateId)
      .eq("usage_date", todayIST)
      .maybeSingle();

    if (usageError) {
      console.error("[Token Usage Query Error]:", usageError);
    }

    const callsUsed = usageData?.draft_calls_used || 0;

    // 6. Enforce limits based on plan
    const freeLimit = 5;
    if (plan === "free" && callsUsed >= freeLimit) {
      return new Response(
        JSON.stringify({ 
          error: "Daily limit reached", 
          message: "You have exceeded your daily limit of 5 drafts on the Free plan. Upgrade to Premium for unlimited drafts." 
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // 7. Parse request payload
    const { caseData } = await req.json().catch(() => ({}));
    if (!caseData) {
      return new Response(JSON.stringify({ error: "Missing caseData in request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 8. Build a lean prompt (exclude empty fields)
    const detailsList = [];
    if (caseData.case_type) detailsList.push(`- Case Type: ${caseData.case_type}`);
    if (caseData.court_level) detailsList.push(`- Court Level: ${caseData.court_level}`);
    if (caseData.plaintiff_name) detailsList.push(`- Plaintiff: ${caseData.plaintiff_name}`);
    if (caseData.defendant_name) detailsList.push(`- Defendant: ${caseData.defendant_name}`);
    if (caseData.incident_date) detailsList.push(`- Incident Date: ${caseData.incident_date}`);
    if (caseData.incident_place) detailsList.push(`- Incident Place: ${caseData.incident_place}`);

    // Truncate facts based on plan word limits
    const maxWords = plan === "premium" ? 2000 : 800;
    const factsText = caseData.facts_text || "";
    const words = factsText.split(/\s+/);
    const truncatedFacts = words.length <= maxWords ? factsText : words.slice(0, maxWords).join(" ");
    detailsList.push(`- Facts: ${truncatedFacts}`);

    if (Array.isArray(caseData.evidence_available) && caseData.evidence_available.length > 0) {
      detailsList.push(`- Evidence Available: ${caseData.evidence_available.join(", ")}`);
    }
    if (caseData.relief_sought) detailsList.push(`- Relief Sought: ${caseData.relief_sought}`);
    if (Array.isArray(caseData.applicable_acts) && caseData.applicable_acts.length > 0) {
      detailsList.push(`- Applicable Acts Hinted: ${caseData.applicable_acts.join(", ")}`);
    }

    const caseDetailsStr = detailsList.join("\n");

    const prompt = `
You are an expert Indian legal assistant with deep knowledge of IPC, CrPC, 
CPC, Indian Evidence Act, and all Special Acts.

Given the following case details, do exactly two things:

CASE DETAILS:
${caseDetailsStr}

TASK 1 — Identify all applicable laws:
List every relevant section from IPC, CrPC, CPC, Evidence Act, 
and any Special Acts. For each, give exact section number and 
one-line explanation of why it applies to this case.

TASK 2 — Draft a formal legal petition:
Write a complete formal petition in standard Indian court format.

Respond ONLY in this exact JSON format, no extra text, no markdown:
{
  "identified_laws": [
    {
      "section": "Section 420",
      "act": "Indian Penal Code",
      "explanation": "Cheating and dishonestly inducing delivery of property"
    }
  ],
  "draft_text": "IN THE COURT OF...\\n\\nfull petition here..."
}

The draft_text must include:
1. Cause Title (IN THE COURT OF [court_level], [incident_place])
2. Case type heading
3. Most Respectfully Showeth:
4. Numbered facts paragraphs
5. Grounds (citing identified sections)
6. Prayer Clause
7. Place and Date line
8. Verification clause
`;

    // 9. Call Gemini API (gemini-3.1-flash-lite fallback due to 404 on 1.5-pro free keys)
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY") ?? "";
    if (!geminiApiKey) {
      return new Response(JSON.stringify({ error: "Gemini API key is not configured in Edge Function secrets" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const maxOutputTokens = plan === "premium" ? 4096 : 1500;
    const modelName = "gemini-3.1-flash-lite"; // Diagnosed and verified available under this project key

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: maxOutputTokens,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error("[Gemini API Error]:", errText);
      return new Response(JSON.stringify({ error: "Gemini API request failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const geminiData = await geminiResponse.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return new Response(JSON.stringify({ error: "Empty content returned by AI model" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 10. Parse Response JSON (Strip code fences)
    let parsed;
    try {
      const cleaned = rawText.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("[Gemini JSON Parse Error]:", parseErr, "\nRaw output:", rawText);
      return new Response(JSON.stringify({ error: "AI response format error, please try again" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 11. Update token_usage table (upsert)
    const nextCallsUsed = callsUsed + 1;
    const { error: upsertError } = await supabaseAdmin
      .from("token_usage")
      .upsert({
        advocate_id: advocateId,
        usage_date: todayIST,
        draft_calls_used: nextCallsUsed
      }, {
        onConflict: "advocate_id,usage_date"
      });

    if (upsertError) {
      console.error("[Token Usage Upsert Error]:", upsertError);
    }

    // 12. Insert audit_log entry
    const { error: logError } = await supabaseAdmin
      .from("audit_log")
      .insert({
        advocate_id: advocateId,
        action: "generate_draft",
        case_id: caseData.id || null,
        meta: {
          plan,
          calls_used_today: nextCallsUsed,
          model: modelName
        }
      });

    if (logError) {
      console.error("[Audit Log Insert Error]:", logError);
    }

    // 13. Return success payload
    const draftsRemaining = plan === "free" ? Math.max(0, freeLimit - nextCallsUsed) : Infinity;

    return new Response(
      JSON.stringify({
        identified_laws: parsed.identified_laws,
        draft_text: parsed.draft_text,
        meta: {
          plan,
          drafts_used_today: nextCallsUsed,
          drafts_remaining: draftsRemaining
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (err) {
    console.error("[Edge Function Exception]:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
