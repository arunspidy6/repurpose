import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { StripeEnv } from "@/lib/stripe.server";
import { FREE_MONTHLY_LIMIT } from "@/lib/payments.functions";

// keep in sync with PLATFORMS in src/routes/index.tsx
const PLATFORM_SPEC: Record<string, { name: string; instruction: string }> = {
  hooks: { name: "Hook variations", instruction: "Five distinct scroll-stopping opening hooks, numbered 1-5. Each on its own line. End with one short line suggesting which hook fits which audience." },
  shorts: { name: "Shorts script", instruction: "A 20-25 second vertical video script with explicit beats: HOOK (0:00-0:03), BEAT 1, BEAT 2, CTA. Use the exact bracketed labels." },
  reel: { name: "Reel caption", instruction: "An Instagram Reels caption: 2-4 short lines, one save/follow CTA, end with 3-4 relevant hashtags." },
  tiktok: { name: "TikTok caption", instruction: "A TikTok caption: punchy 2-3 lines, no emojis unless natural, end with 3 niche hashtags." },
  captionvariants: { name: "Caption variants", instruction: "Four labeled alternative caption angles (VARIANT A - Punchy, VARIANT B - Story, VARIANT C - Question, VARIANT D - Value-first). Each 2-4 lines." },
  remix: { name: "Trend remix", instruction: "Four trending short-form video formats this idea could be remixed into. Each starts with FORMAT - <name> and a one-sentence treatment." },
  abtest: { name: "A/B versions", instruction: "Two hook-swap A/B variants of the same core post (VERSION A - Contrarian, VERSION B - Result-first) plus a one-line TEST PLAN." },
  xthread: { name: "X thread", instruction: "A 5-7 post X/Twitter thread, numbered 1/, 2/, 3/... Tight lines, one idea per post, ends with a follow CTA." },
  linkedin: { name: "LinkedIn post", instruction: "A LinkedIn post: strong opening line, generous line breaks, story arc (situation -> system -> lesson), end with a single open question." },
  carousel: { name: "Instagram carousel", instruction: "A 6-slide IG carousel outline: SLIDE 1 - Hook, SLIDE 2 - Myth, SLIDE 3 - System, SLIDE 4 - Proof, SLIDE 5 - Lesson, SLIDE 6 - CTA. One short paragraph per slide." },
  newsletter: { name: "Newsletter intro", instruction: "A 3-4 paragraph newsletter intro that earns the click — conversational, specific, sets up the body." },
  yttitle: { name: "YouTube titles", instruction: "Five YouTube video title options numbered 1-5, then a THUMBNAIL IDEAS section with 3 concrete thumbnail concepts as bullets." },
};

type GenerateInput = {
  title: string;
  sourceType: string;
  sourceText: string;
  platforms: string[];
  environment: StripeEnv;
};

type GenerateResult =
  | { ok: true; id: string; outputs: Record<string, string> }
  | { ok: false; reason: "limit_reached" | "rate_limited" | "credits_exhausted" | "generation_failed"; message?: string };

