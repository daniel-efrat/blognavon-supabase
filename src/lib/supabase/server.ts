import { createServerClient, CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createServerSupabaseClient() {
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          const cookieStore = cookies();
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          const cookieStore = cookies();
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          const cookieStore = cookies();
          cookieStore.delete(name);
        },
      },
    }
  );
}
