import type { User } from "@supabase/supabase-js";

export function mapUserToAuthor(user: User) {
  return {
    uid: user.id,
    displayName: user.email || undefined,
    username: user.user_metadata?.username || user.email,
  };
}
