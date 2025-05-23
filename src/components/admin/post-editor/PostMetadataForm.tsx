// components/post-editor/PostMetadataForm.tsx
"use client"
import type React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { Post } from "@/lib/types" // Or a more specific FormData type

// Define a more specific type for the form data this component handles
export interface PostMetadata {
  title: string
  slug: string
  excerpt: string
  author: string
  status: "draft" | "published" | string // Allow string for flexibility
  category: string
  createdAt: string // ISO date string YYYY-MM-DD
}

interface PostMetadataFormProps {
  formData: PostMetadata
  userEmail?: string | null
  onFormChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void
  onGenerateSlug: () => void
}

export function PostMetadataForm({
  formData,
  userEmail,
  onFormChange,
  onGenerateSlug,
}: PostMetadataFormProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">כותרת</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={onFormChange}
            required
            className="text-right"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="author">מחבר</Label>
          <Input
            id="author"
            name="author"
            value={formData.author}
            onChange={onFormChange}
            className="text-right"
            placeholder={userEmail || ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">קטגוריה</Label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={onFormChange}
            className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-input text-right"
          >
            <option value="">בחר קטגוריה</option>
            <option value="מדריכים">מדריכים</option>
            <option value="חדשות">חדשות</option>
            <option value="טכנולוגיה">טכנולוגיה</option>
            <option value="בינה מלאכותית">בינה מלאכותית</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">סטטוס</Label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={onFormChange}
            className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-input text-right"
          >
            <option value="draft">טיוטה</option>
            <option value="published">פורסם</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="createdAt">תאריך יצירה</Label>
          <Input
            type="date"
            id="createdAt"
            name="createdAt"
            value={formData.createdAt}
            onChange={onFormChange}
            required
            dir="ltr"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">מזהה URL</Label>
          <div className="flex gap-2">
            <Input
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={onFormChange}
              required
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onGenerateSlug}
            >
              צור מהכותרת
            </Button>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="excerpt">תקציר</Label>
        <Textarea
          id="excerpt"
          name="excerpt"
          value={formData.excerpt}
          onChange={onFormChange}
          rows={3}
          className="text-right"
        />
      </div>
    </>
  )
}
