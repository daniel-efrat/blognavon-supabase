export interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  featuredImage?: string
  author?: string
  status: "draft" | "published"
  tags?: string[]
  category?: string
  createdAt: string
  updatedAt?: string
}

export interface PostSummary {
  id: string
  title: string
  slug: string
  author?: string
  status: "draft" | "published"
  createdAt: Date
  updatedAt: Date
}

export interface TitlesAndSlugs {
  title: string
  slug: string
}

export interface Comment {
  id: string
  postId: string
  content: string
  author?: string
  createdAt: Date
  updatedAt?: Date
}
