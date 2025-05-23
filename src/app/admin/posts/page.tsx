// src/app/admin/posts/page.tsx
import { AdminPostList } from '@/components/admin/admin-post-list';
import { supabase as adminSupabase } from '@/lib/supabase/admin'; // Using admin client for full access
import type { Post } from '@/lib/types';
import { redirect } from 'next/navigation';
import { Toaster } from "@/components/ui/toaster";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server'; // For user session

async function getSessionUser() {
  const supabase = createServerSupabaseClient();

  try {
    // First get the session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) throw new Error('No session found');

    // Then get the user to ensure we have fresh metadata
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('No user found');

    return { user, session };
  } catch (error) {
    console.error('Auth error:', error);
    redirect('/auth');
  }
}

async function getPosts(): Promise<Post[]> {
  // Get the session and user
  const { user, session } = await getSessionUser();

  // Log full session details for debugging
  console.log('Session details:', {
    userId: user.id,
    email: user.email,
    app_metadata: user.app_metadata,
    session_id: session.access_token,
    expires_at: session.expires_at
  });

  if (!user.app_metadata?.roles?.includes('admin')) {
    console.warn('User is not admin:', {
      userId: user.id,
      roles: user.app_metadata?.roles,
      email: user.email
    });
    redirect('/');
  }

  // If user is admin, fetch posts using the admin client for potentially elevated privileges
  const { data, error: postsError } = await adminSupabase
    .from('posts')
    .select('id, title, slug, author, created_at, updated_at, status') // Ensure all needed fields are selected
    .order('created_at', { ascending: false });

  if (postsError) {
    console.error('Error fetching posts:', postsError);
    // Optionally, you could return an empty array or throw an error to be caught by an error boundary
    return []; 
  }

  // Map to the Post type, ensuring date fields are handled correctly
  return data.map(post => ({
    ...post,
    createdAt: new Date(post.created_at),
    updatedAt: new Date(post.updated_at),
    // Ensure 'author' and 'slug' are present if your Post type requires them
    // If they can be null in the DB, adjust your Post type or provide defaults
    author: post.author || 'Unknown Author', 
    slug: post.slug || '', 
  })) as Post[];
}

export default async function AdminPostsPage() {
  const posts = await getPosts();

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-right">ניהול פוסטים</h1>
        <Button asChild>
          <Link href="/admin/edit/new" className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            <span>פוסט חדש</span>
          </Link>
        </Button>
      </div>
      <AdminPostList posts={posts} />
      <Toaster />
    </div>
  );
}
