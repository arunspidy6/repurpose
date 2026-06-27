// Supabase Edge Function: generate
// Turns one source into platform-native outputs using OpenAI. The API key lives
// only here (server-side). Auth is enforced via the caller's JWT, and the free
// monthly limit is checked server-side so it can't be bypassed by the client.
//
// Deploy:  supabase functions deploy generate
// Secret:  supabase secrets set OPENAI_API_KEY=sk-...

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FREE_MONTHLY_LIMIT = 10;
const OPENAI_MODEL = "gpt-4o-mini";

const PLATFORM_SPEC: Record<string, { name: string; instruction: string }> = {
  tiktok: {
    name: "TikTok caption",
    instruction: "A punchy TikTok caption: 2-3 short lines, a strong first line, end with 3 niche hashtags.",
  },
  instagram: {
    name: "Instagram caption",
    instruction: "An Instagram feed caption: a scroll-stopping first line, 3-5 lines of value, one save/follow CTA, end with 4 relevant hashtags.",
  },
  reels: {
    name: "Reels script + caption",
    instruction: "An Instagram Reels package: a HOOK (0:00-0:03) line, a one-line CAPTION, then 3 hashtags. Use the bracketed labels.",
  },
  shorts: {
    name: "Shorts script",
    instruction: "A 20-25s vertical video script with explicit beats: HOOK (0:00-0:03), BEAT 1, BEAT 2, CTA. Use the exact bracketed labels.",
  },
  x: {
    name: "X thread",
    instruction: "A 5-7 post X/Twitter thread, numbered 1/, 2/, 3/... Tight lines, one idea per post, ends with a follow CTA.",
  },
  linkedin: {
    name: "LinkedIn post",
    instruction: "A LinkedIn post: strong opening line, generous line breaks, story arc (situation -> system -> lesson), end with one open question.",
  },
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, message: "Method not allowed" }, 405);

  // Auth: build a client scoped to the caller's JWT so RLS + auth.uid() apply.
  const authHeader = req.headers.get("Authorization") ?? "";
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return json({ ok: false, reason: "unauthorized" }, 401);

  let body: { title?: string; sourceType?: string; sourceText?: string; platforms?: string[]; voice?: string };
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, message: "Invalid JSON body" }, 400);
  }

  const sourceText = (body.sourceText ?? "").trim();
  const platforms = (body.platforms ?? []).filter((p) => PLATFORM_SPEC[p]);
  if (!sourceText) return json({ ok: false, message: "Source text is required" }, 400);
  if (sourceText.length > 50_000) return json({ ok: false, message: "Source text is too long" }, 400);
  if (!platforms.length) return json({ ok: false, message: "Pick at least one platform" }, 400);

  // Free-tier limit: count this user's repurposes since the start of the month.
  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);
  const { count } = await supabase
    .from("repurposes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", start.toISOString());
  if ((count ?? 0) >= FREE_MONTHLY_LIMIT) {
    return json({ ok: false, reason: "limit_reached", used: count, limit: FREE_MONTHLY_LIMIT }, 402);
  }

  // Brand voice (optional) from the profile.
  const { data: profile } = await supabase
    .from("profiles")
    .select("brand_voice")
    .eq("id", user.id)
    .maybeSingle();
  const brandVoice = (profile?.brand_voice ?? "").trim();

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) return json({ ok: false, message: "AI is not configured (missing OPENAI_API_KEY)" }, 500);

  const platformsBlock = platforms
    .map((p) => `- "${p}" (${PLATFORM_SPEC[p].name}): ${PLATFORM_SPEC[p].instruction}`)
    .join("\n");

  const system = `You are a senior content strategist who repurposes one source idea into platform-native variations for creators.

Rules:
- Match each platform's native voice and length conventions exactly.
- Never invent facts not present in the source. If a metric or detail is missing, write around it.
- Plain text only. No markdown headers, no asterisks for bold, no code fences.
- Use line breaks for readability.${brandVoice ? `\n\nBRAND VOICE (match this exactly):\n${brandVoice}` : ""}`;

  const userPrompt = `SOURCE TYPE: ${body.sourceType ?? "idea"}
SOURCE TITLE: ${body.title || "(untitled)"}

SOURCE CONTENT:
"""
${sourceText}
"""

Generate one output per platform key below. Return a single JSON object whose keys are exactly these platform ids and whose values are the generated text (string). No other keys, no commentary.

PLATFORMS:
${platformsBlock}`;

  let aiResp: Response;
  try {
    aiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });
  } catch (e) {
    return json({ ok: false, message: `AI request failed: ${(e as Error).message}` }, 502);
  }

  if (aiResp.status === 429) return json({ ok: false, reason: "rate_limited" }, 429);
  if (!aiResp.ok) {
    const text = await aiResp.text().catch(() => "");
    return json({ ok: false, message: `AI ${aiResp.status}: ${text.slice(0, 300)}` }, 502);
  }

  const aiJson = await aiResp.json();
  const content = aiJson?.choices?.[0]?.message?.content ?? "";
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(content);
  } catch {
    return json({ ok: false, message: "Model returned invalid JSON" }, 502);
  }

  const outputs: Record<string, string> = {};
  for (const p of platforms) {
    const v = parsed[p];
    if (typeof v === "string" && v.trim()) outputs[p] = v.trim();
  }
  if (!Object.keys(outputs).length) {
    return json({ ok: false, message: "Model returned no usable outputs" }, 502);
  }

  // Persist (RLS guarantees it's written as this user).
  const title = body.title?.trim() || sourceText.slice(0, 60);
  const { data: row, error } = await supabase
    .from("repurposes")
    .insert({
      user_id: user.id,
      title,
      source_type: body.sourceType ?? "idea",
      source_text: sourceText,
      platforms,
      outputs,
      voice: body.voice ?? null,
    })
    .select("id")
    .single();
  if (error) return json({ ok: false, message: error.message }, 500);

  return json({ ok: true, id: row.id, outputs });
});
