"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-hooks";
import type { User } from "@supabase/supabase-js";
import { mapUserToAuthor } from "@/lib/supabase/user-utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { getCommentsByPostId } from "@/lib/supabase/comments";
import { Comment } from "@/lib/types";
import { useToast } from "./ui/use-toast";
import { formatDate } from "@/lib/utils";
import { MessageSquare, Trash2 } from "lucide-react";

interface CommentFormProps {
  postId: string; // Required for parent's handleSubmit
  onSubmit: (
    content: string,
    username?: string,
    parentId?: string
  ) => Promise<void>;
  parentId?: string;
  replyingTo?: string;
  onCancel?: () => void;
}

function CommentForm({
  postId,
  onSubmit,
  parentId,
  replyingTo,
  onCancel,
}: CommentFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // postId is required for API request validation, ensuring comments are associated with the correct post
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !content.trim() || !postId) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim(), username.trim() || undefined, parentId);
      setContent("");
      setUsername("");
      onCancel?.();
    } catch (err) {
      console.error("Failed to submit comment:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return user ? (
    <form onSubmit={handleSubmit} className="space-y-4">
      {replyingTo && (
        <p className="text-sm text-accent">מגיב ל: {replyingTo}</p>
      )}
      <Input
        placeholder="שם משתמש (לא חובה)"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        dir="rtl"
      />
      <Textarea
        placeholder="כתוב את התגובה שלך כאן..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[100px]"
        dir="rtl"
      />
      <div className="flex gap-2 justify-start">
        <Button type="submit" disabled={isSubmitting || !content.trim()}>
          {isSubmitting ? "שולח..." : "שלח תגובה"}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            ביטול
          </Button>
        )}
      </div>
    </form>
  ) : (
    <div className="p-4 text-center rounded-lg bg-muted">
      <p className="text-accent">יש להתחבר כדי להגיב</p>
    </div>
  );
}

interface CommentProps {
  comment: Comment;
  onReply: (parentId: string, authorName: string) => void;
  onDelete: (commentId: string) => Promise<void>;
  user: User | null;
  replies: Comment[];
  level?: number;
  commentHierarchy: Record<string, { comment?: Comment; replies: Comment[] }>;
}

