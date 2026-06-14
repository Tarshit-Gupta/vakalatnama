import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

// ── IST date helper (shared pattern with generate-draft) ─────────────
function getTodayIST(): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric", month: "2-digit", day: "2-digit",
  });
  const parts = formatter.formatToParts(new Date());
  const year  = parts.find(p => p.type === "year")?.value;
  const month = parts.find(p => p.type === "month")?.value;
  const day   = parts.find(p => p.type === "day")?.value;
  return `${year}-${month}-${day}`;
}

// ── Prompt builder per fieldName ─────────────────────────────────────
function buildPrompt(fieldName: string, fieldValue: string, ctx: Record<string, string>): string {
  switch (fieldName) {

    case "complete_case_analysis": {
      const caseData = typeof fieldValue === "string" ? JSON.parse(fieldValue) : fieldValue;
      return `You are a senior Indian advocate with 20+ years of experience. Analyze this complete case and provide structured recommendations.

COMPLETE CASE DETAILS:
Case Type Selected: ${caseData.case_type || "Not selected"}
Court Level Selected: ${caseData.court_level || "Not selected"}
Plaintiff: ${caseData.plaintiff_name || "Not provided"}
Defendant: ${caseData.defendant_name || "Not provided"}
Incident Date: ${caseData.incident_date || "Not provided"}
Incident Place: ${caseData.incident_place || "Not provided"}
Evidence Available: ${Array.isArray(caseData.evidence_available) ? caseData.evidence_available.join(", ") : (caseData.evidence_available || "None specified")}

Facts of the Case:
${caseData.facts_text || "Not provided"}

Relief Sought:
${caseData.relief_sought || "Not provided"}

Applicable Acts Selected: ${Array.isArray(caseData.applicable_acts) ? caseData.applicable_acts.join(", ") : (caseData.applicable_acts || "None selected")}

Provide a thorough legal analysis. Consider:
1. Is the case type correct or would another jurisdiction make the case stronger?
2. Is the court level appropriate?
3. Are the facts complete and legally sufficient?
4. Is the relief sought appropriate and complete?
5. Are the applicable acts correct and complete?

Respond ONLY in this exact JSON (no markdown, no extra text):
{
  "overall_strength": "strong/moderate/weak",
  "overall_summary": "one paragraph assessment of the case",
  "case_type": {
    "current": "${caseData.case_type || ""}",
    "is_correct": true,
    "recommended": ["${caseData.case_type || ""}"],
    "reasoning": "explanation of case type assessment",
    "has_suggestion": false
  },
  "court_level": {
    "current": "${caseData.court_level || ""}",
    "is_correct": true,
    "recommended": "${caseData.court_level || ""}",
    "reasoning": "explanation of court level assessment",
    "has_suggestion": false
  },
  "facts_analysis": {
    "completeness_score": 75,
    "strong_points": ["point1", "point2"],
    "missing_critical": [
      {
        "detail": "description of missing detail",
        "importance": "high",
        "why_needed": "explanation of why this is needed"
      }
    ],
    "has_suggestion": true
  },
  "relief_analysis": {
    "current_assessment": "incomplete",
    "missing_relief": [
      {
        "relief": "name of relief",
        "why_add": "why this relief should be added",
        "append_text": "exact text to append to relief sought"
      }
    ],
    "has_suggestion": false
  },
  "acts_analysis": {
    "selected_correct": true,
    "missing_acts": [
      {
        "act": "Act Name",
        "section": "Section number",
        "why_applies": "explanation"
      }
    ],
    "incorrect_acts": [],
    "has_suggestion": false
  }
}`;
    }

    case "case_type":
      return `You are an expert Indian legal assistant.
Given these case facts: ${ctx.facts_text || "Not provided"}
The advocate selected case type: ${fieldValue}
Analyze if this is the correct case type or if others also apply.
Respond ONLY in this exact JSON (no markdown, no extra text):
{
  "is_correct": true,
  "suggestion": "brief explanation",
  "recommended_types": ["Criminal"],
  "confidence": "high"
}`;

    case "facts_text":
      return `You are an expert Indian legal assistant.
Review these case facts: ${fieldValue}
Case type: ${ctx.case_type || "Unknown"}
Identify any missing critical information an advocate should include in this type of case.
Respond ONLY in this exact JSON (no markdown, no extra text):
{
  "missing_details": ["detail1", "detail2"],
  "suggestion": "what to add and why",
  "completeness_score": 75
}`;

    case "relief_sought":
      return `You are an expert Indian legal assistant.
For a ${ctx.case_type || "legal"} case with these facts: ${ctx.facts_text || "Not provided"}
Current relief sought: ${fieldValue}
Suggest additional or better relief options under Indian law.
Respond ONLY in this exact JSON (no markdown, no extra text):
{
  "current_assessment": "good",
  "suggested_additions": ["addition1", "addition2"],
  "explanation": "why these additions help"
}`;

    case "applicable_acts":
      return `You are an expert Indian legal assistant.
For a ${ctx.case_type || "legal"} case:
Facts: ${ctx.facts_text || "Not provided"}
Selected acts/sections: ${fieldValue}
Are these correct? What additional acts or sections apply?
Respond ONLY in this exact JSON (no markdown, no extra text):
{
  "selected_assessment": "correct",
  "missing_acts": ["Act 1 - Section X", "Act 2 - Section Y"],
  "explanation": "why these acts apply to this case"
}`;

    default:
      return `You are an expert Indian legal assistant.
Field: ${fieldName}
Value: ${fieldValue}
Context: ${JSON.stringify(ctx)}
Provide a brief legal suggestion.
Respond ONLY in this exact JSON (no markdown, no extra text):
{
  "suggestion": "brief helpful suggestion",
  "explanation": "why this helps"
}`;
  }
}

