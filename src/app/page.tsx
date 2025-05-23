// src/app/page.tsx
import { createServerSupabaseClient } from "@/lib/supabase/server";
import SearchableGrid from "@/components/searchable-grid";
import HeroSection from "@/components/HeroSection";

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
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
      <HeroSection/>
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">פוסטים אחרונים</h1>

      <SearchableGrid/>
    </main>
  );
}
