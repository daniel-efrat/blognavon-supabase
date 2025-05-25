import type { Metadata } from "next";
import { Geist } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/header";
import { LoadingProvider } from "@/components/loading-overlay";
import { LoadingReset } from "@/components/loading-reset";
import { ThemeProvider } from "next-themes";
import { Background } from "@/components/Background";
import Footer from "@/components/footer";
import LenisProvider from "@/components/lenis-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const assistant = localFont({
  src: "../fonts/Assistant-VariableFont_wght.ttf",
  variable: "--font-assistant",
  display: "swap",
});

export const metadata: Metadata = {
  title: "בְּלוֹגנָבוֹן",
  description: "רעיונות חכמים, חדשנות טכנולוגית, ובינה מלאכותית",
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
      {
        url: "/favicon.png",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${assistant.variable} font-assistant antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LenisProvider>
            <Background>
              <div className="fixed inset-0 opacity-10 pointer-events-none dark:opacity-20" />
              <LoadingProvider>
                <Header />
                <LoadingReset />
                {children}
                <Footer />
              </LoadingProvider>
            </Background>
          </LenisProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
