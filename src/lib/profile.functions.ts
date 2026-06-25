import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// App-level, cross-device user preferences. Kept as a small typed shape on top
// of the profiles.preferences jsonb column so adding a pref never needs a migration.
export type ExportTarget = "share" | "copy" | "download";

export type Preferences = {
  haptics: boolean;
  reduceMotion: boolean;
  defaultExport: ExportTarget;
};

export const DEFAULT_PREFERENCES: Preferences = {
  haptics: true,
  reduceMotion: false,
  defaultExport: "share",
};

function coercePreferences(raw: unknown): Preferences {
  const p = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const exportTarget =
    p.defaultExport === "copy" || p.defaultExport === "download" || p.defaultExport === "share"
      ? (p.defaultExport as ExportTarget)
      : DEFAULT_PREFERENCES.defaultExport;
  return {
    haptics: typeof p.haptics === "boolean" ? p.haptics : DEFAULT_PREFERENCES.haptics,
    reduceMotion:
      typeof p.reduceMotion === "boolean" ? p.reduceMotion : DEFAULT_PREFERENCES.reduceMotion,
    defaultExport: exportTarget,
  };
}

export type ProfileData = {
  displayName: string;
  preferences: Preferences;
};

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ProfileData> => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("profiles")
      .select("display_name, preferences")
      .eq("id", userId)
      .maybeSingle();
    return {
      displayName: data?.display_name ?? "",
      preferences: coercePreferences(data?.preferences),
    };
  });

export const saveProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { displayName?: string; preferences?: Partial<Preferences> }) => {
    if (typeof data.displayName === "string" && data.displayName.length > 80) {
      throw new Error("Display name is too long");
    }
    return data;
  })
  .handler(async ({ data, context }): Promise<ProfileData> => {
    const { supabase, userId } = context;

    // Merge against the current row so a partial update never drops other fields.
    const { data: existing } = await supabase
      .from("profiles")
      .select("display_name, preferences")
      .eq("id", userId)
      .maybeSingle();

    const currentPrefs = coercePreferences(existing?.preferences);
    const nextPrefs = coercePreferences({ ...currentPrefs, ...(data.preferences ?? {}) });
    const nextDisplayName =
      typeof data.displayName === "string"
        ? data.displayName.trim()
        : (existing?.display_name ?? "");

    const { error } = await supabase
      .from("profiles")
      .upsert(
        { id: userId, display_name: nextDisplayName, preferences: nextPrefs },
        { onConflict: "id" },
      );
    if (error) throw new Error(error.message);

    return { displayName: nextDisplayName, preferences: nextPrefs };
  });
