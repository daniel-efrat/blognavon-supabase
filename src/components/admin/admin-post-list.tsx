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
import type { Post } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import {
  deletePost,
  supabase
} from "@/lib/supabase/client"
import { Edit, Trash2, Eye, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"

interface AdminPostListProps {
  posts: Post[]
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
        setIsRefreshing(false); // Ensure refreshing is set to false
        return
      }

      const { data: fetchedPosts, error } = await supabase
        .from('posts')
        .select('*') // Select all fields to ensure all Post properties are available
        .in('id', postIds)
      
      if (error) {
        throw error
      }

      fetchedPosts?.forEach((postData) => {
        const currentPost = postMap.get(postData.id)
        if (currentPost) {
          // Ensure all relevant fields are compared and dates are compared properly
          if (
            postData.author !== currentPost.author ||
            postData.title !== currentPost.title ||
            postData.slug !== currentPost.slug ||
            postData.status !== currentPost.status ||
            new Date(postData.updated_at).getTime() !== new Date(currentPost.updatedAt).getTime()
          ) {
            postMap.set(postData.id, {
              ...currentPost, // Spread current post to retain other potential fields
              id: postData.id, // ensure id is from fetched data
              title: postData.title,
              slug: postData.slug,
              author: postData.author,
              createdAt: new Date(postData.created_at), // ensure dates are Date objects
              updatedAt: new Date(postData.updated_at),
              status: postData.status,
            } as Post) // Cast to Post to satisfy type checking
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
      console.error("Error refreshing posts data:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת רענון הנתונים",
        variant: "default", // Changed from destructive due to type error
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    // initialPosts might be an empty array if no posts exist yet.
    // The AdminPostList component itself handles displaying a message for empty posts.
    // Thus, no specific toast for empty initialPosts is needed here unless desired.
    // If initialPosts changes (e.g. parent component re-fetches), update the local state.
    setPosts(initialPosts);
  }, [initialPosts]);

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
        console.error("Error deleting post:", error);
        toast({
          title: "שגיאה",
          description: "מחיקת הפוסט נכשלה",
          variant: "default", // Changed from destructive due to type error
        })
      } finally {
        setIsDeleting(null)
      }
    }
  }

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
              <TableHead className="w-[120px] text-right">פעולות</TableHead> {/* Increased width for 3 icons */}
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
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        post.status === "published"
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : post.status === "draft"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {post.status === "published"
                        ? "פורסם"
                        : post.status === "draft"
                        ? "טיוטה"
                        : "ארכיון"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end space-x-1 space-x-reverse">
                      <Link href={`/blog/${post.slug}`} target="_blank" passHref>
                        <Button size="icon" variant="ghost" aria-label="View Post">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/posts/${post.id}/edit`} passHref>
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
