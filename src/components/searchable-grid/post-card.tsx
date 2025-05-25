"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Post } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useLoading } from "@/components/loading-overlay";
import { m } from "framer-motion";

// Post card component that matches the blog post card styling
export function PostCard({ post }: { post: Post }) {
  const router = useRouter();
  const { setLoading } = useLoading();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push(`/blog/${post.slug}`);
    }, 100);
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <m.div variants={item} style={{ viewTransitionName: `post-${post.id}` }}>
      <Link
        href={`/blog/${post.slug}`}
        className="no-underline hover:no-underline"
        onClick={handleClick}
        target="_self"
      >
        <Card
          className="h-full overflow-hidden transition-all shadow-md border-gray-300 dark:border-none hover:shadow-lg hover:scale-[1.02] flex flex-col justify-between dark:bg-[#090A0C] bg-[#F9FAFB] card no-underline"
          style={{ viewTransitionName: `card-${post.id}` }}
        >
          <div>
            <div
              className="relative w-full aspect-video"
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
                    {/* Native img tag for production reliability */}
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="absolute inset-0 w-full h-full object-cover z-10"
                      loading="eager"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                        console.log(
                          "SearchGrid: Image failed to load",
                          post.featuredImage
                        )
                      }}
                    />

                    {/* Next.js Image component as backup */}
                    <div className="absolute no-underline inset-0 z-0">
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                        style={{ viewTransitionName: `img-${post.id}` }}
                        unoptimized={true}
                      />
                    </div>

                    {/* Fallback title */}
                    <div className="absolute inset-0 flex items-center no-underline justify-center bg-muted z-[-1]">
                      <span
                        className="text-accent text-center px-4 font-bold"
                        dir="rtl"
                        lang="he"
                      >
                        {post.title}
                      </span>
                    </div>
                  </>
                ) : (
                  <span className="text-accent">No image</span>
                )}
              </div>
            </div>

            <CardHeader className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3
                  className="text-xl no-underline font-bold line-clamp-2 hover:no-underline"
                  style={{ viewTransitionName: `title-${post.id}`, textDecoration: 'none' }}
                >
                  {post.title}
                </h3>
                {post.status === "draft" && (
                  <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 rounded-full">
                    טיוטה
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div
                className="text-accent prose-sm prose-neutral dark:prose-invert line-clamp-3 prose-a:no-underline hover:prose-a:no-underline"
                dir="rtl"
                style={{ textDecoration: 'none' }}
              >
                <div
                style={{ textDecoration: 'none' }}
                  className="!font-assistant !no-underline text-lg hover:no-underline [&_a]:no-underline [&_a]:hover:no-underline"
                  dangerouslySetInnerHTML={{
                    __html: post.excerpt?.replace(/\\n/g, "\n") || "",
                  }}
                />
              </div>
            </CardContent>
          </div>
          <CardFooter className="flex justify-between p-4 pt-0 text-sm text-accent">
            <span>{post.author || "Unknown author"}</span>
            <time
              dateTime={new Date(post.createdAt).toISOString()}
            >
              {formatDate(post.createdAt)}
            </time>
          </CardFooter>
        </Card>
      </Link>
    </m.div>
  )
}
