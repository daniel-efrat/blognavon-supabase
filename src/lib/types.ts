// src/lib/types.ts
export interface Post {
  excerpt?: string
  id: string
  title: string
  slug: string
  author: string
  createdAt: string | Date // Or just Date if you ensure conversion
  updatedAt: string | Date // Or just Date
  status: "published" | "draft" | "archived"
  featuredImage?: string
  // Add any other fields your posts might have, e.g., content
}
