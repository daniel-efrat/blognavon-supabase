// src/app/page.tsx
import { createServerSupabaseClient } from "@/lib/supabase/server";
import SearchableGrid from "@/components/searchable-grid";
import HeroSection from "@/components/HeroSection";

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();

  // Get user session
  const { data: { user } } = await supabase.auth.getUser();

  // Check if user is admin by looking for 'admin' in app_metadata.roles
  const roles = user?.app_metadata?.roles as string[] | undefined;
  const isAdmin = roles?.includes('admin') ?? false;

  // Base query
  let queryBuilder = supabase
    .from("posts")
    .select("id, title, slug, excerpt, author, featured_image_url, category, created_at, updated_at, status") // Added status to select
    .order("created_at", { ascending: false });

  // Conditionally filter by status
  if (!isAdmin) {
    queryBuilder = queryBuilder.eq("status", "published");
  } else {
    // Admin can see published and draft posts
    queryBuilder = queryBuilder.in("status", ["published", "draft"]);
  }

  const { data: rawPosts, error } = await queryBuilder;

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
    status: post.status as "draft" | "published", // Use actual status from DB
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
