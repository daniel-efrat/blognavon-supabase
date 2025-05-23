import { createServerClient, type CookieOptions, type CookieMethodsServer } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    try {
      const cookieStore = cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: cookieStore as unknown as CookieMethodsServer
        }
      );

      const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) throw error;
      
      if (session) {
        // Log session details for debugging
        console.log('Auth callback session:', {
          user_id: session.user.id,
          email: session.user.email,
          roles: session.user.app_metadata?.roles,
          session_id: session.access_token,
        });
      }

      return NextResponse.redirect(`${origin}${next}`);
    } catch (error) {
      console.error('Error in auth callback:', error);
      return NextResponse.redirect(`${origin}/auth/auth-code-error`);
    }
  }

  console.error('No code in auth callback:', searchParams.get('error_description'));
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
