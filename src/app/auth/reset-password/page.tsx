'use client';

import { useState, useEffect, Suspense } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Supabase client needs to be initialized here because this is a client component
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // The access_token is part of the fragment (#) not query params, so we need to parse it client-side.
  // However, Supabase's onAuthStateChange handles this automatically when it detects a session recovery event.
  // We just need to listen for the PASSWORD_RECOVERY event.
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // The session is now set, user can update their password.
        // No need to manually parse the fragment here, Supabase client handles it.
        setMessage('You can now set your new password.');
      } else if (event === 'USER_UPDATED') {
        setMessage('Password updated successfully! Redirecting to sign in...');
        setTimeout(() => router.push('/auth'), 3000);
      } else if (session && event !== 'INITIAL_SESSION') {
        // If user is somehow already logged in and not in recovery, redirect
        // router.push('/');
      }
    });

    // Check if there's an error in the URL (e.g., from server-side redirect)
    const errorParam = searchParams.get('error');
    if (errorParam) {
        setError(decodeURIComponent(errorParam));
    }
    const messageParam = searchParams.get('message');
    if (messageParam) {
        setMessage(decodeURIComponent(messageParam));
    }


    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, router, searchParams]);

  const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
    } else {
      // Message will be set by USER_UPDATED event
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Set Your New Password
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handlePasswordUpdate}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <Label htmlFor="new-password" className="sr-only">
                New Password
              </Label>
              <Input
                id="new-password"
                name="new-password"
                type="password"
                required
                className="relative block w-full appearance-none rounded-none rounded-t-md border border-border px-3 py-2 text-foreground placeholder-muted-foreground focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="confirm-password" className="sr-only">
                Confirm New Password
              </Label>
              <Input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                className="relative block w-full appearance-none rounded-none rounded-b-md border border-border px-3 py-2 text-foreground placeholder-muted-foreground focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
          {message && <p className="mt-2 text-sm text-green-600">{message}</p>}

          <div>
            <Button type="submit" className="group relative flex w-full justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" disabled={loading}>
              {loading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Update Password'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Wrap with Suspense because useSearchParams() needs it
export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