export const generateRepurpose = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: GenerateInput) => {
    if (!data.sourceText?.trim()) throw new Error("Source text is required");
    if (!data.platforms?.length) throw new Error("Pick at least one platform");
    if (data.sourceText.length > 50_000) throw new Error("Source text is too long");
    return data;
  })
  .handler(async ({ data, context }): Promise<GenerateResult> => {
    const { supabase, userId } = context;

    // 1. Server-side limit check
    const start = new Date();
    start.setUTCDate(1);
    start.setUTCHours(0, 0, 0, 0);

    const [{ count }, subRes, profileRes] = await Promise.all([
      supabase
        .from("repurposes")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", start.toISOString()),
      supabase
        .from("subscriptions")
        .select("status, current_period_end")
        .eq("user_id", userId)
        .eq("environment", data.environment)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("profiles").select("brand_voice").eq("id", userId).maybeSingle(),
    ]);

    const subRow = subRes.data;
    const now = Date.now();
    const periodEnd = subRow?.current_period_end ? new Date(subRow.current_period_end).getTime() : null;
    const status = subRow?.status;
    const isPro = !!(
      subRow &&
      ((["active", "trialing", "past_due"].includes(status ?? "") && (periodEnd === null || periodEnd > now)) ||
        (status === "canceled" && periodEnd && periodEnd > now))
    );
    if (!isPro && (count ?? 0) >= FREE_MONTHLY_LIMIT) {
      return { ok: false, reason: "limit_reached" };
    }

    const brandVoice = profileRes.data?.brand_voice?.trim() || "";

    // 2. Call Lovable AI Gateway
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { ok: false, reason: "generation_failed", message: "AI not configured" };

    const wanted = data.platforms.filter((p) => PLATFORM_SPEC[p]);
    if (!wanted.length) return { ok: false, reason: "generation_failed", message: "No valid platforms" };

    const platformsBlock = wanted
      .map((p) => `- "${p}" (${PLATFORM_SPEC[p].name}): ${PLATFORM_SPEC[p].instruction}`)
      .join("\n");

    const system = `You are a senior content strategist who repurposes one source idea into platform-native variations for creators.

Rules:
- Match the platform's native voice and length conventions exactly.
- Never invent facts not present in the source. If a metric or detail is missing, write around it.
- Plain text only. No markdown headers, no asterisks for bold, no code fences.
- Use line breaks for readability.
${brandVoice ? `\nBRAND VOICE (match this exactly):\n${brandVoice}` : ""}`;

    const user = `SOURCE TYPE: ${data.sourceType}
SOURCE TITLE: ${data.title || "(untitled)"}

SOURCE CONTENT:
"""
${data.sourceText.trim()}
"""

Generate one output per platform key below. Return a single JSON object whose keys are exactly these platform ids and whose values are the generated text (string). No other keys. No commentary.

PLATFORMS:
${platformsBlock}`;

    let aiResp: Response;
    try {
      aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": apiKey,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          response_format: { type: "json_object" },
        }),
      });
    } catch (e) {
      return { ok: false, reason: "generation_failed", message: (e as Error).message };
    }

    if (aiResp.status === 429) return { ok: false, reason: "rate_limited" };
    if (aiResp.status === 402) return { ok: false, reason: "credits_exhausted" };
    if (!aiResp.ok) {
      const text = await aiResp.text().catch(() => "");
      return { ok: false, reason: "generation_failed", message: `AI ${aiResp.status}: ${text.slice(0, 300)}` };
    }

    const json = (await aiResp.json()) as { choices?: { message?: { content?: string } }[] };
    const content = json.choices?.[0]?.message?.content ?? "";
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(content);
    } catch {
      return { ok: false, reason: "generation_failed", message: "Model returned invalid JSON" };
    }

    const outputs: Record<string, string> = {};
    for (const p of wanted) {
      const v = parsed[p];
      if (typeof v === "string" && v.trim()) outputs[p] = v.trim();
    }
    if (!Object.keys(outputs).length) {
      return { ok: false, reason: "generation_failed", message: "Model returned no usable outputs" };
    }

    // 3. Persist
    const { data: row, error } = await supabase
      .from("repurposes")
      .insert({
        user_id: userId,
        title: data.title || data.sourceText.slice(0, 60),
        source_type: data.sourceType,
        source_text: data.sourceText,
        platforms: wanted,
        outputs,
      })
      .select("id")
      .single();
    if (error) return { ok: false, reason: "generation_failed", message: error.message };

    return { ok: true, id: row.id, outputs };
  });

export type RepurposeRow = {
  id: string;
  title: string | null;
  source_type: string | null;
  source_text: string | null;
  platforms: string[] | null;
  outputs: Record<string, string>;
  created_at: string;
};

export const listRepurposes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<RepurposeRow[]> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("repurposes")
      .select("id, title, source_type, source_text, platforms, outputs, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return (data ?? []) as RepurposeRow[];
  });

