import { supabase } from './supabase';
import { SUPABASE_URL, SUPABASE_ANON_KEY, FREE_MONTHLY_LIMIT } from './config';

export type RepurposeRow = {
  id: string;
  title: string | null;
  source_type: string | null;
  source_text: string | null;
  platforms: string[] | null;
  outputs: Record<string, string>;
  voice: string | null;
  created_at: string;
};

export type GenerateInput = {
  title: string;
  sourceType: string;
  sourceText: string;
  platforms: string[];
  voice: string;
};

export type GenerateResult =
  | { ok: true; id: string; outputs: Record<string, string> }
  | { ok: false; reason: 'limit_reached' | 'rate_limited' | 'unauthorized' | 'failed'; message?: string; used?: number; limit?: number };

// Call the secure Edge Function. We use fetch (not functions.invoke) so we can
// read the structured JSON body on any status code (e.g. 402 limit_reached).
export async function generateRepurpose(input: GenerateInput): Promise<GenerateResult> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) return { ok: false, reason: 'unauthorized' };

  let resp: Response;
  try {
    resp = await fetch(`${SUPABASE_URL}/functions/v1/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });
  } catch (e) {
    return { ok: false, reason: 'failed', message: (e as Error).message };
  }

  let body: any = {};
  try { body = await resp.json(); } catch { /* non-JSON */ }

  if (resp.ok && body.ok) return { ok: true, id: body.id, outputs: body.outputs };
  if (resp.status === 401) return { ok: false, reason: 'unauthorized' };
  if (resp.status === 402 || body.reason === 'limit_reached') {
    return { ok: false, reason: 'limit_reached', used: body.used, limit: body.limit ?? FREE_MONTHLY_LIMIT };
  }
  if (resp.status === 429 || body.reason === 'rate_limited') return { ok: false, reason: 'rate_limited' };
  return { ok: false, reason: 'failed', message: body.message || `Request failed (${resp.status})` };
}

export async function listRepurposes(): Promise<RepurposeRow[]> {
  const { data, error } = await supabase
    .from('repurposes')
    .select('id, title, source_type, source_text, platforms, outputs, voice, created_at')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return (data ?? []) as RepurposeRow[];
}

export async function saveOutputs(id: string, outputs: Record<string, string>): Promise<void> {
  const { error } = await supabase.from('repurposes').update({ outputs }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteRepurpose(id: string): Promise<void> {
  const { error } = await supabase.from('repurposes').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function getMonthlyUsage(): Promise<{ used: number; limit: number }> {
  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);
  const { count } = await supabase
    .from('repurposes')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', start.toISOString());
  return { used: count ?? 0, limit: FREE_MONTHLY_LIMIT };
}

export type Profile = { displayName: string; brandVoice: string };

export async function getProfile(userId: string): Promise<Profile> {
  const { data } = await supabase
    .from('profiles')
    .select('display_name, brand_voice')
    .eq('id', userId)
    .maybeSingle();
  return { displayName: data?.display_name ?? '', brandVoice: data?.brand_voice ?? '' };
}

export async function saveProfile(userId: string, patch: Partial<Profile>): Promise<void> {
  const row: Record<string, unknown> = { id: userId };
  if (patch.displayName !== undefined) row.display_name = patch.displayName;
  if (patch.brandVoice !== undefined) row.brand_voice = patch.brandVoice;
  const { error } = await supabase.from('profiles').upsert(row, { onConflict: 'id' });
  if (error) throw new Error(error.message);
}
