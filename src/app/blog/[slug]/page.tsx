import React from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { CommentSection } from "@/components/comment-section";
import { EditPostButton } from "@/components/edit-post-button";
import { Comment } from "@/lib/types"; // Import Comment type
import { LoadingReset } from "@/components/loading-reset";
import { ArrowLeft, ArrowRight, Facebook, Instagram } from "lucide-react";
import { NavigationalLink } from "@/components/navigational-link";
import { WhatsappIcon } from "@/components/svg/whatsapp";
import { TwitterXIcon } from "@/components/svg/twitter-x";
import { ClientFeaturedImage } from "@/components/client-featured-image";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { isAdmin } from "@/lib/supabase/server-auth-utils";

// Helper function to fetch a post by slug from Supabase
async function getPostBySlugSupabase(
  slug: string,
  includeAllStatuses: boolean = false
) {
  try {
    console.log(
      `Fetching post with slug: ${slug}, includeAllStatuses: ${includeAllStatuses}`
    );
    const supabase = await createServerSupabaseClient();

    if (!supabase) {
      console.error("Failed to create Supabase client");
      return null;
    }

    // Build query based on admin status
    let query = supabase.from("posts").select("*").eq("slug", slug).limit(1);

    // Only include published posts for non-admin users
    if (!includeAllStatuses) {
      query = query.eq("status", "published");
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching post from Supabase:", error);
      return null;
    }

    // Return null if no post found
    if (!data || data.length === 0) {
      console.log(`No post found with slug: ${slug}`);
      return null;
    }

    console.log(`Successfully fetched post: ${data[0].title}`);

    // Extract the post
    const supabasePost = data[0];

    // Need to fetch adjacent posts for navigation
    let previousPostSlug = null;
    let nextPostSlug = null;

    try {
      // Get previous post (older than current post)
      const { data: prevData } = await supabase
        .from("posts")
        .select("slug")
        .lt("created_at", supabasePost.created_at)
        .eq("status", "published") // Always filter by published for adjacent posts
        .order("created_at", { ascending: false })
        .limit(1);

      // Get next post (newer than current post)
      const { data: nextData } = await supabase
        .from("posts")
        .select("slug")
        .gt("created_at", supabasePost.created_at)
        .eq("status", "published") // Always filter by published for adjacent posts
        .order("created_at", { ascending: true })
        .limit(1);

      if (prevData && prevData.length > 0) {
        previousPostSlug = prevData[0].slug;
      }

      if (nextData && nextData.length > 0) {
        nextPostSlug = nextData[0].slug;
      }
    } catch (error) {
      console.error("Error fetching adjacent posts:", error);
    }

    // Transform the post to match expected format
    return {
      id: supabasePost.id,
      title: supabasePost.title,
      slug: supabasePost.slug,
      excerpt: supabasePost.excerpt || "",
      content: supabasePost.content || "",
      author: supabasePost.author,
      createdAt: new Date(supabasePost.created_at),
      updatedAt: new Date(supabasePost.updated_at),
      featuredImage: supabasePost.featured_image_url,
      status: supabasePost.status,
      tags: supabasePost.tags,
      category: supabasePost.category,
      previousPostSlug,
      nextPostSlug,
    };
  } catch (error) {
    console.error("Unexpected error in getPostBySlugSupabase:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params;

    // Check if user is admin to determine whether to show draft posts
    const userIsAdmin = await isAdmin();
    console.log(
      `Metadata generation - User is admin: ${userIsAdmin}, slug: ${resolvedParams.slug}`
    );

    // Fetch post from Supabase
    const post = await getPostBySlugSupabase(resolvedParams.slug, userIsAdmin);

    if (!post) {
      return {
        title: "Post Not Found",
        description: "The requested blog post could not be found.",
      };
    }

    const url = `https://blognavon.com/blog/${resolvedParams.slug}`;

    return {
      title: post.title,
      description: post.content.slice(0, 200).replace(/<[^>]*>/g, "") + "...",
      openGraph: {
        title: post.title,
        description: post.content.slice(0, 200).replace(/<[^>]*>/g, "") + "...",
        images: [
          {
            url: post.featuredImage || "/bn.png",
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
        url: url,
        type: "article",
        siteName: "בְּלוֹגנָבוֹן",
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.content.slice(0, 200).replace(/<[^>]*>/g, "") + "...",
        images: [post.featuredImage || "/bn.png"],
      },
      alternates: {
        canonical: url,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "בְּלוֹגנָבוֹן",
      description: "בְּלוֹג על בינה מלאכותית ולמידת מכונה",
    };
  }
}

// Use ISR with a 1-hour revalidation period
export const revalidate = 3600; // Revalidate content every hour

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPost({ params }: PageProps) {
  try {
    const resolvedParams = await params;

    // Check if user is admin to determine whether to show draft posts
    const userIsAdmin = await isAdmin();
    console.log(
      `Blog post page - User is admin: ${userIsAdmin}, slug: ${resolvedParams.slug}`
    );

    // Fetch post from Supabase
    const post = await getPostBySlugSupabase(resolvedParams.slug, userIsAdmin);

    if (!post) {
      console.log(`Blog post not found for slug: ${resolvedParams.slug}`);
      notFound();
    }

    // Double-check: if somehow a draft post is returned and user is not admin
    if (post.status === "draft" && !userIsAdmin) {
      console.log(
        `Unauthorized access attempt to draft post: ${resolvedParams.slug}`
      );
      // Redirect to homepage if trying to access a draft post without admin rights
      redirect("/");
    }

    // We'll load comments client-side for better performance
    const initialComments: Comment[] = [];

    return (
      <article
        className="relative p-8 mx-auto mt-4 max-w-3xl bg-gray-50 rounded-lg shadow-md transition-all duration-300 md:bg-gray-50/50 dark:bg-black/50 md:backdrop-blur-sm"
        style={{ viewTransitionName: `post-${post.id}` }}
      >
        <LoadingReset />
        <EditPostButton postId={post.id} />
        <div className="flex justify-between items-center mb-8">
          {post.previousPostSlug ? (
            <NavigationalLink
              href={`/blog/${post.previousPostSlug}`}
              className="flex items-center gap-2 text-accent hover:text-primary transition-colors no-underline"
              style={{ viewTransitionName: `prev-${post.id}` }}
            >
              <ArrowRight className="w-4 h-4" />
              <span>הפוסט הקודם</span>
            </NavigationalLink>
          ) : (
            <div /> // Placeholder to maintain layout
          )}
          {post.nextPostSlug ? (
            <NavigationalLink
              href={`/blog/${post.nextPostSlug}`}
              className="flex items-center gap-2 text-accent hover:text-primary transition-colors no-underline"
              style={{ viewTransitionName: `next-${post.id}` }}
            >
              <span>הפוסט הבא</span>
              <ArrowLeft className="w-4 h-4" />
            </NavigationalLink>
          ) : (
            <div /> // Placeholder to maintain layout
          )}
        </div>

        <div className="space-y-4">
          <h1
            className="text-4xl font-bold tracking-tight"
            style={{ viewTransitionName: `title-${post.id}` }}
          >
            {post.title}
          </h1>
          <div className="flex gap-2 items-center text-sm text-accent">
            <time dateTime={post.createdAt.toISOString()}>
              {formatDate(post.createdAt)}
            </time>
            <span>•</span>
            <span>{post.author || "כותב לא ידוע"}</span>{" "}
            {/* Use author field with Hebrew fallback */}
          </div>
          <div className="flex gap-4 items-center my-4">
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                `${post.title} - https://blognavon.com/blog/${resolvedParams.slug}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors text-accent hover:text-green-500"
            >
              <WhatsappIcon className="w-5 h-5" />
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                `https://blognavon.com/blog/${resolvedParams.slug}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors text-accent hover:text-blue-600"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                `https://blognavon.com/blog/${resolvedParams.slug}`
              )}&text=${encodeURIComponent(post.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors text-accent hover:text-sky-500"
            >
              <TwitterXIcon className="w-5 h-5" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors text-accent hover:text-pink-600"
            >
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div
          className="relative mt-4 w-full rounded-lg low-hidden aspect-video"
          style={{ viewTransitionName: `image-${post.id}` }}
        >
          <div
            className={`w-full h-full ${
              post.featuredImage?.trim()
                ? ""
                : "bg-muted flex items-center justify-center"
            }`}
          >
            {post.featuredImage?.trim() ? (
              <>
                {/* Using ClientFeaturedImage component with error boundary */}
                <div className="relative w-full h-full">
                  {/* Fallback rendering when client component fails */}
                  <div className="absolute inset-0 z-0">
                    <div
                      className="w-full h-full bg-center bg-cover"
                      style={{ backgroundImage: `url(${post.featuredImage})` }}
                    />
                  </div>

                  {/* Client component for enhanced functionality */}
                  <ClientFeaturedImage
                    src={post.featuredImage}
                    alt={post.title}
                    title={post.title}
                  />
                </div>
              </>
            ) : (
              <span className="text-accent" dir="rtl" lang="he">
                תמונה לא זמינה
              </span>
            )}
          </div>
        </div>

        <div
          className="mt-8 text-base"
          dir="rtl"
          style={{ width: "100%", wordBreak: "break-word" }}
        >
          {post.category === "מדריכים" && (
            <div className="inline-block px-3 py-1 mb-4 text-sm font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-100">
              מדריך
            </div>
          )}
          <div
            className="text-right font-assistant"
            style={{ width: "100%", wordBreak: "break-word" }}
          >
            <div
              className={`prose dark:prose-invert text-right font-assistant max-w-none ${
                post.category === "מדריכים" ? "guide-content" : ""
              }`}
              dangerouslySetInnerHTML={{
                __html: (() => {
                  const processedContent = post.content
                    .replace(/\\n/g, "\n")
                    .replace(/\\\\/g, "\\")
                    .replace(/\\"/g, '"')
                    .replace(/"/g, '"');
                  return processedContent;
                })(),
              }}
            />
          </div>
        </div>

        <CommentSection
          postId={post.id}
          initialComments={initialComments} // Pass fetched initial comments
        />
      </article>
    );
  } catch (error) {
    console.error("Error fetching post:", error);
    return (
      <div className="py-12 text-center">
        <h1 className="text-2xl font-bold">שגיאה בטעינת הפוסט</h1>
        <p className="mt-2 text-accent">אירעה שגיאה בטעינת הפוסט.</p>
        <NavigationalLink
          href="/"
          className="inline-block mt-4 text-primary hover:underline"
        >
          חזור לדף הבית
        </NavigationalLink>
      </div>
    );
  }
}
