// components/post-editor/EditorLinkDialog.tsx
"use client"
import type React from "react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

interface EditorLinkDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  initialUrl?: string
  onSubmit: (url: string) => void
}

export function EditorLinkDialog({
  isOpen,
  onOpenChange,
  initialUrl = "",
  onSubmit,
}: EditorLinkDialogProps) {
  const [linkUrl, setLinkUrl] = useState(initialUrl)

  useEffect(() => {
    if (isOpen) {
      setLinkUrl(initialUrl)
    }
  }, [isOpen, initialUrl])

  const handleSubmit = () => {
    onSubmit(linkUrl)
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>הוספת/עריכת קישור</DialogTitle>
        </DialogHeader>
        <Input
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder="https://"
          dir="ltr"
        />
        <DialogFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            ביטול
          </Button>
          <Button type="button" onClick={handleSubmit}>
            הוסף
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
