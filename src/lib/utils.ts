import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string | Date): string {
  return new Date(dateString).toLocaleDateString('he-IL', { // Hebrew locale for Israel
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export const cleanupHtml = (content: string): string => {
  if (!content) return ""
  return content
    .replace(/\\n/g, " ")
    .replace(/\n/g, " ")
    .replace(/>\s+</g, "><")
    .replace(/<p>\s*<\/p>/g, "")
    .replace(/<p>\s+/g, "<p>")
    .replace(/\s+<\/p>/g, "</p>")
    .replace(/\s+/g, " ")
    .trim()
}