// ── Get max tokens based on field name ───────────────────────────────
function getMaxTokens(fieldName: string): number {
  return fieldName === "complete_case_analysis" ? 1000 : 500;
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── 1. Auth ──────────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseUrl        = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabaseAdmin      = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const advocateId = user.id;

    // ── 2. Plan check ────────────────────────────────────────────────
    const { data: advocate } = await supabaseAdmin
      .from("advocates")
      .select("plan")
      .eq("id", advocateId)
      .single();

    const plan = (advocate?.plan || "free").toLowerCase();

    if (plan !== "premium") {
      return new Response(
        JSON.stringify({
          error: "PREMIUM_REQUIRED",
          message: "AI Assist is available for Premium users only. Upgrade to unlock this feature.",
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 3. Usage check (10 assist calls/day for premium) ─────────────
    const todayIST = getTodayIST();
    const { data: usageData } = await supabaseAdmin
      .from("token_usage")
      .select("assist_calls_used")
      .eq("advocate_id", advocateId)
      .eq("date", todayIST)
      .maybeSingle();

    const assistsUsed = usageData?.assist_calls_used ?? 0;
    const assistLimit = 10;

    if (assistsUsed >= assistLimit) {
      return new Response(
        JSON.stringify({
          error: "LIMIT_REACHED",
          message: `You have used all ${assistLimit} AI assists for today. Resets at midnight IST.`,
          assists_used: assistsUsed,
          assists_limit: assistLimit,
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const nearLimit = assistsUsed >= assistLimit - 3; // warn when 3 or fewer remain

    // ── 4. Parse body ────────────────────────────────────────────────
    const body = await req.json().catch(() => ({}));
    const { fieldName, fieldValue, caseContext } = body;

    if (!fieldName || fieldValue === undefined) {
      return new Response(
        JSON.stringify({ error: "Missing fieldName or fieldValue in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 5. Build prompt & call Gemini ────────────────────────────────
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY") ?? "";
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: "Gemini API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt    = buildPrompt(fieldName, String(fieldValue), caseContext || {});
    const modelName = "gemini-3.1-flash-lite";
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: getMaxTokens(fieldName) },
      }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error("[AI Assist Gemini Error]:", errText);
      return new Response(
        JSON.stringify({ error: "Gemini API request failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiData = await geminiResponse.json();
    const rawText    = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return new Response(
        JSON.stringify({ error: "Empty content returned by AI model" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let parsed: Record<string, unknown>;
    try {
      const cleaned = rawText.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("[AI Assist Parse Error] Raw:", rawText);
      return new Response(
        JSON.stringify({ error: "AI response format error, please try again" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 6. Update token_usage ────────────────────────────────────────
    const nextAssistsUsed = assistsUsed + 1;
    await supabaseAdmin.from("token_usage").upsert(
      {
        advocate_id:       advocateId,
        date:              todayIST,
        assist_calls_used: nextAssistsUsed,
      },
      { onConflict: "advocate_id,date" }
    );

    // ── 7. Audit log ─────────────────────────────────────────────────
    await supabaseAdmin.from("audit_logs").insert({
      advocate_id: advocateId,
      action:      "ai_assist",
      metadata: {
        field_name:        fieldName,
        assists_used_today: nextAssistsUsed,
        model:             modelName,
      },
    });

    // ── 8. Return result ─────────────────────────────────────────────
    return new Response(
      JSON.stringify({
        result:           parsed,
        field_name:       fieldName,
        assists_used:     nextAssistsUsed,
        assists_remaining: Math.max(0, assistLimit - nextAssistsUsed),
        near_limit:       nearLimit,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("[AI Assist Exception]:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
