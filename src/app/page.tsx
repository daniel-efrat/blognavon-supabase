// src/app/page.tsx
import { createServerSupabaseClient } from "@/lib/supabase/server";
import SearchableGrid from "@/components/searchable-grid";
import HeroSection from "@/components/HeroSection";

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();

  const { data: rawPosts, error } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, author, featured_image_url, category, created_at, updated_at")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    return <div className="p-4 text-red-600">Error loading posts: {error.message}</div>;
  }

  // Transform raw posts to match Post interface
  const posts = (rawPosts || []).map(post => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    author: post.author,
    featuredImage: post.featured_image_url,
    category: post.category,
    createdAt: post.created_at,
    updatedAt: post.updated_at || post.created_at,
    status: "published" as const,
    content: "",
    tags: []
  }));

  return (
    <main className="container mx-auto p-4">
      <HeroSection/>
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">פוסטים אחרונים</h1>

      <SearchableGrid initialPosts={posts}/>
    </main>
  );
}
