import Link from "next/link"
import { getPublishedPosts } from "@/lib/supabase/posts"
import { Post } from "@/lib/types"

export default async function Sitemap() {
  const posts = await getPublishedPosts()

  // Group posts by category
  const postsByCategory = posts.reduce(
    (acc: { [key: string]: Post[] }, post) => {
      const category = post.category || "כללי"
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(post)
      return acc
    },
    {}
  )
  return (
    <div className="container mx-auto px-4 py-8 rtl">
      <h1 className="text-3xl font-bold mb-8">מפת אתר</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">דפי מידע</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <Link
                href="/"
                className="text-accent hover:text-foreground transition-colors"
              >
                דף הבית
              </Link>
            </li>
            <li>
              <Link
                href="/terms-and-privacy"
                className="text-accent hover:text-foreground transition-colors"
              >
                תנאי שימוש ופרטיות
              </Link>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">בְּלוֹג</h2>
          <div className="space-y-4">
            <div>
              <Link
                href="/posts"
                className="text-accent hover:text-foreground transition-colors"
              >
                כל הפוסטים
              </Link>
            </div>

            {Object.entries(postsByCategory).map(
              ([category, categoryPosts]) => (
                <div key={category} className="ml-4">
                  <h3 className="text-lg font-medium mb-2">{category}</h3>
                  <ul className="list-disc list-inside space-y-2">
                    {categoryPosts.map((post) => (
                      <li key={post.id}>
                        <Link
                          href={`/blog/${post.slug}`}
                          className="text-accent hover:text-foreground transition-colors"
                        >
                          {post.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            )}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">משתמשים</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <Link
                href="/auth"
                className="text-accent hover:text-foreground transition-colors"
              >
                התחברות / הרשמה
              </Link>
            </li>
            <li>
              <Link
                href="/auth/reset-password"
                className="text-accent hover:text-foreground transition-colors"
              >
                איפוס סיסמה
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}
