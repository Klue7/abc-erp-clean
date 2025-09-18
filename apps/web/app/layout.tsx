import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

import { AppToaster } from "@/components/app-toaster";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Genesis",
  description: "Super ERP",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var t=localStorage.getItem("theme");if(!t){t=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}if(t==="dark"){document.documentElement.classList.add("dark")}document.documentElement.style.colorScheme=t==="dark"?"dark":"light"}catch(e){}})();',
          }}
        />
      </head>
      <body className={cn(inter.variable, "bg-background text-foreground font-sans antialiased")}>
        <ClerkProvider>
          <ThemeProvider>
            <AppToaster />
            <SiteHeader />
            <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">{children}</main>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
