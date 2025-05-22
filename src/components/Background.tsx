"use client";

interface BackgroundProps {
  children: React.ReactNode;
}

export function Background({ children }: BackgroundProps) {
  return (
    <div className="relative min-h-screen w-full">
      {/* Default background color from theme */}
      <div className="absolute inset-0 bg-background" />

      {/* Overlay background pattern */}
      {/* <div 
        className="fixed dark:hidden inset-0 opacity-20 pointer-events-none"
        style={{ 
          backgroundImage: 'url(/dots-light.webp)',
          backgroundRepeat: 'repeat',
          backgroundSize: '70px',
          transform: 'scale(1.25)',
          transformOrigin: 'center',
        }}
      /> */}
      <div
        className="dark:fixed inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: "url(/dots.webp)",
          backgroundRepeat: "repeat",
          backgroundSize: "70px",
          transform: "scale(1.25)",
          transformOrigin: "center",
        }}
      />
      <div
        className="fixed inset-0 opacity-10 dark:opacity-20 pointer-events-none"
        style={{
          backgroundImage: "url(/pattern.png)",
          backgroundRepeat: "repeat",
          backgroundSize: "70px",
          transform: "rotate(45deg) scale(3)",
          transformOrigin: "center",
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
