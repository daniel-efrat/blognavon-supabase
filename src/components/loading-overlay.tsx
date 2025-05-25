"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (isLoading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  const setLoading = React.useCallback((isLoading: boolean) => {
    setIsLoading(isLoading);
  }, []); // Add useCallback with empty dependency array

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading }}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" dir="rtl">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-assistant">טוען...</p>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}

// Simple standalone loading overlay component for direct use
export default function LoadingOverlay() {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center rounded-md" dir="rtl">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col items-center">
        <div className="w-8 h-8 border-3 border-t-primary rounded-full animate-spin mb-2"></div>
        <p className="text-sm font-assistant">טוען...</p>
      </div>
    </div>
  );
}
