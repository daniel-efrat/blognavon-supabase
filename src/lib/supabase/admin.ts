// src/lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
}
if (!supabaseServiceRoleKey) {
  // This error should ideally be caught during build or server start-up
  // For client-side components, this check might be too late.
  // Ensure service role key is available in the server environment.
  console.error("CRITICAL: Missing env.SUPABASE_SERVICE_ROLE_KEY. Admin actions will fail.");
  throw new Error("Missing env.SUPABASE_SERVICE_ROLE_KEY");
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    // detectSessionInUrl: false, // Recommended for server-side only clients
  }
});
