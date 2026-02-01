import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Scheherazade_New } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { DesktopLayoutWrapper } from "@/components/DesktopLayoutWrapper";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const arab = Scheherazade_New({
  variable: "--font-arab",
  weight: ["400", "700"],
  subsets: ["arabic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DISA - Daarussyifa Islamic Super App",
  description: "Aplikasi muslim dari Daarussyifa.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,

};

import { GoogleAuthInitializer } from "@/components/GoogleAuthInitializer";
import BackButtonHandler from "@/components/BackButtonHandler";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${arab.variable} antialiased font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AnalyticsTracker />
          <GoogleAuthInitializer />
          <BackButtonHandler />
          <DesktopLayoutWrapper>
            {children}
          </DesktopLayoutWrapper>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

