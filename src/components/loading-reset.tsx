"use client";

import { useEffect } from "react";
import { useLoading } from "./loading-overlay";

export function LoadingReset() {
  const { setLoading } = useLoading();
  
  useEffect(() => {
    // Reset loading state when the component mounts
    setLoading(false);
  }, [setLoading]);
  
  return null; // This component doesn't render anything
}
