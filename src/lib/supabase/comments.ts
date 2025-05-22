import { createClient } from '@supabase/supabase-js';
import type { Comment, User } from '@/lib/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getCommentsByPostId(postId: string): Promise<Comment[]> {
  const { data: comments, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }

  return (comments || []).map(comment => ({
    id: comment.id,
    postId: comment.post_id,
    parentId: comment.parent_id,
    content: comment.content,
    number: comment.number,
    author: {
      uid: comment.user_id,
      username: comment.username,
      displayName: comment.username
    },
    createdAt: new Date(comment.created_at),
    updatedAt: new Date(comment.updated_at)
  }));
}

export async function createComment(
  postId: string,
  content: string,
  user: User,
  username?: string,
  parentId?: string
): Promise<string> {
  // Get the highest number for the post
  let number: number | undefined;
  if (!parentId) {
    const { data: maxNumber } = await supabase
      .from('comments')
      .select('number')
      .eq('post_id', postId)
      .is('parent_id', null)
      .order('number', { ascending: false })
      .limit(1)
      .single();

    number = (maxNumber?.number || 0) + 1;
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      parent_id: parentId,
      content,
      number,
      user_id: user.uid,
      username: username || user.displayName
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating comment:', error);
    throw error;
  }

  return data.id;
}

export async function deleteComment(commentId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('comments')
    .delete()
    .match({ id: commentId, user_id: userId });

  if (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
}

// Server-side function that uses service role to fetch comments
export async function getServerCommentsByPostId(postId: string): Promise<Comment[]> {
  const serviceRole = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: comments, error } = await serviceRole
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }

  return (comments || []).map(comment => ({
    id: comment.id,
    postId: comment.post_id,
    parentId: comment.parent_id,
    content: comment.content,
    number: comment.number,
    author: {
      uid: comment.user_id,
      username: comment.username,
      displayName: comment.username
    },
    createdAt: new Date(comment.created_at),
    updatedAt: new Date(comment.updated_at)
  }));
}
