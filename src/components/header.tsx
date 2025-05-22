"use client";

import { usePathname } from "next/navigation";
import { m } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuth } from "@/lib/auth-hooks.tsx";
import { LazyMotion, domAnimation } from "framer-motion";

export default function Header() {
  const { user, isAdmin, signOut } = useAuth();
  const pathname = usePathname();

  // Check if the current route is the landing page
  const isLandingPage = pathname === "/landing";

  // Define the width of the animated border based on the route
  const getRouteWidth = (route: string): string => {
    if (route.startsWith("/admin")) {
      return "60px"; // Width for all admin routes
    }

    const routeWidths: { [key: string]: string } = {
      "/": "60px", // Width for the home page
      "/login": "60px", // Width for the login page
      "/signup": "60px", // Width for the signup page
    };

    return routeWidths[route] || "0px"; // Default to 0 if not found
  };

  return (
    <LazyMotion features={domAnimation}>
      {!isLandingPage && (
        <m.header
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          layout
          dir="rtl"
          className="border-b sticky inset-0 z-50 bg-gray-50/20 dark:bg-black/20 backdrop-blur-sm transition-colors duration-300"
        >
          <div
            dir="rtl"
            className="container mx-auto flex h-20 items-center justify-between px-4"
          >
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              layout
              className="flex items-center gap-6"
            >
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                layout
              >
                <Link href="/" className="flex items-center gap-2 no-underline">
                  <Image
                    src="/bn.png"
                    alt="AI Blog Logo"
                    width={60}
                    height={60}
                  />
                  <span className="text-xl font-bold">
                    <span className="text-[#06B8B7] no-underline">בלוג</span>
                    <span className="text-[#FB8524] ">נבון</span>
                  </span>
                </Link>
              </m.div>
              <m.nav
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                layout
                className="hidden md:flex items-center gap-6 relative"
              >
                <div className="relative">
                  <Link
                    href="/"
                    className="text-sm font-medium transition-colors hover:text-primary no-underline"
                  >
                    דף הבית
                  </Link>
                  {pathname === "/" && (
                    <m.div
                      layoutId="active-link"
                      className="absolute bottom-0 left-0 h-1 w-full bg-[#06B8B7]"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </div>
                {isAdmin && (
                  <div className="relative">
                    <Link
                      href="/admin/posts"
                      className="text-sm font-medium transition-colors hover:text-primary no-underline"
                    >
                      ניהול
                    </Link>
                    {pathname.startsWith("/admin") && (
                      <m.div
                        layoutId="active-link"
                        className="absolute bottom-0 left-0 h-1 w-full bg-[#06B8B7]"
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </div>
                )}
              </m.nav>
            </m.div>

            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              layout
              className="flex items-center gap-4"
            >
              <ModeToggle />
              {user ? (
                <Button variant="outline" onClick={signOut}>
                  התנתק
                </Button>
              ) : (
                <Link href="/auth">
                  <Button variant="outline">התחבר</Button>
                </Link>
              )}
            </m.div>
          </div>
          <m.div className="absolute bottom-0 left-0 h-1 bg-[#06B8B7]" />
        </m.header>
      )}
    </LazyMotion>
  );
}
