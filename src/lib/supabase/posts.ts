import { createClient } from "@supabase/supabase-js";
import type { Post } from "@/lib/types";

// Create a Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getPublishedPosts(): Promise<Post[]> {
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }

  return (posts || []).map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content || "",
    author: post.author,
    createdAt: post.created_at,
    updatedAt: post.updated_at,
    featuredImage: post.featured_image_url,
    status: post.status,
    tags: post.tags,
    category: post.category,
  }));
}

/**
 * Get posts published in the last 7 days
 * @returns Array of posts from the last week
 */
export async function getWeeklyPosts(): Promise<Post[]> {
  // Calculate date 7 days ago
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoISOString = sevenDaysAgo.toISOString();

  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .gte("created_at", sevenDaysAgoISOString)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching weekly posts:", error);
    throw error;
  }

  return (posts || []).map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content || "",
    author: post.author,
    createdAt: post.created_at,
    updatedAt: post.updated_at,
    featuredImage: post.featured_image_url,
    status: post.status,
    tags: post.tags,
    category: post.category,
  }));
}

/**
 * Search for posts by title, content, or tags
 * @param searchQuery The search query string
 * @param limit Maximum number of results to return
 * @returns Array of matching posts
 */
export async function searchPosts(
  searchQuery: string,
  limit: number = 10
): Promise<Post[]> {
  if (!searchQuery.trim()) {
    return [];
  }

  // Create a search pattern with the ilike operator (case-insensitive LIKE)
  const searchPattern = `%${searchQuery}%`;

  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .or(
      `title.ilike.${searchPattern},` +
        `content.ilike.${searchPattern},` +
        `excerpt.ilike.${searchPattern}`
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error searching posts:", error);
    throw error;
  }

  return (posts || []).map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content || "",
    author: post.author,
    createdAt: post.created_at,
    updatedAt: post.updated_at,
    featuredImage: post.featured_image_url,
    status: post.status,
    tags: post.tags,
    category: post.category,
  }));
}
