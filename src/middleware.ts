import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  console.log(`[Middleware] Path: ${request.nextUrl.pathname}`);
  // Log all cookies received by the middleware
  // console.log("[Middleware] All Request Cookies:", request.cookies.getAll());
  const pattern = /^\/admin(\/.*)?$/;
  const isAdminRoute = pattern.test(request.nextUrl.pathname);

  if (!isAdminRoute) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.delete({
            name,
            ...options,
          });
        },
      },
    }
  );

  try {
    // Log specific Supabase auth cookies if they exist
    const allCookies = request.cookies.getAll();
    const supabaseAuthCookie = allCookies.find(cookie => cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token'));
    console.log("[Middleware] Supabase Auth Cookie (raw from request):", supabaseAuthCookie);

    const { data: { session }, error } = await supabase.auth.getSession();
    console.log("[Middleware] getSession() result - Session:", session ? { userId: session.user.id, expires_at: session.expires_at, is_anonymous: (session.user.is_anonymous === undefined ? 'N/A' : session.user.is_anonymous) } : null, "Error:", error);
    
    if (error || !session) {
      console.log("[Middleware] Redirecting to /auth due to missing session or error from getSession().");
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log("[Middleware] getUser() result - User:", user ? { id: user.id, email: user.email, roles: user.app_metadata?.roles } : null, "UserError:", userError);
    if (userError || !user) {
      console.log("[Middleware] Redirecting to /auth due to missing user or error from getUser().");
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    const isAdmin = user.app_metadata?.roles?.includes('admin');
    console.log("[Middleware] isAdmin check:", isAdmin, "User roles:", user.app_metadata?.roles);
    if (!isAdmin) {
      console.warn('[Middleware] User is not admin:', user.id, "Redirecting to /.");
      return NextResponse.redirect(new URL('/', request.url));
    }

    return response;
  } catch (error) {
    console.error('[Middleware] Auth error in middleware catch block:', error);
    return NextResponse.redirect(new URL('/auth', request.url));
  }
}

export const config = {
  matcher: ['/admin/:path*']
}
