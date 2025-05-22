"use client"

import { useAuth } from "@/lib/auth-hooks"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import Link from "next/link"

interface EditPostButtonProps {
  postId: string
}

export function EditPostButton({ postId }: EditPostButtonProps) {
  const { isAdmin } = useAuth()

  if (!isAdmin) return null

  return (
    <Link href={`/admin/edit/${postId}`}>
      <Button
        size="icon"
        variant="outline"
        className="absolute top-4 left-4 z-10"
        aria-label="Edit post"
      >
        <Pencil className="h-4 w-4" />
        <span className="sr-only">ערוך</span>
      </Button>
    </Link>
  )
}
