// src/lib/uploadImage.ts
import { supabase } from "@/lib/supabase/client";

/**
 * Uploads an image to Supabase Storage and returns the public URL
 */
export async function uploadImage(file: File, bucket: string = 'blog-images') {
  try {
    // Generate a unique filename with timestamp and original extension
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    
    // Check if user is logged in first (important for RLS)
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error('יש להתחבר לפני העלאת תמונות');
    }
    
    // Upload the file to Supabase Storage
    const { error } = await supabase
      .storage
      .from(bucket)
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      });
    
    if (error) {
      // Special handling for RLS policy errors
      if (error.message.includes('row-level security') || error.message.includes('RLS')) {
        console.error('RLS policy error:', error);
        throw new Error(`שגיאת הרשאות: יש להגדיר מדיניות RLS עבור מיכל האחסון '${bucket}'. הריצו את הסקריפט scripts/setup-storage.ts`);
      }
      // Special handling for bucket not found
      else if (error.message.includes('does not exist')) {
        console.error('Bucket not found error:', error);
        throw new Error(`מיכל האחסון '${bucket}' לא קיים. הריצו את הסקריפט scripts/setup-storage.ts ליצירתו`);
      }
      // Any other error
      throw new Error(error.message || 'שגיאה בהעלאת הקובץ לאחסון');
    }
    
    // Get the public URL
    const { data: publicUrlData } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(fileName);
    
    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error('שגיאה בקבלת כתובת URL ציבורית לקובץ');
    }
    
    return {
      url: publicUrlData.publicUrl,
      path: fileName
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    
    // Make sure we're returning a string error message 
    if (error instanceof Error) {
      throw new Error(error.message);
    } else if (typeof error === 'string') {
      throw new Error(error);
    } else {
      throw new Error('שגיאה לא ידועה בהעלאת התמונה');
    }
  }
}

/**
 * Creates a thumbnail blob from a file
 */
export function createThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('הקובץ שנבחר אינו קובץ תמונה'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (error) => {
      // Convert FileReader error to string message
      if (error instanceof Error) {
        reject(new Error(error.message));
      } else {
        reject(new Error('שגיאה בקריאת קובץ התמונה'));
      }
    };
  });
}
