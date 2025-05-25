"use client"

import { useState, useEffect } from "react";
import Image from "next/image";

interface ClientFeaturedImageProps {
  src: string
  alt: string
  title: string
}

export function ClientFeaturedImage({ src, alt, title }: ClientFeaturedImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true);
    // Reset image status when src changes, to allow Next/Image to re-evaluate
    setImageLoaded(false);
    setImageError(false);
    
    return () => {
      setIsMounted(false);
    };
  }, [src]); // Rerun when src changes, or on mount/unmount

  const handleLoad = () => {
    if (isMounted) {
      setImageLoaded(true);
      setImageError(false); // Ensure error is cleared on successful load
      console.log('Blog post image loaded successfully');
    }
  }

  const handleError = () => {
    if (isMounted) {
      setImageError(true);
      setImageLoaded(false); // Ensure imageLoaded is false on error
      console.log('Blog post image failed to load');
    }
  }

  // Server-side or non-mounted state - don't render anything interactive
  if (!isMounted) return null;

  return (
    <div className="relative w-full h-full">
      {/* Primary image with client-side event handlers - only rendered on client */}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="100vw" // Adjust if specific constraints are known
        className="object-cover"
        style={{ 
          zIndex: imageLoaded && !imageError ? 10 : 0,
          display: imageError ? 'none' : 'block'
        }}
        loading="eager"
        onLoad={handleLoad}
        onError={handleError}
        priority
      />
      
      {/* Add a title fallback in case image fails */}
      <div className={`absolute inset-0 flex items-center justify-center ${imageError ? 'bg-destructive/10' : 'bg-muted'} z-[-1]`}>
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
