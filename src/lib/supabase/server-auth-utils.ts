import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function isAdmin(): Promise<boolean> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    console.error('isAdmin check: Supabase client is not available.');
    return false;
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // No user logged in, so not an admin
    return false;
  }

  // How to determine if a user is an admin depends on your Supabase setup.
  // Here are a few common ways. Uncomment and adapt the one you use:

  // Option 1: Check for a role in user's app_metadata (e.g., an array of roles)
  // This is a common pattern.
  if (user.app_metadata?.roles && Array.isArray(user.app_metadata.roles)) {
    return user.app_metadata.roles.includes('admin');
  }

  // Option 2: Check for a boolean flag in user's user_metadata
  // if (typeof user.user_metadata?.is_admin === 'boolean') {
  //   return user.user_metadata.is_admin;
  // }

  // Option 3: Check against a specific, hardcoded superadmin user ID
  // const superAdminUserId = process.env.SUPER_ADMIN_USER_ID; // Make sure to set this env var
  // if (superAdminUserId && user.id === superAdminUserId) {
  //   return true;
  // }
  
  // If none of the above, default to false
  console.warn(`isAdmin check: User ${user.id} does not meet admin criteria based on current checks.`);
  return false;
}
