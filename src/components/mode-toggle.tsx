"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">שנה ערכת נושא</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-[#F9FAFB] dark:bg-[#090A0C] text-right"
      >
        <DropdownMenuItem
          className="text-center hover:bg-accent hover:text-gray-50 cursor-pointer"
          dir="rtl"
          onClick={() => setTheme("light")}
        >
          בהיר
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-center hover:bg-accent hover:text-gray-50 cursor-pointer"
          dir="rtl"
          onClick={() => setTheme("dark")}
        >
          כהה
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-center hover:bg-accent hover:text-gray-50 cursor-pointer"
          dir="rtl"
          onClick={() => setTheme("system")}
        >
          מערכת
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
