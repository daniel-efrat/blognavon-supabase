import { supabase } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    // Get user session for authorization
    const cookieStore = await cookies();
    const supabaseClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          async set(name: string, value: string, options: CookieOptions) {
            // Re-fetch cookies for set, as per the other working example
            const currentCookies = await cookies();
            currentCookies.set(name, value, options);
          },
          async remove(name: string, options: CookieOptions) {
            // Re-fetch cookies for remove
            const currentCookies = await cookies();
            currentCookies.delete({ name, ...options });
          },
        },
      }
    );
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, data } = await request.json();

    if (!id || !data) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update the post using admin client for full access
    const { error } = await supabase
      .from("posts")
      .update({
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        featured_image: data.featuredImage,
        author: data.author,
        status: data.status,
        tags: data.tags,
        category: data.category,
        created_at: data.createdAt,
        updated_at: data.updatedAt,
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating post:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in update-post route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
