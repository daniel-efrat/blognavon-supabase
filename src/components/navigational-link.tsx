"use client";

import Link from "next/link";
import { useLoading } from "@/components/loading-overlay";
import React, { ReactNode } from "react";

type NavigationalLinkProps = Omit<React.ComponentProps<typeof Link>, 'onClick'> & {
  children: ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void; // Explicitly include onClick if needed for other purposes
};

export function NavigationalLink({ children, href, className, onClick: originalOnClick, ...rest }: NavigationalLinkProps) {
  const { setLoading } = useLoading();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If the link is to the current page, or an empty hash, don't trigger loading
    // Call original onClick if it exists, before our logic
    if (originalOnClick) {
      originalOnClick(e);
    }

    // If the original onClick prevented default, respect that
    if (e.defaultPrevented) {
      return;
    }

    // If the link is to the current page, or an empty hash, or a non-http link, don't trigger loading
    const currentFullUrl = window.location.pathname + window.location.search + window.location.hash;
    const targetUrl = href.toString();

    if (targetUrl === currentFullUrl || targetUrl === '#' || (!targetUrl.startsWith('/') && !targetUrl.startsWith('http'))) {
      return;
    }
    
    setLoading(true);
  };

  return (
    <Link href={href} className={className} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}
