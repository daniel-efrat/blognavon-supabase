"use client"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { PostSummary } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import {
  deletePost,
  supabase
} from "@/lib/supabase/client"
import { Edit, Trash2, Eye, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface AdminPostListProps {
  posts: PostSummary[]
}

export function AdminPostList({ posts: initialPosts }: AdminPostListProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshPostsData = async () => {
    try {
      setIsRefreshing(true)
      const postMap = new Map(posts.map((post) => [post.id, post]))
      let hasUpdates = false
      const postIds = posts.map((p) => p.id)
      
      if (postIds.length === 0) {
        toast({
          title: "אין פוסטים",
          description: "אין פוסטים לרענן",
          variant: "default",
        })
        setIsRefreshing(false)
        return
      }

      const { data: fetchedPosts, error } = await supabase
        .from('posts')
        .select('id, title, slug, author, created_at, updated_at, status')
        .in('id', postIds)
      
      if (error) {
        throw error
      }

      fetchedPosts?.forEach((postData) => {
        const currentPost = postMap.get(postData.id)
        if (currentPost) {
          if (
            postData.author !== currentPost.author ||
            postData.title !== currentPost.title ||
            postData.slug !== currentPost.slug ||
            postData.status !== currentPost.status ||
            new Date(postData.updated_at).getTime() !== currentPost.updatedAt.getTime()
          ) {
            postMap.set(postData.id, {
              id: postData.id,
              title: postData.title,
              slug: postData.slug,
              author: postData.author,
              createdAt: new Date(postData.created_at),
              updatedAt: new Date(postData.updated_at),
              status: postData.status,
            } as PostSummary)
            hasUpdates = true
          }
        }
      })

      if (hasUpdates) {
        setPosts(Array.from(postMap.values()))
        toast({
          title: "נתונים עודכנו",
          description: "רשימת הפוסטים עודכנה עם הנתונים העדכניים ביותר",
          variant: "default",
        })
      } else {
        toast({
          title: "אין עדכונים",
          description: "כל הנתונים כבר מעודכנים",
          variant: "default",
        })
      }
    } catch (error) {
      console.error("Error refreshing posts data:", error)
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת רענון הנתונים",
        variant: "default",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    setPosts(initialPosts)
  }, [initialPosts])

  const handleDelete = async (id: string) => {
    if (confirm("האם אתה בטוח שברצונך למחוק פוסט זה?")) {
      setIsDeleting(id)
      try {
        const post = posts.find((p) => p.id === id)
        await deletePost(id)
        setPosts(posts.filter((p) => p.id !== id))
        toast({
          title: "הפוסט נמחק",
          description: `הפוסט "${post?.title || ''}" נמחק בהצלחה`,
          variant: "default",
        })
      } catch (error) {
        console.error("Error deleting post:", error)
        toast({
          title: "שגיאה",
          description: "מחיקת הפוסט נכשלה",
          variant: "default",
        })
      } finally {
        setIsDeleting(null)
      }
    }
  }

  const handleStatusChange = async (postId: string, newStatus: "published" | "draft") => {
    const originalPosts = posts.map(p => ({ ...p })); // Deep copy for potential revert
    // Optimistically update UI
    setPosts(prevPosts =>
      prevPosts.map(p =>
        p.id === postId ? { ...p, status: newStatus, updatedAt: new Date() } : p
      )
    );

    try {
      const { error } = await supabase
        .from("posts")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", postId);

      if (error) {
        throw error;
      }

      toast({
        title: "סטטוס עודכן",
        description: `סטטוס הפוסט עודכן ל: ${newStatus === "published" ? "פורסם" : "טיוטה"}`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating post status:", error);
      // Revert optimistic update on error
      setPosts(originalPosts);
      toast({
        title: "שגיאה בעדכון סטטוס",
        description: "לא ניתן היה לעדכן את סטטוס הפוסט.",
        variant: "default", // Changed from "destructive" to "default"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={refreshPostsData}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          <span>רענן נתונים</span>
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">כותרת</TableHead>
              <TableHead className="text-right">מחבר</TableHead>
              <TableHead className="text-right">תאריך</TableHead>
              <TableHead className="text-right">סטטוס</TableHead>
              <TableHead className="w-[120px] text-right">פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  לא נמצאו פוסטים. צור את הפוסט הראשון שלך.
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium text-right">
                    {post.title}
                  </TableCell>
                  <TableCell className="text-right">{post.author}</TableCell>
                  <TableCell className="text-right">
                    {formatDate(post.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Switch
                        dir="ltr"
                        id={`status-toggle-${post.id}`}
                        checked={post.status === "draft"}
                        onCheckedChange={(isChecked) => {
                          handleStatusChange(post.id, isChecked ? "draft" : "published");
                        }}
                        aria-label={`שנה סטטוס עבור ${post.title}`}
                        className="data-[state=checked]:bg-destructive data-[state=unchecked]:bg-accent"
                      />
                      <Label htmlFor={`status-toggle-${post.id}`} className="cursor-pointer min-w-[40px] text-right mr-2">
                        {post.status === "published" ? "פורסם" : "טיוטה"}
                      </Label>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end space-x-1 space-x-reverse">
                      <Link href={`/blog/${post.slug}`} target="_blank">
                        <Button size="icon" variant="ghost" aria-label="View Post">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/posts/${post.id}/edit`}>
                        <Button size="icon" variant="ghost" aria-label="Edit Post">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Delete Post"
                        className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                        onClick={() => handleDelete(post.id)}
                        disabled={isDeleting === post.id}
                      >
                        {isDeleting === post.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
