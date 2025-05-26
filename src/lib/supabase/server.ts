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
        async get(name: string) {
          const cookieStore = await cookies();
          return cookieStore.get(name)?.value;
        },
        async set(name: string, value: string, options: CookieOptions) {
          try {
            const cookieStore = await cookies();
            cookieStore.set({ name, value, ...options });
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (_error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions or if the cookie is non-essential.
            // console.warn('Failed to set cookie in Server Component:', name, _error);
          }
        },
        async remove(name: string, options: CookieOptions) {
          try {
            const cookieStore = await cookies();
            cookieStore.delete({ name, ...options });
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (_error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions or if the cookie is non-essential.
            // console.warn('Failed to delete cookie in Server Component:', name, _error);
          }
        },
      },
    }
  );
}
