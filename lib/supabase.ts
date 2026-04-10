import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getViewCount(slug: string): Promise<number> {
  const { data } = await supabase
    .from("page_views")
    .select("count")
    .eq("slug", slug)
    .single();
  return data?.count ?? 0;
}

export async function incrementViewCount(slug: string): Promise<number> {
  const { data } = await supabase.rpc("increment_view", { page_slug: slug });
  if (data !== null) return data;
  const count = await getViewCount(slug);
  return count;
}
