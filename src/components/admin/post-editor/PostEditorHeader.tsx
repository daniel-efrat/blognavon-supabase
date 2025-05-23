// components/post-editor/PostEditorHeader.tsx
"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Eye } from "lucide-react"
import type { Post } from "@/lib/types"

interface PostEditorHeaderProps {
  post?: Post // Used for "View Post" link and determining "Draft/Post" text
  previousPostId?: string | null
  nextPostId?: string | null
  isSubmitting: boolean
  status: string // Current status from formData
  onCancelClick: () => void
  // onSubmitClick is removed, form submission is handled by the main form's submit button
}

export function PostEditorHeader({
  post,
  previousPostId,
  nextPostId,
  isSubmitting,
  status,
  onCancelClick,
}: PostEditorHeaderProps) {
  const entityType = status === "draft" ? "טיוטה" : "פוסט"

  return (
    <div className="flex justify-between items-center mb-4 p-4 bg-muted rounded-md">
      <div className="flex gap-4">
        {previousPostId ? (
          <Link href={`/admin/posts/${previousPostId}/edit`}>
            <Button variant="outline" size="sm">
              <ArrowRight className="ms-2 h-4 w-4" />
              {`${entityType} קודם`}
            </Button>
          </Link>
        ) : (
          <Button variant="outline" size="sm" disabled>
            <ArrowRight className="ms-2 h-4 w-4" />
            {`${entityType} קודם`}
          </Button>
        )}
        {nextPostId ? (
          <Link href={`/admin/posts/${nextPostId}/edit`}>
            <Button variant="outline" size="sm">
              {`${entityType} הבא`}
              <ArrowLeft className="me-2 h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Button variant="outline" size="sm" disabled>
            {`${entityType} הבא`}
            <ArrowLeft className="me-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-4 space-x-reverse">
        {" "}
        {/* Adjusted for RTL */}
        <Button
          type="button"
          variant="outline"
          onClick={onCancelClick}
          disabled={isSubmitting}
        >
          ביטול
        </Button>
        <Button
          type="submit" // This button will submit the main form
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "שומר..."
            : post
            ? `עדכן ${entityType}`
            : `צור ${entityType}`}
        </Button>
        {post && post.status === "published" && (
          <Link href={`/blog/${post.slug}`} target="_blank">
            <Button variant="outline" size="sm">
              צפה בפוסט
              <Eye className="me-2 h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
