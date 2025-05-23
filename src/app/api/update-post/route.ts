import { supabase } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    // Get user session for authorization
    const cookieStore = cookies()
    const supabaseClient = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { session } } = await supabaseClient.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id, data } = await request.json()

    if (!id || !data) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
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
      .eq("id", id)

    if (error) {
      console.error("Error updating post:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in update-post route:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
