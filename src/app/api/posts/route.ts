import { supabase as adminSupabase } from "@/lib/supabase/admin"; // Renamed to avoid conflict
import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    // Get user session for authorization
    const cookieStore = await cookies(); // Await cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        async get(name: string) {
          // cookies() has already been awaited and cookieStore is available
          return cookieStore.get(name)?.value;
        },
        async set(name: string, value: string, options: CookieOptions) {
          // cookies() has already been awaited and cookieStore is available
          // In a route handler, to persist cookies, you'd need to grab the cookieStore again
          // or pass it, but for getUser(), only get() is strictly necessary if middleware handles persistence.
          // For simplicity here, assuming middleware handles persistence or it's a read-only scenario for this client.
          const store = await cookies();
          store.set(name, value, options);
        },
        async remove(name: string, options: CookieOptions) {
          const store = await cookies();
          store.delete({ name, ...options });
        },
      },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: userError?.message || "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json()

    if (!data.title || !data.slug || !data.content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Create the post using admin client for full access
    const { data: post, error } = await adminSupabase // Use the renamed admin client
      .from("posts")
      .insert({
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        featured_image_url: data.featuredImage,
        author: data.author || user.email, // Use user from getUser()
        status: data.status || "draft",
        tags: data.tags || [],
        category: data.category,
        created_at: data.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id, slug")
      .single()

    if (error) {
      console.error("Error creating post:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ id: post.id, slug: post.slug, success: true })
  } catch (error) {
    console.error("Error in posts route:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
