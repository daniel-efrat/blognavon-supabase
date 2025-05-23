"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchPosts } from "@/lib/supabase/posts";
import { Post } from "@/lib/types";
import LoadingOverlay from "@/components/loading-overlay";

interface SearchBarProps {
  onSearch: (query: string, results: Post[]) => void;
  placeholder?: string;
  initialPosts: Post[];  // Server-rendered posts passed from the parent
}

export function SearchBar({ 
  onSearch, 
  placeholder = "חיפוש...",
  initialPosts
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<Post[]>(initialPosts); // Start with server-rendered posts
  const [loading, setLoading] = useState(true); // Start loading to fetch all posts
  const [error, setError] = useState<string | null>(null);
  
  // Just use initial posts for searching, simple and reliable
  useEffect(() => {
    // Set loading to false immediately
    setLoading(false);
    
    // Use the initial posts for searching
    console.log('Using initial posts for search:', initialPosts.length);
    setPosts(initialPosts);
    
    // Let parent know we're ready
    setTimeout(() => {
      onSearch("", initialPosts);
    }, 100);
    
    // Save to localStorage for future use if needed
    try {
      localStorage.setItem('cachedAllPosts', JSON.stringify({
        posts: initialPosts,
        timestamp: new Date().getTime()
      }));
    } catch (err) {
      console.error('Error caching to localStorage:', err);
    }
  }, [initialPosts, onSearch]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    filterPosts(query);
  };
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    filterPosts(newQuery);
  };
  
  // Filter posts based on search term using Supabase
  const filterPosts = async (searchTerm: string) => {
    if (!searchTerm || !searchTerm.trim()) {
      // Empty search - use all posts
      onSearch("", posts);
      return;
    }
    
    console.log(`Searching posts with term: "${searchTerm}"`);
    setLoading(true);
    
    try {
      // Use Supabase search function
      const results = await searchPosts(searchTerm, 20);
      
      console.log(`Found ${results.length} matching posts for "${searchTerm}"`);
      // Notify the parent component of search results
      onSearch(searchTerm, results);
    } catch (err) {
      console.error('Error searching posts:', err);
      setError('אירעה שגיאה בחיפוש. נסה שוב מאוחר יותר.');
      // If there's an error, just return empty results
      onSearch(searchTerm, []);
    } finally {
      setLoading(false);
    }
  };
  
  // Clear search
  const handleClear = () => {
    setQuery("");
    onSearch("", posts);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {loading && <LoadingOverlay />}
      
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative flex items-center">
          <Input
            type="text"
            value={query}
            onChange={handleChange}
            placeholder={placeholder}
            className="w-full pr-10 pl-14 py-2 text-right placeholder:text-right"
            dir="rtl"
          />
          
          <button
            type="submit"
            className="absolute left-2 p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            aria-label="חפש"
          >
            <Search size={18} />
          </button>
          
          {query.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="נקה חיפוש"
            >
              ×
            </button>
          )}
        </div>
      </form>
      
      {error && <p className="text-destructive mt-2 text-center">{error}</p>}
    </div>
  );
}
