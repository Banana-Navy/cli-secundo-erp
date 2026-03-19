import { createClient } from "@/lib/supabase/server";

export async function getSetting(key: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", key)
    .single();
  return data?.value ?? null;
}

export async function getSettings(keys: string[]): Promise<Record<string, string | null>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("settings")
    .select("key, value")
    .in("key", keys);

  const result: Record<string, string | null> = {};
  for (const key of keys) {
    result[key] = data?.find((s) => s.key === key)?.value ?? null;
  }
  return result;
}
