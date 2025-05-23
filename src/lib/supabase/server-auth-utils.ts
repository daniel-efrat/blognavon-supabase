import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

/**
 * Check if the current user has admin role
 * @returns Promise<boolean> True if user has admin role
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return false;
    }

    return hasAdminRole(user);
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Check if a user has admin role
 * @param user Supabase User object
 * @returns boolean True if user has admin role
 */
export function hasAdminRole(user: User): boolean {
  const roles = user.app_metadata?.roles;
  return Array.isArray(roles) && roles.includes('admin');
}
