// src/app/admin/posts/page.tsx
import { AdminPostList } from "@/components/admin/admin-post-list";
import { supabase as adminSupabase } from "@/lib/supabase/admin"; // Using admin client for full access
import type { PostSummary } from "@/lib/types";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AiPostForm } from "@/components/ai-post-form";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

async function getPosts(): Promise<PostSummary[]> {
  // If user is admin, fetch posts using the admin client for potentially elevated privileges
  const { data, error: postsError } = await adminSupabase
    .from("posts")
    .select("id, title, slug, author, created_at, updated_at, status") // Ensure all needed fields are selected
    .order("created_at", { ascending: false });

  if (postsError) {
    console.error("Error fetching posts:", postsError);
    // Optionally, you could return an empty array or throw an error to be caught by an error boundary
    return [];
  }

  // Map to the Post type, ensuring date fields are handled correctly
  return data.map((post) => ({
    ...post,
    createdAt: new Date(post.created_at),
    updatedAt: new Date(post.updated_at),
    // Ensure 'author' and 'slug' are present if your Post type requires them
    // If they can be null in the DB, adjust your Post type or provide defaults
    author: post.author || "Unknown Author",
    slug: post.slug || "",
  })) as PostSummary[];
}

export default async function AdminPostsPage() {
  const posts = await getPosts();

  return (
    <div className="container px-4 py-10 mx-auto md:px-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-right md:text-3xl">
          ניהול פוסטים
        </h1>
        <div className="flex gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex gap-2 cursor-pointer">
                <PlusCircle className="w-5 h-5" />
                <span>פוסט יוטיוב</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  <AiPostForm />
                </DialogTitle>
                <DialogDescription dir="rtl">
                  הזן כתובת URL של סרטון יוטיוב ליצירת פוסט אוטומטית.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>

          <Button asChild>
            <Link href="/admin/posts/new" className="flex gap-2 items-center">
              <PlusCircle className="w-5 h-5" />
              <span>פוסט חדש</span>
            </Link>
          </Button>
        </div>
      </div>
      <AdminPostList posts={posts} />
      <Toaster />
    </div>
  );
}
