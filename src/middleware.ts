import { createServerClient, type CookieMethodsServer, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const pattern = /^\/admin(\/.*)?$/;
  const isAdminRoute = pattern.test(request.nextUrl.pathname);

  if (!isAdminRoute) {
    return NextResponse.next();
  }

  let response = NextResponse.next();

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
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    const isAdmin = user.app_metadata?.roles?.includes('admin');
    if (!isAdmin) {
      console.warn('User is not admin:', user.id);
      return NextResponse.redirect(new URL('/', request.url));
    }

    return response;
  } catch (error) {
    console.error('Auth error in middleware:', error);
    return NextResponse.redirect(new URL('/auth', request.url));
  }
}

export const config = {
  matcher: ['/admin/:path*']
}
