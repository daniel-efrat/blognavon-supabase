"use client"

import Image from "next/image"
import { useState, useEffect } from "react"

interface ClientFeaturedImageProps {
  src: string
  alt: string
  postId: string
  title: string
}

export function ClientFeaturedImage({ src, alt, postId, title }: ClientFeaturedImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Safe mounting check to prevent hydration issues
  useEffect(() => {
    setIsMounted(true)
    
    // Pre-load the image to check if it exists
    const img = new window.Image();
    img.src = src;
    
    img.onload = () => {
      if (isMounted) setImageLoaded(true);
    };
    
    img.onerror = () => {
      if (isMounted) setImageError(true);
    };
    
    return () => {
      setIsMounted(false);
    };
  }, [src]);

  const handleLoad = () => {
    if (isMounted) {
      setImageLoaded(true);
      console.log('Blog post image loaded successfully');
    }
  }

  const handleError = () => {
    if (isMounted) {
      setImageError(true);
      console.log('Blog post image failed to load');
    }
  }

  // Server-side or non-mounted state - don't render anything interactive
  if (!isMounted) return null;

  return (
    <div className="relative w-full h-full">
      {/* Primary image with client-side event handlers - only rendered on client */}
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: imageLoaded ? 10 : 0 }}
        loading="eager"
        onLoad={handleLoad}
        onError={handleError}
      />
      
      {/* Add a title fallback in case image fails */}
      <div className="absolute inset-0 flex items-center justify-center bg-muted z-[-1]">
        <span 
          className="text-accent text-center px-4 font-bold" 
          dir="rtl"
          lang="he"
        >
          {title}
        </span>
      </div>
    </div>
  )
}
