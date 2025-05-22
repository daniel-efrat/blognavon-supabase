// src/app/page.tsx
import { createServerSupabaseClient } from "@/lib/supabase/server";
import Link from 'next/link';
import Image from 'next/image';
import SearchableGrid from "@/components/searchable-grid";

interface Post {
  id: string | number;
  title: string;
  slug: string;
  excerpt: string | null;
  author: string | null;
  featured_image_url: string | null;
  category: string | null;
  created_at: string;
}

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();

  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, author, featured_image_url, category, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    return <div className="p-4 text-red-600">Error loading posts: {error.message}</div>;
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">פוסטים אחרונים</h1>

      <SearchableGrid/>
    </main>
  );
}
