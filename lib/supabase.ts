import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export async function getViewCount(slug: string): Promise<number> {
  if (!supabase) return 0;
  const { data } = await supabase
    .from("page_views")
    .select("count")
    .eq("slug", slug)
    .single();
  return data?.count ?? 0;
}

/** 一次查多個 slug 的瀏覽數，回傳 slug → count 的 map（缺值補 0）。 */
export async function getViewCounts(
  slugs: string[],
): Promise<Record<string, number>> {
  const result: Record<string, number> = {};
  const unique = Array.from(new Set(slugs));
  for (const s of unique) result[s] = 0;
  if (!supabase || unique.length === 0) return result;

  const { data } = await supabase
    .from("page_views")
    .select("slug, count")
    .in("slug", unique);

  for (const row of data ?? []) {
    if (row?.slug != null) result[row.slug] = row.count ?? 0;
  }
  return result;
}

/** 全站累計瀏覽數：page_views 每一列（一個頁面一列）的總和。 */
export async function getTotalViewCount(): Promise<number> {
  if (!supabase) return 0;
  const { data } = await supabase.from("page_views").select("count");
  return (data ?? []).reduce((sum, row) => sum + (row?.count ?? 0), 0);
}

export async function incrementViewCount(slug: string): Promise<number> {
  if (!supabase) return 0;
  const { data } = await supabase.rpc("increment_view", { page_slug: slug });
  if (data !== null) return data;
  const count = await getViewCount(slug);
  return count;
}