export const saveBrandVoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { brandVoice: string }) => {
    if (data.brandVoice.length > 8000) throw new Error("Brand voice is too long");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: userId, brand_voice: data.brandVoice }, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const getBrandVoice = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ brandVoice: string }> => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("profiles")
      .select("brand_voice")
      .eq("id", userId)
      .maybeSingle();
    return { brandVoice: data?.brand_voice ?? "" };
  });

type RegenerateInput = {
  id: string;
  platform: string;
  environment: StripeEnv;
};

type RegenerateResult =
  | { ok: true; output: string }
  | { ok: false; reason: "rate_limited" | "credits_exhausted" | "generation_failed"; message?: string };

// Regenerate a single platform's output for an existing repurpose, in place.
// Does NOT create a new row and does NOT count against the monthly limit —
// the repurpose already exists; this just swaps one variation.
export const regenerateOutput = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: RegenerateInput) => {
    if (!data.id) throw new Error("Missing repurpose id");
    if (!PLATFORM_SPEC[data.platform]) throw new Error("Unknown platform");
    return data;
  })
  .handler(async ({ data, context }): Promise<RegenerateResult> => {
    const { supabase, userId } = context;

    // Load the row (RLS guarantees ownership) + the user's brand voice.
    const [rowRes, profileRes] = await Promise.all([
      supabase
        .from("repurposes")
        .select("source_type, source_text, title, outputs")
        .eq("id", data.id)
        .maybeSingle(),
      supabase.from("profiles").select("brand_voice").eq("id", userId).maybeSingle(),
    ]);

    const row = rowRes.data;
    if (!row) return { ok: false, reason: "generation_failed", message: "Repurpose not found" };
    if (!row.source_text?.trim()) {
      return { ok: false, reason: "generation_failed", message: "No source text to regenerate from" };
    }

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { ok: false, reason: "generation_failed", message: "AI not configured" };

    const brandVoice = profileRes.data?.brand_voice?.trim() || "";
    const spec = PLATFORM_SPEC[data.platform];

    const system = `You are a senior content strategist who repurposes one source idea into platform-native variations for creators.

Rules:
- Match the platform's native voice and length conventions exactly.
- Never invent facts not present in the source. If a metric or detail is missing, write around it.
- Plain text only. No markdown headers, no asterisks for bold, no code fences.
- Use line breaks for readability.
- Produce a FRESH variation with a different angle or opening than a typical first draft.
${brandVoice ? `\nBRAND VOICE (match this exactly):\n${brandVoice}` : ""}`;

    const user = `SOURCE TYPE: ${row.source_type ?? "idea"}
SOURCE TITLE: ${row.title || "(untitled)"}

SOURCE CONTENT:
"""
${row.source_text.trim()}
"""

Write a single ${spec.name} output. ${spec.instruction}

Return only the generated text. No JSON, no commentary, no labels around it.`;

    let aiResp: Response;
    try {
      aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      });
    } catch (e) {
      return { ok: false, reason: "generation_failed", message: (e as Error).message };
    }

    if (aiResp.status === 429) return { ok: false, reason: "rate_limited" };
    if (aiResp.status === 402) return { ok: false, reason: "credits_exhausted" };
    if (!aiResp.ok) {
      const text = await aiResp.text().catch(() => "");
      return { ok: false, reason: "generation_failed", message: `AI ${aiResp.status}: ${text.slice(0, 300)}` };
    }

    const json = (await aiResp.json()) as { choices?: { message?: { content?: string } }[] };
    const output = (json.choices?.[0]?.message?.content ?? "").trim();
    if (!output) return { ok: false, reason: "generation_failed", message: "Model returned an empty output" };

    // Merge into the existing outputs jsonb and persist.
    const current = (row.outputs ?? {}) as Record<string, string>;
    const nextOutputs = { ...current, [data.platform]: output };
    const { error } = await supabase
      .from("repurposes")
      .update({ outputs: nextOutputs })
      .eq("id", data.id);
    if (error) return { ok: false, reason: "generation_failed", message: error.message };

    return { ok: true, output };
  });
