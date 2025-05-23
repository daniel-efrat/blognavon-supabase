"use client"

import { useParams } from "next/navigation"
import { PostEditor } from "@/components/admin/post-editor"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { Post } from "@/lib/types"

export default function EditPostPage() {
  const params = useParams()
  const postId = params?.id as string

  const [post, setPost] = useState<Post | null>(null)
  const [previousPostId, setPreviousPostId] = useState<string | null>(null)
  const [nextPostId, setNextPostId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPost() {
      if (!postId) return

      setLoading(true)
      setError(null)
      try {
        // Fetch the current post
        const { data: currentPost, error: currentError } = await supabase
          .from("posts")
          .select("*")
          .eq("id", postId)
          .single()

        if (currentError) throw currentError
        if (!currentPost) throw new Error("הפוסט לא נמצא")

        // Transform dates to proper format
        const formattedPost: Post = {
          ...currentPost,
          createdAt: currentPost.created_at,
          updatedAt: currentPost.updated_at,
          featuredImage: currentPost.featured_image,
        }
        setPost(formattedPost)

        // Fetch previous post ID
        const { data: prevResult, error: prevFetchError } = await supabase
          .from("posts")
          .select("id")
          .lt("created_at", currentPost.created_at)
          .eq("status", currentPost.status)
          .order("created_at", { ascending: false })
          .limit(1) // Fetches an array, expecting 0 or 1 item

        if (prevFetchError) {
          // Log the error, but it might not be critical for page load
          console.error("Error fetching previous post ID:", prevFetchError)
          // Optionally, show a less intrusive error or just log
        }
        setPreviousPostId(prevResult && prevResult.length > 0 ? prevResult[0].id : null)

        // Fetch next post ID
        const { data: nextResult, error: nextFetchError } = await supabase
          .from("posts")
          .select("id")
          .gt("created_at", currentPost.created_at)
          .eq("status", currentPost.status)
          .order("created_at", { ascending: true })
          .limit(1) // Fetches an array, expecting 0 or 1 item

        if (nextFetchError) {
          // Log the error
          console.error("Error fetching next post ID:", nextFetchError)
        }
        setNextPostId(nextResult && nextResult.length > 0 ? nextResult[0].id : null)
      } catch (error) {
        console.error("Error fetching post:", error)
        setError(
          error instanceof Error ? error.message : "אירעה שגיאה בטעינת הפוסט"
        )
        toast({
          title: "שגיאה",
          description: error instanceof Error ? error.message : "אירעה שגיאה בטעינת הפוסט",
          variant: "accent2",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [postId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h1 className="text-xl font-semibold">שגיאה</h1>
        <p className="text-muted-foreground">{error || "הפוסט לא נמצא"}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <PostEditor
        post={post}
        previousPostId={previousPostId}
        nextPostId={nextPostId}
      />
    </div>
  )
}
