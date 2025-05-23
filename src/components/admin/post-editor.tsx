// PostEditor.tsx (The original file, now refactored)
"use client"

import type React from "react"
// Keep necessary UI imports for the main component if any, or TooltipProvider
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  // updatePost, // Keep if used directly, or move to API handlers
} from "@/lib/supabase/client"
import type { Post } from "@/lib/types"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-hooks"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { cleanupHtml } from "@/lib/utils" // Centralized utility

// Import the new components
import { PostEditorHeader } from "./post-editor/PostEditorHeader" // Adjust path
import {
  PostMetadataForm,
  type PostMetadata,
} from "./post-editor/PostMetadataForm" // Adjust path
import { FeaturedImageInput } from "./post-editor/FeaturedImageInput" // Adjust path
import { ContentEditorTabs } from "./post-editor/ContentEditorTabs" // Adjust path

interface PostEditorProps {
  post?: Post
  previousPostId?: string | null
  nextPostId?: string | null
}

// Define the shape of formData if not fully covered by PostMetadata + content + featuredImage
interface PostFormData extends PostMetadata {
  content: string
  featuredImage: string
  tags: string[] // Assuming tags is an array of strings
  // Add any other fields from your original formData that aren't in PostMetadata
}

export function PostEditor({
  post,
  previousPostId,
  nextPostId,
}: PostEditorProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const initialFormData: PostFormData = {
    title: post?.title || "",
    slug: post?.slug || "",
    excerpt: post?.excerpt || "",
    content: cleanupHtml(post?.content || ""),
    featuredImage: post?.featuredImage || "",
    author: post?.author || user?.email || "",
    status: post?.status || "draft",
    tags: post?.tags || [],
    category: post?.category || "",
    createdAt: post?.createdAt
      ? new Date(post.createdAt).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  }

  const [formData, setFormData] = useState<PostFormData>(initialFormData)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(
    post?.featuredImage || null
  )
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadController, setUploadController] = useState<AbortController | null>(null)

  // Cleanup upload on unmount or cancel
  useEffect(() => {
    return () => {
      if (uploadController) {
        uploadController.abort()
      }
    }
  }, [uploadController])

  // Effect to reset form when post prop changes (e.g. navigating between edit pages)
  useEffect(() => {
    setFormData({
      title: post?.title || "",
      slug: post?.slug || "",
      excerpt: post?.excerpt || "",
      content: cleanupHtml(post?.content || ""),
      featuredImage: post?.featuredImage || "",
      author: post?.author || user?.email || "",
      status: post?.status || "draft",
      tags: post?.tags || [],
      category: post?.category || "",
      createdAt: post?.createdAt
        ? new Date(post.createdAt).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    })
    setImageFile(null)
    setImagePreview(post?.featuredImage || null)
  }, [post, user?.email])

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleContentChange = (html: string) => {
    setFormData((prev) => ({ ...prev, content: html }))
  }

  const handleImageFileChange = (file: File | null) => {
    if (file) {
      console.log("Processing image file:", {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      })

      if (!file.type.startsWith('image/')) {
        toast({
          title: "שגיאה",
          description: "אנא בחר קובץ תמונה בלבד",
          variant: "accent2",
        })
        return
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "שגיאה",
          description: "גודל התמונה חייב להיות קטן מ-5MB",
          variant: "accent2",
        })
        return
      }

      const reader = new FileReader()
      reader.onloadstart = () => console.log("Starting to read file")
      reader.onerror = (error) => console.error("Error reading file:", error)
      reader.onloadend = () => {
        console.log("File read complete")
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setImageFile(file)
    } else {
      console.log("Clearing image file")
      setImageFile(null)
      setImagePreview(formData.featuredImage || null)
    }
  }

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^\w\s\u0590-\u05FF-]/gi, "") // Keep Hebrew characters and hyphens
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, "") // Trim leading/trailing hyphens
    setFormData((prev) => ({ ...prev, slug }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "שגיאה",
        description: "עליך להיות מחובר כדי לבצע פעולה זו",
        variant: "accent2",
      })
      return
    }
    if (!formData.title || !formData.slug || !formData.content) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את כל השדות הנדרשים (כותרת, מזהה URL ותוכן)",
        variant: "accent2",
      })
      return
    }
    setIsSubmitting(true)

    try {
      let imageUrl = formData.featuredImage
      if (imageFile) {
        setIsUploading(true)
        setUploadProgress(0)
        try {
          const timestamp = Date.now()
          const extension = imageFile.name.split(".").pop() || "jpg"
          const safeFileName = imageFile.name
            .toLowerCase()
            .replace(/[^a-z0-9.]/g, "-")
          const uploadPath = post?.id 
            ? `posts/${post.id}/featured-${timestamp}.${extension}`
            : `posts/temp/featured-${timestamp}-${safeFileName}`

          const uploadFormData = new FormData()
          uploadFormData.append("file", imageFile)
          uploadFormData.append("path", uploadPath)

          // Create new abort controller for this upload
          const controller = new AbortController()
          setUploadController(controller)

          // Create XHR instance with cleanup
          const xhr = new XMLHttpRequest()

          // Track upload progress
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100)
              setUploadProgress(progress)
            }
          }

          // Define the expected response type
          interface UploadResponse {
            success: boolean
            url?: string
            path?: string
            error?: string
          }

          // Create and execute upload promise
          const uploadResult = await new Promise<UploadResponse>((resolve, reject) => {
            controller.signal.addEventListener('abort', () => {
              xhr.abort()
              setIsUploading(false)
              setUploadProgress(0)
              setUploadController(null)
            })
            xhr.onload = () => {
              if (xhr.status === 200) {
                try {
                  resolve(JSON.parse(xhr.responseText))
                } catch {
                  reject(new Error("Invalid response format"))
                }
              } else {
                reject(new Error(xhr.statusText))
              }
            }
            xhr.onerror = () => reject(new Error("שגיאת רשת בעת העלאת התמונה"))
            xhr.onabort = () => {
              setUploadController(null)
              reject(new Error("העלאת התמונה בוטלה"))
            }
            xhr.open("POST", "/api/upload-image")
            // The createRouteHandlerClient on the server will use cookies for auth,
            // so manual Authorization header is not typically needed here.
            xhr.send(uploadFormData)
          })
        
          console.log("Upload result:", uploadResult)
          
          if (!uploadResult.success) {
            throw new Error(
              uploadResult.error || 
              "Failed to upload image. Please try again or contact support if the issue persists."
            )
          }

          if (!uploadResult.url || typeof uploadResult.url !== 'string') {
            throw new Error("Server returned success but no valid URL was provided")
          }

          console.log("Image upload successful:", {
            url: uploadResult.url,
            path: uploadResult.path
          })
          
          imageUrl = uploadResult.url
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          if (errorMessage === "העלאת התמונה בוטלה") {
            console.log("Upload cancelled")
            return // Exit early without throwing
          }
          throw error
        }
      }

      if (post) {
        // Update existing post
        const postDataToUpdate = {
          ...formData,
          featuredImage: imageUrl,
          updatedAt: new Date().toISOString(),
        }

        const response = await fetch(`/api/posts/${post.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(postDataToUpdate),
        })
        let result
        const responseText = await response.text()
        try {
          result = JSON.parse(responseText)
          if (!response.ok) {
            throw new Error(result.error || "Failed to update post")
          }
        } catch (parseError) {
          console.error("Error parsing response:", responseText)
          throw new Error(
            response.ok
              ? "Invalid response format from server"
              : `Server error: ${response.status} ${response.statusText}`
          )
        }

        // The syncTitlesAndSlugsTransaction call was here and has been removed as it's redundant.
        toast({
          title: "הצלחה",
          description: "הפוסט עודכן בהצלחה",
          variant: "default",
        })
        router.push(`/blog/${formData.slug}`)
      } else {
        // Create new post
        const postDataToCreate = {
          ...formData,
          featuredImage: imageUrl,
          author: formData.author || user.email, // Ensure author is set
          updatedAt: new Date().toISOString(),
        }
        const response = await fetch("/api/posts", {
          // Assumes you have this API endpoint
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(postDataToCreate),
        })
        let result
        const responseText = await response.text()
        try {
          result = JSON.parse(responseText)
          if (!response.ok) {
            throw new Error(result.error || "Failed to create post")
          }
        } catch (parseError) {
          console.error("Error parsing response:", responseText)
          throw new Error(
            response.ok
              ? "Invalid response format from server"
              : `Server error: ${response.status} ${response.statusText}`
          )
        }

        // The syncTitlesAndSlugsTransaction call was here and has been removed as it's redundant.
        toast({
          title: "הצלחה",
          description: "הפוסט נוצר בהצלחה",
          variant: "default",
        })
        if (result.slug) {
          router.push(`/blog/${result.slug}`)
        } else {
          // Fallback or error if slug isn't returned, though API was changed to return it
          console.error("Slug not found in API response for new post. Navigating to admin.")
          router.push(`/admin/posts/${result.id}/edit`) 
        }
      }
    } catch (error) {
      console.error("Error saving post:", error)
      toast({
        title: "שגיאה",
        description:
          error instanceof Error
            ? `שמירת הפוסט נכשלה: ${error.message}`
            : "שמירת הפוסט נכשלה",
        variant: "accent2",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <TooltipProvider>
      <form onSubmit={handleSubmit} className="space-y-6">
        <PostEditorHeader
          post={post}
          previousPostId={previousPostId}
          nextPostId={nextPostId}
          isSubmitting={isSubmitting}
          status={formData.status}
          onCancelClick={() => router.push("/admin/posts")}
        />

        <PostMetadataForm
          formData={formData}
          userEmail={user?.email}
          onFormChange={handleFormChange}
          onGenerateSlug={generateSlug}
        />

        <FeaturedImageInput
          currentImageUrl={formData.featuredImage}
          imagePreviewUrl={imagePreview}
          onImageFileChange={handleImageFileChange}
          uploadProgress={uploadProgress}
          isUploading={isUploading}
          onCancelUpload={() => uploadController?.abort()}
        />

        <ContentEditorTabs
          initialContent={formData.content}
          onContentChange={handleContentChange}
        />
        {/* The main submit button is now part of PostEditorHeader and handled by the form's onSubmit */}
      </form>
    </TooltipProvider>
  )
}
