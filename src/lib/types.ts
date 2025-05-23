// src/lib/types.ts
export interface CommentAuthor {
  uid?: string
  username?: string
  displayName?: string | null
}

export interface Comment {
  id: string
  postId: string
  content: string
  author: CommentAuthor
  createdAt: Date
  updatedAt: Date
  parentId?: string
  number?: number
}

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
  content?: string
  category?: string
  tags?: string[]
}
