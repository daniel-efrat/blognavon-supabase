// src/app/api/posts/[id]/route.ts
import { supabase as adminSupabase } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const postId = params.id;
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        async get(name: string) {
          return cookieStore.get(name)?.value;
        },
        async set(name: string, value: string, options: CookieOptions) {
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

    const data = await request.json();

    // Basic validation for required fields for an update
    if (!data.title || !data.slug || !data.content) {
      return NextResponse.json(
        { error: "Missing required fields (title, slug, content)" },
        { status: 400 }
      );
    }

    const { data: updatedPost, error: updateError } = await adminSupabase
      .from("posts")
      .update({
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        featured_image_url: data.featuredImage, // Ensure this matches your editor's field name
        // author: data.author, // Usually author doesn't change on update, or handled differently
        status: data.status,
        tags: data.tags,
        category: data.category,
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId)
      .select("id, slug") // Return id and slug for potential redirect
      .single();

    if (updateError) {
      console.error("Error updating post:", updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    if (!updatedPost) {
      return NextResponse.json(
        { error: "Post not found or update failed" },
        { status: 404 } 
      );
    }

    return NextResponse.json({ id: updatedPost.id, slug: updatedPost.slug, success: true });

  } catch (error) {
    console.error("Error in PUT /api/posts/[id] route:", error);
    let errorMessage = "Internal server error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
