// src/lib/auth-hooks.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// Using SupabaseUser directly as our User type for now.

export const useAuth = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false); // Placeholder for admin logic
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchSession = useCallback(async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error fetching session:', error);
      setUser(null);
    } else {
      setUser(session?.user ?? null);
      // Add logic to determine if user is admin based on session?.user
      const roles = session?.user?.app_metadata?.roles as string[] | undefined;
      setIsAdmin(roles?.includes('admin') ?? false);
    }
    setLoading(false);
  }, [supabase.auth]);

  useEffect(() => {
    fetchSession(); // Fetch initial session

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      // Update admin status based on the new session
      const rolesOnAuthChange = session?.user?.app_metadata?.roles as string[] | undefined;
      setIsAdmin(rolesOnAuthChange?.includes('admin') ?? false);
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        // Potentially re-fetch session or user details if needed
      }
      if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase.auth, fetchSession]);

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
    // setUser(null) and setIsAdmin(false) will be handled by onAuthStateChange
    setLoading(false);
  };

  // Placeholder for admin check, replace with your actual logic
  useEffect(() => {
    if (user) {
      // Check for admin role in raw_app_meta_data
      const rolesFromUserObject = user?.app_metadata?.roles as string[] | undefined;
      setIsAdmin(rolesFromUserObject?.includes('admin') ?? false);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  return { user, isAdmin, signOut, loading };
};
