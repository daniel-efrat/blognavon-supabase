// src/components/icons.tsx
import { LucideProps, Moon, SunMedium, Github, Chrome, Twitter, Loader2 } from 'lucide-react';

export const Icons = {
  sun: (props: LucideProps) => <SunMedium {...props} />,
  moon: (props: LucideProps) => <Moon {...props} />,
  github: (props: LucideProps) => <Github {...props} />,
  google: (props: LucideProps) => <Chrome {...props} />,
  twitter: (props: LucideProps) => <Twitter {...props} />,
  logo: (props: LucideProps) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
    </svg>
  ),
  spinner: (props: LucideProps) => <Loader2 {...props} />,
};

export type IconKeys = keyof typeof Icons;
