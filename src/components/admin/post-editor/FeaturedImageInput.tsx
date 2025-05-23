// components/post-editor/FeaturedImageInput.tsx
"use client"
import type React from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useRef } from "react"

interface FeaturedImageInputProps {
  currentImageUrl?: string | null
  imagePreviewUrl?: string | null
  onImageFileChange: (file: File | null) => void
  uploadProgress?: number
  isUploading?: boolean
  onCancelUpload?: () => void
}

export function FeaturedImageInput({
  currentImageUrl,
  imagePreviewUrl,
  onImageFileChange,
  uploadProgress = 0,
  isUploading = false,
  onCancelUpload,
}: FeaturedImageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    onImageFileChange(file || null)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="featuredImage">תמונה ראשית</Label>
      <div className="flex items-center gap-4">
        <input
          type="file"
          id="featuredImage"
          name="featuredImage"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.value = "" // Reset to allow re-selecting same file
              fileInputRef.current.click()
            }
          }}
        >
            {isUploading ? "מעלה..." : "בחר תמונה"}
        </Button>
        {imagePreviewUrl ? (
          <div className="relative h-32 w-48 overflow-hidden rounded border group">
            <img
              src={imagePreviewUrl}
              alt="תצוגה מקדימה של תמונה ראשית"
              className={`absolute inset-0 w-full h-full object-cover ${
                isUploading ? 'opacity-50' : ''
              }`}
            />
            {isUploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white">
                <div className="text-sm mb-2">מעלה תמונה...</div>
                <div className="w-4/5 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="text-sm mt-1">{uploadProgress}%</div>
                {onCancelUpload && (
                  <button
                    type="button"
                    onClick={onCancelUpload}
                    className="mt-2 px-3 py-1 text-xs bg-red-500 hover:bg-red-600 rounded-md transition-colors"
                  >
                    ביטול העלאה
                  </button>
                )}
              </div>
            )}
          </div>
        ) : currentImageUrl ? (
          <div className="relative h-32 w-48 overflow-hidden rounded border">
            <img
              src={currentImageUrl}
              alt="תמונה ראשית נוכחית"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="relative h-32 w-48 overflow-hidden rounded border flex items-center justify-center bg-muted">
            <span className="text-sm text-muted-foreground">תמונה ראשית</span>
          </div>
        )}
      </div>
    </div>
  )
}
