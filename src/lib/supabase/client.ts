// src/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

export async function deletePost(id: string) {
  const { error } = await supabase.from("posts").delete().eq("id", id)
  if (error) {
    console.error("Error deleting post:", error)
    throw error
  }
  return true
}

interface UpdatePostData {
  title: string
  slug: string
  content: string
  excerpt?: string
  featuredImage?: string
  author?: string
  status?: "draft" | "published"
  tags?: string[]
  category?: string
  createdAt?: string
  updatedAt?: string
}

export async function updatePost(id: string, data: UpdatePostData) {
  const { error } = await supabase.from("posts").update(data).eq("id", id)
  if (error) {
    console.error("Error updating post:", error)
    throw error
  }
  return true
}


export async function uploadImageToSupabase(file: File, path: string) {
  try {
    console.log("Starting upload process:", {
      fileName: file.name,
      fileType: file.type,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`
    })

    // Create FormData
    const formData = new FormData()
    formData.append("file", file)
    formData.append("path", path)

    // Send to our API route
    const response = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || "שגיאה בהעלאת התמונה")
    }

    console.log("Upload successful:", result)

    return {
      success: true,
      url: result.url,
      path: result.path
    }
  } catch (error) {
    console.error("Upload function error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "שגיאה לא ידועה בהעלאת התמונה",
      details: error
    }
  }
}
