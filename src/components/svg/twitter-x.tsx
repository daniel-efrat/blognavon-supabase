import React from "react";
import { LucideProps } from "lucide-react";

export const TwitterXIcon = ({ size = 24, strokeWidth = 2, className, ...props }: LucideProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={(typeof size === 'number' ? size * 0.9 : size)} // Maintain original aspect ratio
      viewBox="0 0 20 18"
      fill="none"
      stroke="none"
      className={className}
      {...props}
    >
      <path 
        d="M15.75 0H18.8171L12.1171 7.6239L20 18H13.8286L8.99143 11.7082L3.46286 18H0.392857L7.55857 9.84269L0 0.00141865H6.32857L10.6943 5.75126L15.75 0ZM14.6714 16.1728H16.3714L5.4 1.73219H3.57714L14.6714 16.1728Z" 
        fill="currentColor"
      />
    </svg>
  );
};

export default TwitterXIcon;
