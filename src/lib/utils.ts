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
