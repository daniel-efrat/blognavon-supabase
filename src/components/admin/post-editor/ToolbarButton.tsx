// components/post-editor/ToolbarButton.tsx
import type React from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  tooltipContent: string
  children: React.ReactNode
  variant?: ButtonProps["variant"]
  size?: ButtonProps["size"]
}

export function ToolbarButton({
  onClick,
  isActive,
  tooltipContent,
  children,
  variant = "ghost",
  size = "sm",
}: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={variant}
          size={size}
          onClick={onClick}
          className={isActive ? "bg-accent" : ""}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltipContent}</TooltipContent>
    </Tooltip>
  )
}
