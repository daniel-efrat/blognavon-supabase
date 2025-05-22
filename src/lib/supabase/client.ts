// src/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

export async function deletePost(id: string) {
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
  return true;
}

export async function syncTitlesAndSlugsTransaction() {
  // Placeholder - implement if needed by other parts of the app
  console.warn("syncTitlesAndSlugsTransaction is not implemented");
  return { data: null, error: null };
}
