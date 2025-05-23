// components/post-editor/ContentEditorTabs.tsx
"use client"
import type React from "react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import TextAlign from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"
import LinkExtension from "@tiptap/extension-link"
import { useState, useEffect } from "react"
import { cleanupHtml } from "@/lib/utils" // Assuming you moved it
import { TiptapToolbar } from "./TiptapToolbar"
import { EditorLinkDialog } from "./EditorLinkDialog"

interface ContentEditorTabsProps {
  initialContent: string
  onContentChange: (html: string) => void
}

export function ContentEditorTabs({
  initialContent,
  onContentChange,
}: ContentEditorTabsProps) {
  const [rawHtml, setRawHtml] = useState(() => cleanupHtml(initialContent))
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [currentLinkUrl, setCurrentLinkUrl] = useState("")

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        hardBreak: false,
        paragraph: { HTMLAttributes: { class: "mb-4" } },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
      Underline,
      LinkExtension.configure({ openOnClick: false }),
    ],
    content: rawHtml,
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral dark:prose-invert focus:outline-none min-h-[400px]",
        dir: "rtl",
      },
    },
    onUpdate: ({ editor: currentEditor }: { editor: Editor }) => {
      const html = cleanupHtml(currentEditor.getHTML())
      setRawHtml(html) // Keep rawHtml in sync for the textarea
      onContentChange(html)
    },
  })

  useEffect(() => {
    // Sync editor if initialContent changes from props (e.g., loading a different post)
    const cleaned = cleanupHtml(initialContent)
    if (editor && editor.getHTML() !== cleaned) {
      setRawHtml(cleaned)
      editor.commands.setContent(cleaned, false) // false to not emit update
    }
  }, [initialContent, editor])

  const handleRawHtmlChange = (value: string) => {
    const cleanedHtml = cleanupHtml(value)
    setRawHtml(cleanedHtml)
    onContentChange(cleanedHtml)
    editor?.commands.setContent(cleanedHtml, false) // Update editor without firing onUpdate
  }

  const handleSetLink = () => {
    setCurrentLinkUrl(editor?.getAttributes("link").href || "")
    setShowLinkDialog(true)
  }

  const handleSubmitLink = (url: string) => {
    if (url.trim() === "") {
      editor?.chain().focus().unsetLink().run()
    } else {
      editor?.chain().focus().setLink({ href: url }).run()
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="content">תוכן</Label>
      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="mb-2">
          <TabsTrigger value="editor">עורך חזותי</TabsTrigger>
          <TabsTrigger value="html">HTML</TabsTrigger>
        </TabsList>

        <TabsContent value="editor">
          <div className="border rounded-md overflow-hidden">
            <TiptapToolbar editor={editor} onSetLink={handleSetLink} />
            <div className="prose prose-neutral dark:prose-invert min-h-[400px] p-4">
              <EditorContent editor={editor} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="html">
          <Textarea
            value={rawHtml}
            onChange={(e) => handleRawHtmlChange(e.target.value)}
            className="min-h-[400px] font-mono"
            dir="ltr"
          />
        </TabsContent>
      </Tabs>
      <EditorLinkDialog
        isOpen={showLinkDialog}
        onOpenChange={setShowLinkDialog}
        initialUrl={currentLinkUrl}
        onSubmit={handleSubmitLink}
      />
    </div>
  )
}
