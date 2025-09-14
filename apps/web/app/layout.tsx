import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Navbar from "@/components/navbar";

export const metadata: Metadata = {
  title: "abc-erp-clean",
  description: "ERP web app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <div className="text-red-600 underline">
        <ClerkProvider>
          <Navbar />
          <div className="mx-auto max-w-6xl p-6">
            {children}
          </div>
        </ClerkProvider>
        </div>
      </body>
    </html>
  );
}