import type { Metadata } from "next";
import localFont from "next/font/local";

import { AuthProvider } from "@/components/AuthProvider";
import { AppToaster } from "@/components/ui/app-toaster";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Save Website",
  description: "Project scaffold for Save Website",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(geistSans.variable, geistMono.variable)}
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <AuthProvider initialUser={user}>{children}</AuthProvider>
        <AppToaster />
      </body>
    </html>
  );
}
