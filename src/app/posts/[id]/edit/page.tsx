// src/app/admin/posts/[id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { uploadImage, createThumbnail } from "@/lib/uploadImage";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string;

  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    author: "",
    featured_image_url: "",
    status: "draft",
    category: "",
    tags: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPost() {
      setLoading(true);
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", postId)
        .single();

      if (error) {
        setError(error.message);
      } else if (data) {
        setForm({
          ...data,
          tags: Array.isArray(data.tags) ? data.tags.join(", ") : "",
        });
        if (data.featured_image_url) {
          setImagePreview(data.featured_image_url);
        }
      }
      setLoading(false);
    }
    if (postId) fetchPost();
  }, [postId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setImageUploading(true);
      setError(null);
      
      // Create preview
      const preview = await createThumbnail(file);
      setImagePreview(preview);
      
      // Upload to Supabase Storage
      const { url } = await uploadImage(file);
      
      // Update form with new URL
      setForm({ ...form, featured_image_url: url });
      
      // Final preview as the actual URL
      setImagePreview(url);
    } catch (err) {
      console.error('Image upload error:', err);
      // Better error handling to avoid [object Object] errors
      if (err instanceof Error) {
        setError(`שגיאה בהעלאת התמונה: ${err.message}`);
      } else if (typeof err === 'string') {
        setError(`שגיאה בהעלאת התמונה: ${err}`);
      } else {
        setError('שגיאה לא ידועה בהעלאת התמונה');
      }
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Convert tags to array
    const tagsArray = form.tags.split(",").map((tag) => tag.trim()).filter(Boolean);

    const { error } = await supabase
      .from("posts")
      .update({
        ...form,
        tags: tagsArray,
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId);

    setSaving(false);

    if (error) {
      setError(error.message);
    } else {
      router.push("/admin/posts");
    }
  };

  if (loading) {
    return <div className="p-4">טוען פוסט...</div>;
  }

  return (
    <main className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">עריכת פוסט</h1>
      <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
        <div>
          <label className="block mb-1 font-semibold">כותרת</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Slug</label>
          <input
            type="text"
            name="slug"
            value={form.slug}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">תוכן (HTML)</label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 h-32"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">תקציר</label>
          <textarea
            name="excerpt"
            value={form.excerpt}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 h-16"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">מחבר</label>
          <input
            type="text"
            name="author"
            value={form.author}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">תמונה ראשית</label>
          <div className="space-y-2">
            {imagePreview && (
              <div className="relative w-full h-40 mb-2 border rounded overflow-hidden">
                <img 
                  src={imagePreview} 
                  alt="תצוגה מקדימה של התמונה" 
                  className="object-cover w-full h-full"
                />
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="border rounded p-2 flex-grow text-sm"
                disabled={imageUploading}
              />
              {imageUploading && <span className="text-blue-600">מעלה תמונה...</span>}
              <input
                type="text"
                name="featured_image_url"
                value={form.featured_image_url}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder="או הכנס URL של תמונה"
              />
            </div>
          </div>
        </div>
        <div>
          <label className="block mb-1 font-semibold">סטטוס</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="draft">טיוטה</option>
            <option value="published">פורסם</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-semibold">קטגוריה</label>
          <input
            type="text"
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">תגיות (מופרדות בפסיק)</label>
          <input
            type="text"
            name="tags"
            value={form.tags}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={saving || imageUploading}
        >
          {saving ? "שומר..." : "שמור שינויים"}
        </button>
      </form>
    </main>
  );
}
