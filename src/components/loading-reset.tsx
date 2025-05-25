"use client";

import { useEffect } from "react";
import { useLoading } from "./loading-overlay";
import { usePathname } from 'next/navigation';

export function LoadingReset() {
  const { setLoading } = useLoading();
  const pathname = usePathname();
  
  useEffect(() => {
    // Reset loading state when the pathname changes (i.e., navigation has occurred)
    setLoading(false);
  }, [pathname, setLoading]); // Depend on pathname and setLoading
  
  return null; // This component doesn't render anything
}