function CommentComponent({
  comment,
  onReply,
  onDelete,
  user,
  replies,
  level = 0,
  commentHierarchy,
}: CommentProps) {
  const maxLevel = 3;

  return (
    <div className={`space-y-4 ${level > 0 ? "mr-4 border-r pr-4" : ""}`}>
      <div className="p-4 space-y-2 rounded-lg bg-card">
        <div className="flex justify-between items-start">
          <time className="text-sm text-accent">
            {formatDate(comment.createdAt)}
          </time>
          <div className="flex gap-2 items-center">
            <span className="font-medium">
              {comment.author?.username ||
                comment.author?.displayName ||
                "משתמש אנונימי"}
            </span>
            <div className="flex gap-1 items-center">
              {level < maxLevel && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    onReply(
                      comment.id,
                      comment.author.username ||
                        comment.author.displayName ||
                        "משתמש אנונימי"
                    )
                  }
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
              )}
              {user?.id === comment.author.uid && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(comment.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        <p className="text-right">
          {comment.number ? (
            <span className="ml-2 text-accent">{comment.number}.</span>
          ) : null}
          {comment.content}
        </p>
      </div>

      {replies.length > 0 && (
        <div className="space-y-4">
          {replies.map((reply) => (
            <CommentComponent
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onDelete={onDelete}
              user={user}
              replies={commentHierarchy[reply.id]?.replies || []}
              level={level + 1}
              commentHierarchy={commentHierarchy}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CommentSectionProps {
  postId: string;
  initialComments: Comment[];
}

export function CommentSection({
  postId,
  initialComments,
}: CommentSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>(initialComments || []);
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadComments() {
      try {
        setIsLoading(true);
        const loadedComments = await getCommentsByPostId(postId);
        setComments(loadedComments);
      } catch (err) {
        console.error("Failed to load comments:", err);
        toast({
          title: "אירעה שגיאה",
          description: "לא ניתן לטעון את התגובות כרגע",
          variant: "accent2",
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadComments();
  }, [postId, toast]);

  const commentHierarchy = comments.reduce((acc, comment) => {
    if (!comment.parentId) {
      if (!acc[comment.id]) {
        acc[comment.id] = { comment, replies: [] };
      } else {
        acc[comment.id].comment = comment;
      }
    } else {
      const parentId = comment.parentId;
      if (!acc[parentId]) {
        acc[parentId] = { replies: [comment] };
      } else {
        if (!acc[parentId].replies) {
          acc[parentId].replies = [];
        }
        acc[parentId].replies.push(comment);
      }
    }
    return acc;
  }, {} as Record<string, { comment?: Comment; replies: Comment[] }>);

  Object.values(commentHierarchy).forEach((item) => {
    if (item.replies) {
      item.replies.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
    }
  });

  async function handleSubmit(
    content: string,
    username?: string,
    parentId?: string
  ) {
    if (!user) return;

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          content,
          user,
          username,
          parentId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create comment");
      }

      const { commentId } = await response.json();

      const newComment: Comment = {
        id: commentId,
        postId,
        content,
        author: {
          ...mapUserToAuthor(user),
          username: username || undefined,
        },
        parentId,
        number: !parentId
          ? Math.max(
              0,
              ...comments.filter((c) => !c.parentId).map((c) => c.number || 0)
            ) + 1
          : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setComments((prev) => [newComment, ...prev]);
      toast({
        title: "תגובה נוספה בהצלחה",
        description: "התגובה שלך נוספה לפוסט",
      });
    } catch (err) {
      console.error("Failed to create comment:", err);
      toast({
        title: "אירעה שגיאה",
        description: "לא ניתן להוסיף את התגובה כרגע",
        variant: "accent2",
      });
    }
  }

  async function handleDelete(commentId: string) {
    if (!user) return;

    try {
      const response = await fetch("/api/comments", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentId,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      setComments(
        comments.filter(
          (comment) =>
            comment.id !== commentId && comment.parentId !== commentId
        )
      );
      toast({
        title: "התגובה נמחקה",
        description: "התגובה הוסרה בהצלחה",
      });
    } catch (err) {
      console.error("Failed to delete comment:", err);
      toast({
        title: "אירעה שגיאה",
        description: "לא ניתן למחוק את התגובה כרגע",
        variant: "accent2",
      });
    }
  }

  function handleReply(parentId: string, authorName: string) {
    setReplyTo({ id: parentId, name: authorName });
  }

  return (
    <div className="mt-16 space-y-8">
      <h2 className="text-2xl font-bold">תגובות</h2>

      {!replyTo && <CommentForm postId={postId} onSubmit={handleSubmit} />}

      {replyTo && (
        <div className="space-y-4">
          <CommentForm
            postId={postId}
            onSubmit={async (content, username) => {
              await handleSubmit(content, username, replyTo.id);
              setReplyTo(null);
            }}
            parentId={replyTo.id}
            replyingTo={replyTo.name}
            onCancel={() => setReplyTo(null)}
          />
        </div>
      )}

      {isLoading ? (
        <div className="py-8 text-center">
          <p className="text-accent">טוען תגובות...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-accent">אין תגובות עדיין. היה הראשון להגיב!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(commentHierarchy)
            .filter(([, { comment }]) => comment && !comment.parentId)
            .sort((a, b) => {
              const commentA = a[1].comment!;
              const commentB = b[1].comment!;
              return commentA.number! - commentB.number!;
            })
            .map(
              ([id, { comment, replies }]) =>
                comment && (
                  <CommentComponent
                    key={id}
                    comment={comment}
                    replies={replies}
                    onReply={handleReply}
                    onDelete={handleDelete}
                    user={user}
                    commentHierarchy={commentHierarchy}
                  />
                )
            )}
        </div>
      )}
    </div>
  );
}
